# Mobile App Build Plan
## React Native + Android — Private Chat for Two

---

## Architecture Overview

The mobile app and the web app share **exactly the same Supabase backend** — same database, same auth, same realtime channels. A message sent from the app appears on the web instantly and vice versa. Nothing about the web app changes.

### Two separate delivery channels — important to understand

**Channel 1 — Real-time chat (app is open): instant, no FCM**
```
Send message → Supabase → websocket → recipient's app/web   < 100ms
```
When the app is open, Supabase Realtime delivers messages over a persistent websocket — the same mechanism the web app uses. FCM is completely uninvolved. This feels instant.

**Channel 2 — Push notification (app is closed): FCM**
```
Send message → webhook → Edge Function → FCM → Android OS notification   ~0.5–1.5s
```
FCM is only used to wake up the phone when the app is killed. A 1-second delay on a notification is fine — every messaging app (WhatsApp, Telegram, Signal) works this way.

### The one real risk: Edge Function cold starts

If the Edge Function hasn't been called recently, the first call can take 1–2 seconds to spin up. Fix: a pg_cron job pings it every 5 minutes so it stays warm.

```sql
-- Run once in Supabase SQL editor
select cron.schedule(
  'keep-push-warm',
  '*/5 * * * *',
  $$ select net.http_post(
       url := 'https://<project>.supabase.co/functions/v1/send-push',
       headers := '{"Authorization": "Bearer <anon-key>"}'::jsonb,
       body := '{"keepwarm": true}'::jsonb
     ) $$
);
```

Add to the top of the Edge Function:
```typescript
const payload = await req.json()
if (payload.keepwarm) return new Response("warm", { status: 200 })
```

With this cron in place, the Edge Function is always warm and notifications arrive in under 500ms consistently.

```
┌─────────────────┐         ┌──────────────────┐
│   Web App       │         │  Android App     │
└────────┬────────┘         └────────┬─────────┘
         │  realtime websocket (instant, always)
         └──────────┬────────────────┘
                    │
           ┌────────▼─────────┐
           │    Supabase       │
           │  • chat_messages  │
           │  • Realtime WS    │  ← instant delivery when app open
           │  • Storage        │
           │  • Edge Functions │  ← kept warm by pg_cron
           │  • push_tokens    │  ← new table
           └────────┬──────────┘
                    │  on INSERT → webhook (app closed only)
                    ▼
           ┌─────────────────┐
           │  Edge Function  │  warm, ~200ms response
           │  send-push      │
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │ Firebase (FCM)  │  ← free, no Play Store needed
           └────────┬────────┘
                    │
                    ▼
           ┌─────────────────┐
           │  Android Phone  │  ← notification arrives even if app killed
           └─────────────────┘
```

### Why "always live" works without a background service

The system lives on **Supabase's servers**, not on the phone. When a new message is inserted (from web or app), a database webhook immediately fires a Supabase Edge Function. That function calls Firebase Cloud Messaging (FCM), which delivers the notification to the Android device at the OS level — even if the app is completely closed. This is the same mechanism WhatsApp and Telegram use.

---

## What Needs to Be Built

### New in Supabase (backend additions)
| Item | What it is |
|---|---|
| `push_tokens` table | Stores the FCM token for each user's phone |
| `send-push` Edge Function | Fires on every new message, sends FCM notification |
| Database Webhook | Triggers the Edge Function on `chat_messages` INSERT |
| Firebase project | Free FCM credentials used by the Edge Function |

### New in the Web App (minimal)
| Item | What it does |
|---|---|
| "Download App" button in header menu | Links to the APK download URL |

### The React Native App
Full feature parity with the web app, plus native Android features.

---

## Phase 0 — One-Time Setup (Do Once)

### 0.1 Install tools
```bash
# Node.js 20+ required (download from nodejs.org if needed)
npm install -g @expo/cli
npm install -g eas-cli
```

### 0.2 Create the project
```bash
npx create-expo-app PrivateChat --template blank-typescript
cd PrivateChat
```

### 0.3 Set up Firebase (free)
1. Go to console.firebase.google.com
2. Create a new project — name it "PrivateChat"
3. Add an Android app — package name: `com.yourlove.privatechat`
4. Download `google-services.json` → place it in the project root
5. Go to Project Settings → Cloud Messaging → copy the **Server Key**
6. Save the Server Key as a Supabase secret named `FCM_SERVER_KEY`

### 0.4 EAS Build setup (for building the APK)
```bash
eas login
eas build:configure
```
Choose **Android** only.

---

## Phase 1 — Backend: Push Notification Infrastructure

### 1.1 Create `push_tokens` table in Supabase

Run this SQL in the Supabase SQL editor:

