# Local-First Architecture Plan
**"Just the Two of Us" — Private Chat App**
*Report date: 2026-06-16 | Status: Planned, not yet implemented*

---

## Overview

The goal is to shift the app from **network-first** (everything fetched from Supabase on every load) to **local-first** (all data stored on the device, Supabase acts as real-time sync and backup).

### What this achieves
- App opens and is fully usable in under 100ms, even with no internet
- Messages, images, and voice messages load from device storage — no network wait
- Supabase remains the live sync layer and cross-device backup
- Outgoing messages queue locally if offline and sync when reconnected

---

## Current Architecture

```
Open app
  → authenticate with Supabase
  → fetch last 200 messages from Supabase (network)
  → render messages
  → connect to Supabase Realtime for live updates

Open image/voice
  → request signed URL from Supabase Storage (network)
  → load media from URL (network)
```

**Problems:**
- Every load requires a network round-trip before anything is visible
- Media is re-fetched every time it's viewed
- No offline support — app is unusable without internet

---

## New Architecture (Local-First)

```
Open app
  → load all messages from IndexedDB instantly  ← NEW (< 100ms)
  → render messages immediately
  → connect Supabase in background              ← same, but non-blocking
  → fetch only messages newer than last sync    ← NEW (delta fetch)
  → merge new messages into view + IndexedDB    ← NEW

Open image/voice
  → check local Cache API for blob             ← NEW
  → if cached: load from device instantly      ← NEW
  → if not cached: fetch from Supabase, cache it for next time ← NEW

Send message (offline)
  → save to local outbox queue                 ← NEW
  → show in UI immediately
  → sync to Supabase when connection returns   ← NEW
```

---

## Technology Stack (No New Dependencies)

| Technology | Role | Already used? |
|-----------|------|--------------|
| **IndexedDB** | Store messages and metadata locally | No — browser built-in |
| **Cache API** | Store image/voice/video blobs locally | Partial — SW uses it for static assets |
| **Supabase Realtime** | Live sync between devices | Yes |
| **Supabase Storage** | Master media storage + backup | Yes |
| **Service Worker** | Intercept media requests, serve from cache | Yes — needs extension |

No new libraries or backend services required.

---

## Data Storage Plan

### Messages (IndexedDB — `messages` table)
Stores every message with full content.

```
id, sender, text, message_type, created_at,
image_url, video_url, voice_url, voice_duration,
view_once, viewed_by, reactions_json,
reply_to_id, reply_to_sender, reply_to_text,
read, synced_at
```

### Media (Cache API — `media-cache`)
Stores actual binary blobs, keyed by file path.

```
chat-images/{path}  → Blob
voice-messages/{path} → Blob
chat-videos/{path}  → Blob (with eviction policy)
```

### Sync State (localStorage)
```
last_message_sync_at   → ISO timestamp
last_media_cache_clean → ISO timestamp
```

---

## What Changes in the Code

| Area | Change | Effort |
|------|--------|--------|
| `loadInitialMessages()` | Read IndexedDB first, then fetch delta from Supabase | Medium |
| `handleNewMessage()` | Already renders — add save-to-IndexedDB call | Small |
| `confirmImageSend()` | After upload, cache blob locally | Small |
| `sendVoiceRecording()` | After upload, cache blob locally | Small |
| `getSignedUrl()` | Check Cache API first, fetch + cache on miss | Medium |
| Sync engine | New: delta fetch, merge logic, conflict resolution | Medium |
| Offline queue | New: hold outgoing sends, flush on reconnect | Medium |
| SW media caching | Extend service worker to serve cached media blobs | Medium |
| Video eviction | Evict oldest videos when cache exceeds threshold | Small |

**No changes needed to:** Supabase schema, Realtime subscriptions, authentication, UI, existing features.

---

## Storage Estimate

| Content | Per item | 1 year estimate | Concern level |
|---------|----------|----------------|---------------|
| Text messages | ~0.5 KB | ~5 MB (10k msgs) | None |
| Voice messages | 0.1–2 MB | ~50 MB | Low |
| Images | 1–5 MB each | 100–500 MB | Medium |
| Videos | 10–100 MB each | 1–10 GB | High |

### Recommendation
- **Cache everything:** text, voice, images
- **Videos:** cache last 20 only, evict older ones automatically
- **Storage quota:** modern Android/desktop browsers allow several GB for installed PWAs

---

## Sync Logic

### On app open
1. Render from IndexedDB immediately
2. Read `last_message_sync_at` from localStorage
3. Fetch from Supabase: `created_at > last_message_sync_at`
4. Merge new messages into IndexedDB and UI
5. Update `last_message_sync_at`

### On new message (Realtime)
1. Render in UI (same as now)
2. Save to IndexedDB
3. If media: fetch blob and save to Cache API

### On send (offline)
1. Save message to local outbox
2. Show in UI immediately with "pending" indicator
3. On reconnect: flush outbox to Supabase
4. On success: mark as synced, update IndexedDB

### Conflict resolution
Simple rule: **Supabase is the truth.** Local writes that fail to sync get flagged; Supabase data always wins on conflict.

---

## Implementation Phases

### Phase 1 — Messages (high impact, low risk)
- IndexedDB setup
- Load messages from local on startup
- Delta sync from Supabase
- Save incoming messages locally
- Estimated: ~300 lines of new code

### Phase 2 — Media caching (high impact, medium risk)
- Cache images and voice on first view
- Serve from cache on subsequent views
- Video eviction policy
- Estimated: ~150 lines of new code

### Phase 3 — Offline send queue (medium impact, medium risk)
- Queue outgoing messages when offline
- Flush queue on reconnect
- Pending state indicator in UI
- Estimated: ~100 lines of new code

---

## What You Gain vs. What It Costs

| | Now | After |
|-|-----|-------|
| App startup | 2–5 sec (network) | < 100ms (local) |
| Image load | 1–3 sec (network) | Instant (cached) |
| Voice load | 1–2 sec (network) | Instant (cached) |
| Offline reading | Not possible | Full history available |
| Offline sending | Not possible | Queued + synced |
| Cross-device sync | Real-time (Supabase) | Real-time (Supabase) — unchanged |
| Development effort | — | ~1–2 days |
| New infrastructure | — | None required |

---

## Decision

> **Recommended approach:** Implement in phases starting with Phase 1 (messages only).
> This delivers the biggest user-facing improvement (fast load) with the lowest risk.
> Phase 2 and 3 can follow incrementally.
>
> No Supabase changes, no new services, no new dependencies required.
> The existing codebase structure supports this cleanly.
