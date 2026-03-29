# Voice Call Options For This System

## Current Baseline

This app already has:

- Supabase auth
- Supabase realtime
- Supabase storage
- text, image, video, and recorded voice messages

It does **not** currently have live voice calling.

That matters because a live call is a different feature from the current voice-note flow:

- current voice notes: record, upload, save in storage, play later
- live voice call: both users capture microphone audio and stream it in real time

## All Realistic Options

## Option 1: Keep It As Voice Notes Only

This is the simplest option if "something like voice call" only means faster audio communication.

What it means:

- improve the current voice-message flow
- add lock-to-record, hold-to-record, playback-before-send, retry, waveform, unread voice-note badge
- make voice notes feel more instant

Pros:

- lowest complexity
- works with the current architecture
- no TURN/STUN/media-call infrastructure needed
- cheapest to run

Cons:

- not a real call
- no simultaneous conversation
- no ringing, answer, or live presence

Best if:

- you mainly want emotional closeness / quick audio
- only two users use the app
- you want low maintenance

## Option 2: Push-To-Talk Live Audio

This is between voice notes and a full call.

What it means:

- one user holds a button and speaks
- the other user hears the audio live or near-live
- usually one person talks at a time

How it could work here:

- use Supabase realtime for signaling
- use WebRTC for the audio stream
- keep the UI simple: `Call`, `Hold to Talk`, `End`

Pros:

- much simpler than a full duplex call UI
- feels more live than voice notes
- lower UX complexity than a normal phone-style call

Cons:

- still needs WebRTC and probably TURN
- less natural than a normal call
- browser/mobile behavior still needs testing

Best if:

- you want a lightweight walkie-talkie style feature
- one-on-one communication is enough

## Option 3: Native Browser Voice Call With WebRTC

This is the most direct "real voice call in the app" option without depending on a call platform.

What it means:

- microphone capture with `getUserMedia`
- peer-to-peer audio with WebRTC
- Supabase realtime is used only for signaling
- TURN/STUN servers handle connection setup and NAT traversal

Main pieces needed:

- call state table or signaling events
- call invitation flow: `calling`, `ringing`, `accepted`, `declined`, `ended`
- WebRTC offer/answer exchange
- ICE candidate exchange
- audio elements for local/remote streams
- missed-call and active-call UI
- microphone permission handling
- reconnect / hang-up / timeout logic

Pros:

- full real-time call feature
- best cost profile if usage stays small
- fits the current browser-based app model
- no heavy backend media server if calls are 1-to-1

Cons:

- hardest custom implementation
- debugging WebRTC is non-trivial
- TURN service is practically required for reliability
- edge cases are significant: permissions, disconnects, tab sleep, mobile browsers

Best if:

- you want full control
- the app stays one-to-one only
- you are willing to implement and maintain call logic carefully

Recommended architecture for this option:

- Supabase auth: identify caller/callee
- Supabase realtime or a `calls` table: signaling
- WebRTC: actual audio transport
- TURN/STUN service: connectivity reliability

## Option 4: WebRTC With A Small Signaling/Call Backend

This is similar to Option 3, but instead of putting all signaling behavior directly in the frontend with Supabase events, you add a thin backend layer.

What it means:

- frontend still uses WebRTC for audio
- backend manages call sessions, tokens, validation, missed-call state, and possibly rate limits

Possible backend choices:

- Supabase Edge Functions
- a very small Node service
- serverless functions

Pros:

- cleaner call lifecycle handling
- easier to enforce permissions and call rules
- better long-term maintainability than a pure frontend signaling flow

Cons:

- more moving parts
- more setup than a pure static app

Best if:

- you want a serious call feature
- you expect this app to grow
- you want cleaner security boundaries

## Option 5: Use A Managed Voice/RTC SDK

This is usually the fastest path to a reliable call feature.

Typical providers:

- Daily
- Agora
- Twilio Voice / Twilio Video
- Stream Video
- LiveKit Cloud
- Jitsi as hosted/self-hosted variant