```sql
create table push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_email text not null unique,
  fcm_token text not null,
  updated_at timestamptz default now()
);

-- Allow both users to read/write their own token
alter table push_tokens enable row level security;
create policy "Users can manage own token"
  on push_tokens for all
  using (user_email = auth.jwt()->>'email');
```

### 1.2 Create the `send-push` Edge Function

In your Supabase project → Edge Functions → New Function → name it `send-push`.

```typescript
// supabase/functions/send-push/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const payload = await req.json()
  const newMessage = payload.record

  // Don't notify sender about their own message
  const senderEmail = newMessage.sender

  // Get the recipient's FCM token
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("fcm_token, user_email")
    .neq("user_email", senderEmail)

  if (!tokens || tokens.length === 0) return new Response("no tokens", { status: 200 })

  // Build notification body
  const senderName = senderEmail === "adhammorsy2311@gmail.com" ? "Nobody" : "My Love"
  const body =
    newMessage.message_type === "image"  ? "📷 Photo" :
    newMessage.message_type === "video"  ? "🎥 Video" :
    newMessage.message_type === "voice"  ? "🎤 Voice message" :
    newMessage.message_type === "system" ? "💕 Update" :
    (newMessage.text || "New message")

  // Send FCM to each recipient device
  const fcmKey = Deno.env.get("FCM_SERVER_KEY")!
  for (const { fcm_token } of tokens) {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${fcmKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: fcm_token,
        notification: {
          title: senderName,
          body,
          sound: "default",
        },
        data: {
          messageId: newMessage.id,
          sender: senderEmail,
        },
        android: {
          priority: "high",
          notification: {
            channel_id: "chat_messages",
            default_sound: true,
          }
        }
      }),
    })
  }

  return new Response("ok", { status: 200 })
})
```

Deploy it:
```bash
supabase functions deploy send-push
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key_here
```

### 1.3 Keep the Edge Function warm (eliminates cold-start delay)

Run this once in the Supabase SQL editor to schedule a keep-warm ping every 5 minutes:

```sql
select cron.schedule(
  'keep-push-warm',
  '*/5 * * * *',
  $$ select net.http_post(
       url := 'https://<your-project>.supabase.co/functions/v1/send-push',
       headers := '{"Authorization": "Bearer <your-anon-key>"}'::jsonb,
       body := '{"keepwarm": true}'::jsonb
     ) $$
);
```

### 1.4 Create the Database Webhook

In Supabase → Database → Webhooks → Create new:
- **Name**: `on-new-message`
- **Table**: `chat_messages`
- **Events**: INSERT only
- **URL**: `https://<your-project>.supabase.co/functions/v1/send-push`
- **HTTP Headers**: `Authorization: Bearer <your-anon-key>`

This webhook fires the Edge Function every time any message is inserted — whether from the web or the app.

---

## Phase 2 — App: Core Structure

### 2.1 Install dependencies
```bash
# Supabase
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

# Navigation
npx expo install @react-navigation/native @react-navigation/stack react-native-screens react-native-safe-area-context

# Push notifications
npx expo install expo-notifications expo-device

# Local database (SQLite)
npx expo install expo-sqlite

# Media
npx expo install expo-image-picker expo-camera expo-av expo-file-system expo-document-picker

# UI
npx expo install react-native-reanimated react-native-gesture-handler

# Firebase (for FCM token registration)
npx expo install @react-native-firebase/app @react-native-firebase/messaging
```

### 2.2 Folder structure
```
PrivateChat/
├── app/
│   ├── _layout.tsx          ← root navigation
│   ├── login.tsx            ← login screen
│   └── chat/
│       ├── index.tsx        ← main chat screen
│       ├── MessageList.tsx
│       ├── MessageBubble.tsx
│       ├── InputBar.tsx
│       └── TodoModal.tsx
├── lib/
│   ├── supabase.ts          ← Supabase client (same creds as web)
│   ├── database.ts          ← SQLite local cache
│   ├── notifications.ts     ← FCM token + notification setup
│   └── constants.ts         ← USER_NAMES, etc. (shared with web logic)
├── assets/
└── google-services.json     ← from Firebase setup
```

### 2.3 Supabase client — identical to the web app
```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const supabase = createClient(
  "https://twvwusthqhxnmghcnbjk.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // same anon key
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
)
```

---

## Phase 3 — Local Cache (SQLite)

Every message received or sent is stored locally. When the app opens it loads from SQLite immediately — no waiting for network.

### 3.1 Schema
```typescript
// lib/database.ts
import * as SQLite from "expo-sqlite"

const db = SQLite.openDatabaseSync("privatechat.db")

export function setupDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender TEXT NOT NULL,
      text TEXT,
      message_type TEXT DEFAULT 'text',
      created_at TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      reactions_json TEXT,
      reply_to_id TEXT,
      reply_to_text TEXT,
      reply_to_sender TEXT,
      media_url TEXT,
      local_media_path TEXT,   -- cached file path on device
      view_once INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
  `)
}

