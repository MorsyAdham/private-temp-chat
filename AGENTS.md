# Repository Guidelines

## Project Structure & Module Organization
This repository is a small static web app. Keep the structure flat unless there is a clear reason to split files.

- `index.html`: page structure, modal markup, and external CDN includes.
- `style.css`: all visual styling, layout, and responsive rules.
- `js/`: application logic, split into focused files loaded in order by `index.html`. Each
  file relies on globals defined by the ones before it — there are no ES module imports/exports,
  it's plain scripts sharing one global scope, same as the original single `app.js` did.
  - `config.js` — config constants, `USER_NAMES`, themes list, todo/category constants
  - `auth.js` — app bootstrap: Supabase client init, auth state listener, login/logout
  - `utils.js` — shared utility functions: formatting, DOM helpers, web push, escaping, etc.
  - `chat-core.js` — chat load/pagination, realtime subscription, search, reply, sending text
  - `render.js` — message rendering, typing indicator, elephant companion, message context menu
  - `receipts-notifications.js` — read receipts and in-app/push/Telegram notifications
  - `ui-todo.js` — general UI helpers plus the daily checklist / todo-list feature
  - `media.js` — attachment menu, image handling, video handling, voice recording
  - `theme-pwa.js` — dynamic CSS injection for newer features, and Add-to-Home-Screen flow
  - `events.js` — top-level `DOMContentLoaded` / global event listener wiring (must load last)
- `supabase/functions/`: Edge Functions that hold secrets the client must never see directly
  (`send-push`, `send-telegram`) — both require the caller to be an authenticated, allow-listed user.
- `*.png`, `*.jpg`: local media assets used by the UI.

Keep new logic in the right existing `js/` file by feature area; only add a new file for a
genuinely new feature area, and wire it into `index.html`'s script list (and `sw.js`'s `STATIC`
precache list) in the right load-order position.

## Build, Test, and Development Commands
There is no package-managed build step in this repository. Development is done by serving the files locally in a browser.

- `python -m http.server 8000`: run a local static server from the repo root.
- `start index.html`: quick manual open on Windows when a server is not required.

Use the local server when testing login, realtime updates, uploads, notifications, or any browser feature sensitive to origin/security rules.

## Coding Style & Naming Conventions
Use 4-space indentation in HTML, CSS, and JavaScript to match the existing files. Prefer:

- `const`/`let`, never `var`
- camelCase for variables and functions such as `loadInitialMessages`
- UPPER_SNAKE_CASE for shared constants such as `CONFIG` and `USER_NAMES`
- clear section banners in `app.js` for major feature areas

Keep DOM ids and class names descriptive, lowercase, and hyphenated, for example `reply-preview` or `load-more-btn`.

## Testing Guidelines
There is no automated test suite yet. Validate changes with focused manual testing in the browser:

- login/logout flow
- sending text, images, video, and voice notes
- search, reload, pagination, and panic mode
- responsive layout on mobile-width and desktop-width screens

When adding logic-heavy behavior, consider introducing a lightweight test setup before expanding the feature further.

## Commit & Pull Request Guidelines
Git history is not available in this folder, so use a simple imperative commit style: `Add voice message retry handling`. Keep each commit scoped to one change.

Pull requests should include a short summary, affected files, manual test notes, and screenshots or screen recordings for UI changes.

## Security & Configuration Tips
`app.js` currently contains live service configuration. Do not add new secrets to tracked files. Prefer moving credentials to environment-specific configuration before making broader changes, and review Supabase/Telegram access carefully before sharing the repository.
