# Feature Discussions

## 1. Snapchat-Style Character at the Text Box

A small animated character that lives next to the input area and reacts to what's happening — idle when nothing is typed, an animation when typing, a thinking pose when paused mid-message, and a happy/send reaction when the message is sent.

### Two realistic approaches

**Option A — Lottie animations (recommended)**
- Use the [Lottie](https://lottiefiles.com) format: lightweight JSON animation files that play in the browser via a tiny library (`lottie-web`, ~60KB)
- You would have separate Lottie files per state: `idle.json`, `typing.json`, `thinking.json`, `happy.json`
- State switching is just `animation.playSegments([start, end])` on textarea events
- **Trade-off:** depends on an external library and you need the animation assets (free ones available, custom ones need a designer)

**Option B — Pure CSS/SVG character**
- A hand-coded SVG character with CSS `@keyframes` for each state
- Zero dependencies, fully custom to the app's pink/purple aesthetic
- More development time but total creative control
- **Trade-off:** building each pose/animation from scratch is time-intensive

### State triggers (same for both options)
| State | Trigger |
|---|---|
| Idle | No input focused, textarea empty |
| Typing | User is actively typing (`input` event fires) |
| Thinking | Paused for 2+ seconds with text in textarea |
| Happy/send | Message sent successfully |
| Waiting | Other person's typing indicator is showing |

---

## 2. React Native — Making It a Real Mobile App

Building the exact same app in React Native gives you a downloadable app on iOS and Android, native push notifications, and local device storage so the app loads from cache instantly.

### Stack recommendation: Expo + React Native

**Why Expo:**
- No Xcode/Android Studio required to start
- `expo build` creates .apk and .ipa files for distribution
- All the native APIs you need (camera, storage, notifications) are pre-wrapped

### What maps directly

| Current (Web) | React Native equivalent |
|---|---|
| Supabase JS client | Same library, works identically |
| Realtime channel (`broadcast`) | Same — no changes needed |
| `localStorage` | `AsyncStorage` or `expo-secure-store` |
| `<img>` / `<video>` | `<Image>` / `<Video>` (expo-av) |
| Telegram bot notifications | `expo-notifications` + Supabase Edge Function |
| CSS animations | React Native `Animated` API or `react-native-reanimated` |

### Local storage / offline-first pattern

```
App opens
  → Load last N messages from AsyncStorage (instant)
  → Show in UI immediately
  → Connect to Supabase in background
  → Fetch messages newer than last cached
  → Merge + update UI
  → Subscribe to realtime channel
```

This makes the app feel instant even on slow connections.

### Migration effort estimate

| Phase | Work |
|---|---|
| Auth + basic chat (send/receive text) | ~3–4 days |
| Images, video, voice messages | ~3–4 days |
| Reactions, reply, typing indicator | ~1–2 days |
| Daily checklist system | ~2–3 days |
| Local cache + offline-first | ~1–2 days |
| Push notifications (replace Telegram) | ~1 day |
| **Total** | **~2–3 weeks focused** |

### Trade-offs to keep in mind
- All UI must be rewritten — no HTML/CSS, everything is React Native components
- Business logic (message handling, reactions, todo) ports almost 1:1
- For iOS distribution you eventually need an Apple Developer account ($99/year) or use TestFlight for private sharing
- Android APK can be shared directly (no store needed for private use)