export function insertMessage(msg: any) {
  db.runSync(
    `INSERT OR REPLACE INTO messages
     (id, sender, text, message_type, created_at, read, reactions_json,
      reply_to_id, reply_to_text, reply_to_sender, media_url, view_once)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [msg.id, msg.sender, msg.text, msg.message_type, msg.created_at,
     msg.read ? 1 : 0, JSON.stringify(msg.reactions_json || null),
     msg.reply_to_id, msg.reply_to_text, msg.reply_to_sender,
     msg.media_url, msg.view_once ? 1 : 0]
  )
}

export function getRecentMessages(limit = 200): any[] {
  return db.getAllSync(
    `SELECT * FROM messages ORDER BY created_at ASC LIMIT ?`, [limit]
  )
}

export function getNewestTimestamp(): string | null {
  const row = db.getFirstSync(`SELECT MAX(created_at) as ts FROM messages`) as any
  return row?.ts ?? null
}
```

### 3.2 Load flow on app open
```typescript
// In chat/index.tsx
useEffect(() => {
  // Step 1 — instant: load from SQLite
  const cached = getRecentMessages(200)
  setMessages(cached)

  // Step 2 — background: fetch anything newer than last cached message
  const lastTs = getNewestTimestamp()
  syncNewMessages(lastTs).then(newMsgs => {
    newMsgs.forEach(insertMessage)
    setMessages(getRecentMessages(200))
  })

  // Step 3 — subscribe to realtime for live updates
  subscribeToChannel()
}, [])
```

---

## Phase 4 — Push Notifications

### 4.1 Register FCM token on login
```typescript
// lib/notifications.ts
import messaging from "@react-native-firebase/messaging"
import { supabase } from "./supabase"

export async function registerPushToken(userEmail: string) {
  // Request permission
  const granted = await messaging().requestPermission()
  if (!granted) return

  // Get the device's FCM token
  const token = await messaging().getToken()

  // Save it to Supabase so the Edge Function can find it
  await supabase.from("push_tokens").upsert({
    user_email: userEmail,
    fcm_token: token,
    updated_at: new Date().toISOString(),
  })

  // Refresh token if it changes
  messaging().onTokenRefresh(async newToken => {
    await supabase.from("push_tokens").upsert({
      user_email: userEmail,
      fcm_token: newToken,
      updated_at: new Date().toISOString(),
    })
  })
}
```

### 4.2 Notification channel setup (muted by default)
```typescript
import * as Notifications from "expo-notifications"

export async function setupNotificationChannel() {
  // Android notification channel — sound OFF by default
  await Notifications.setNotificationChannelAsync("chat_messages", {
    name: "Chat Messages",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,          // muted by default
    vibrationPattern: null,
    enableVibrate: false,
  })
}

// When user toggles notifications ON in the app menu:
export async function enableNotificationSound() {
  await Notifications.setNotificationChannelAsync("chat_messages", {
    name: "Chat Messages",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    enableVibrate: true,
  })
}
```

### 4.3 Handle tap on notification → open app at message
```typescript
// In _layout.tsx
useEffect(() => {
  // App opened from a notification tap
  messaging().onNotificationOpenedApp(remoteMessage => {
    const messageId = remoteMessage.data?.messageId
    if (messageId) {
      // Navigate to chat and scroll to that message
      navigation.navigate("chat", { scrollToMessageId: messageId })
    }
  })

  // App was killed and opened via notification
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage?.data?.messageId) {
      // Same navigation as above
    }
  })
}, [])
```

---

## Phase 5 — Media Caching

Images, videos, and voice messages are downloaded to the device the first time they're viewed, then served from the local file system on subsequent opens.

```typescript
// lib/mediaCache.ts
import * as FileSystem from "expo-file-system"

const CACHE_DIR = FileSystem.cacheDirectory + "media/"

export async function getCachedMedia(url: string, messageId: string): Promise<string> {
  const ext = url.split(".").pop()?.split("?")[0] ?? "bin"
  const localPath = CACHE_DIR + messageId + "." + ext

  const info = await FileSystem.getInfoAsync(localPath)
  if (info.exists) return localPath  // serve from cache

  // Download and cache
  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true })
  await FileSystem.downloadAsync(url, localPath)
  return localPath
}
```

---

## Phase 6 — Features to Build (in order)

| # | Feature | Notes |
|---|---|---|
| 1 | Login screen | Same email/password Supabase auth |
| 2 | Text messages (send + receive) | Realtime channel, same as web |
| 3 | Read receipts | Same Supabase UPDATE logic |
| 4 | Typing indicator | Same broadcast channel |
| 5 | Image messages | `expo-image-picker` + Supabase Storage |
| 6 | Voice messages | `expo-av` for record + playback |
| 7 | Video messages | `expo-av` + `expo-image-picker` |
| 8 | View-once media | Same logic — delete after view |
| 9 | Reactions | Same `reactions_json` column |
| 10 | Reply to message | Same `reply_to_*` columns |
| 11 | Message search | SQLite `LIKE` query locally |
| 12 | Daily checklist | Same template system |
| 13 | Streak counter | Same logic |
| 14 | Dark / light themes | React Native StyleSheet theming |
| 15 | Notification toggle | Enable/disable channel sound |
| 16 | Load older messages | Paginate from SQLite + Supabase |

---

## Phase 7 — Top Menu (Header)

The app header will have the same controls as the web, adapted for native:

```
[💕 Our Room]                [🔥 streak] [❤️ checklist] [⋮ menu]

⋮ menu contains:
  🔔  Notifications     [toggle ON/OFF]
  🔍  Search messages
  📜  Load all messages
  🎨  Theme             [Dark / Pink / Ink]
```

The notification toggle calls `enableNotificationSound()` or `setupNotificationChannel()` (muted version) based on the current state, stored in AsyncStorage.

---

## Phase 8 — APK Build and Distribution

### 8.1 Build the APK
```bash
# One-time: configure EAS
eas build:configure

# Build a release APK (runs on Expo's cloud servers, takes ~15 min)
eas build --platform android --profile preview
```

This produces a `.apk` file hosted on Expo's servers. Download it.

### 8.2 Host the APK

Option A — GitHub Releases (free, permanent link):
1. Create a GitHub repository (can be private)
2. Go to Releases → Create new release
3. Upload the `.apk` file
4. Copy the direct download link

Option B — Google Drive or any file host: just get a direct download `.apk` URL.

### 8.3 Add "Download App" button to the web

In `index.html`, add to the header tools menu:

```html
<a href="https://github.com/you/repo/releases/latest/download/app.apk"
   class="header-tool-item" download>
  <span class="header-tool-bubble">
    <span class="material-icons">android</span>
  </span>
  <span class="header-tool-copy">
    <span class="header-tool-label">Download App</span>
    <span class="header-tool-note">Android · install on your phone</span>
  </span>
</a>
```

### 8.4 Install on phone
1. Tap the "Download App" link from the web on the phone's browser
2. Open the downloaded `.apk` file
3. Android will ask to "Allow from this source" → allow
4. Install — done

### 8.5 Updating the app
When you build a new version:
1. Run `eas build` again
2. Replace the `.apk` at the same download link (new GitHub release)
3. Each user just re-downloads and installs over the old version
4. Android keeps all data when installing over an existing app

---

## Phase 9 — app.json Configuration

```json
{
  "expo": {
    "name": "Our Room 💕",
    "slug": "private-chat",
    "version": "1.0.0",
    "android": {
      "package": "com.yourlove.privatechat",
      "versionCode": 1,
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    "plugins": [
      "expo-notifications",
      "@react-native-firebase/app",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ff82b7",
          "defaultChannel": "chat_messages"
        }
      ]
    ]
  }
}
```

---

## Build Order Summary

```
Week 1
  Day 1-2:  Phase 0 + Phase 1 (Firebase setup + Supabase Edge Function)
  Day 3-4:  Phase 2 (project setup, auth, basic text chat working)
  Day 5:    Phase 3 (SQLite local cache)

Week 2
  Day 1-2:  Phase 4 (push notifications end-to-end)
  Day 3-4:  Phase 5 + media messages (images, voice, video)
  Day 5:    Phase 6 features (reactions, reply, search)

Week 3
  Day 1-2:  Phase 6 cont. (daily checklist, streak)
  Day 3:    Phase 7 (header menu, notification toggle, themes)
  Day 4:    Phase 8 (build APK, test install, add download button to web)
  Day 5:    Testing, polish, bug fixes
```

---

## Key Things to Know Before Starting

**Same database, not a copy.** The web and app read/write the same `chat_messages` table. No syncing between two databases — it's one shared database.

**Telegram notifications stay.** The new FCM notifications run alongside the existing Telegram bot. Both fire on the same message insert. You can disable Telegram later once the app notifications are proven reliable.

**Notifications are muted by default.** On first install the Android notification channel has no sound or vibration. The user enables it from the app's menu. This matches your requirement.

**No Play Store needed.** The APK installs directly via the download link. Android may show a warning about "unknown sources" — this is normal for private APKs. Both users just need to allow it once.

**Local media fills space over time.** The SQLite cache and media files grow as the chat grows. Worth adding a "Clear media cache" option in settings eventually (keeps messages but deletes downloaded media files).

**FCM is free.** Firebase Cloud Messaging has no cost for this volume. The free tier handles millions of messages per month — two users will never come close.