What it means:

- provider handles much of the hard RTC/media infrastructure
- your app handles auth, UI, call state, and user experience

Pros:

- fastest route to a polished result
- better call reliability
- less WebRTC debugging
- easier support for future upgrades like video calls

Cons:

- recurring cost
- vendor lock-in risk
- tokens/secrets must not live in `app.js`
- still requires integration work

Best if:

- you want the feature working sooner
- reliability matters more than owning the full stack
- you may later add video or group calls

Important for this repo:

- this app currently exposes live config in frontend code
- a managed call SDK must use server-issued tokens, not hardcoded private secrets in the browser

## Option 6: Embed Or Deep-Link To An External Call Service

This is the lowest-effort way to add "calling" without building RTC into the app.

Examples:

- open a private Jitsi room
- open a Telegram / WhatsApp / Meet call link
- generate a room link inside the chat

Pros:

- fastest to ship
- very low engineering effort
- avoids building media transport yourself

Cons:

- call experience is outside your app
- branding/control is weaker
- context switch for users

Best if:

- you want a practical solution immediately
- deep integration is not required

## Option 7: Hybrid Approach

This is often the best product path.

Phase example:

1. improve voice notes
2. add push-to-talk live audio
3. add full voice call later

Pros:

- delivers value early
- reduces risk
- lets you validate whether users really need full calls

Cons:

- takes multiple iterations
- some UI may later need redesign

Best if:

- you want steady progress instead of a big risky feature jump

## Comparison Summary

| Option | Real-time | Complexity | Cost | Reliability | Best For |
| --- | --- | --- | --- | --- | --- |
| Voice notes only | No | Low | Low | High | Simple audio messaging |
| Push-to-talk live audio | Partial | Medium | Low-Medium | Medium | Walkie-talkie feel |
| Pure WebRTC in app | Yes | High | Low-Medium | Medium | Full control for 1-to-1 |
| WebRTC + small backend | Yes | High | Medium | Medium-High | Cleaner long-term system |
| Managed RTC SDK | Yes | Medium | Medium-High | High | Fastest reliable real call |
| External service link | Yes | Low | Low-Medium | High | Fastest practical rollout |
| Hybrid phased plan | Mixed | Medium | Mixed | High | Safest product path |

## What Fits This Project Best

Because this app is:

- a static frontend
- already using Supabase
- apparently one-to-one
- already supporting voice messages

the best options are usually:

### Best balanced option

**Option 5: managed RTC SDK**

Why:

- fastest way to get a stable real call
- avoids a lot of raw WebRTC complexity
- easiest path if you later want video too

### Best fully custom option

**Option 3 or 4: WebRTC + Supabase signaling**

Why:

- fits the current stack
- good for a private two-user app
- lowest vendor dependence

### Best lowest-risk product option

**Option 7: hybrid**

Suggested sequence:

1. make voice notes much better
2. add call invitation UI and presence states
3. add full live calling after that

## Minimum Technical Requirements For A Real Voice Call

No matter which real-call option you choose, you will need:

- microphone permission handling
- caller/callee presence
- call invite state
- ringing UI
- accept/decline/end flow
- active call UI
- disconnect recovery
- missed call records
- mute state
- mobile-width testing
- browser compatibility testing

If using WebRTC directly, also required:

- STUN/TURN configuration
- signaling messages for offer/answer/ICE candidates

## Recommended Decision

If the goal is **real live calling inside this app**, choose one of these:

1. **Managed RTC SDK** if you want the fastest reliable result.
2. **WebRTC + Supabase signaling** if you want a custom in-app call system and accept higher implementation effort.

If the goal is only **something call-like**, choose:

1. **better voice notes**
2. **push-to-talk live audio**

## Suggested Next Step

If you want, the next useful document would be one of these:

- a **recommended architecture plan** for adding voice call to this exact codebase
- a **step-by-step implementation roadmap**
- a **database/schema and UI plan** for call invitations, ringing, and active calls
