# Repository Guidelines

## Project Structure & Module Organization
This repository is a small static web app. Keep the structure flat unless there is a clear reason to split files.

- `index.html`: page structure, modal markup, and external CDN includes.
- `style.css`: all visual styling, layout, and responsive rules.
- `app.js`: application logic, Supabase auth/realtime/storage flows, UI state, and DOM event handlers.
- `*.png`, `*.jpg`: local media assets used by the UI.

If the codebase grows, prefer moving new logic into focused files such as `js/chat.js` or `css/components.css` instead of expanding `app.js` indefinitely.

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
