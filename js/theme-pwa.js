// Dynamic CSS injection for newer features, and Add-to-Home-Screen flow
// Split out of the original single app.js — see AGENTS.md for the module map.

// ============================================================================
// PART 3 — DYNAMIC CSS INJECTION
// (Adds styles that the static CSS file doesn't cover for new features)
// ============================================================================

function injectDynamicStyles() {
    const style = document.createElement("style");
    style.textContent = `
    /* --- Date Separator --- */
    .date-separator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 4px;
      pointer-events: none;
    }
    .date-separator::before,
    .date-separator::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .date-separator span {
      padding: 4px 12px;
      background: var(--message-bg);
      border-radius: 12px;
      font-size: 12px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    /* --- Reply button (hover, desktop) --- */
    .message-bubble { position: relative; }

    .msg-reply-btn {
      display: none;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: none;
      background: var(--message-bg);
      color: var(--text-secondary);
      cursor: pointer;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 5px rgba(0,0,0,0.35);
      transition: background 0.2s, color 0.2s;
      z-index: 5;
    }
    .msg-reply-btn .material-symbols-outlined { font-size: 18px; }
    .message-bubble.sender  .msg-reply-btn { left: -42px; }
    .message-bubble.receiver .msg-reply-btn { right: -42px; }
    .message-bubble:hover .msg-reply-btn { display: flex; }
    .msg-reply-btn:hover { background: var(--hover); color: var(--text-primary); }

    /* --- Link preview card --- */
    .link-preview {
      margin-top: 8px;
      padding: 10px 12px;
      background: rgba(0,0,0,0.25);
      border-radius: 8px;
      border-left: 3px solid var(--primary);
      cursor: pointer;
      transition: background 0.15s;
    }
    .link-preview:hover { background: rgba(0,0,0,0.38); }
    .link-preview-title {
      font-weight: 600;
      font-size: 13px;
      color: var(--primary);
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .link-preview-url {
      font-size: 11px;
      color: var(--text-secondary);
      word-break: break-all;
    }

    /* --- Message text links --- */
    .message-text a {
      color: #53BDEB;
      text-decoration: none;
      border-bottom: 1px solid rgba(83,189,235,0.3);
    }
    .message-text a:hover { border-bottom-color: #53BDEB; }

    /* --- Voice message bubble --- */
    .voice-message { min-width: 200px; }

    /* --- Video container cursor --- */
    .message-video-container { cursor: pointer; }

    /* --- Smooth swipe transition --- */
    .message-bubble { will-change: transform; }
  `;
    document.head.appendChild(style);
}

// ============================================================================
// ADD TO HOME SCREEN
// ============================================================================

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    // Update button note to signal it's ready to install
    const note = document.getElementById("add-home-note");
    if (note) note.textContent = "Ready";
    const icon = document.getElementById("add-home-icon");
    if (icon) icon.textContent = "download";
});

window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    const note = document.getElementById("add-home-note");
    if (note) note.textContent = "Installed";
    const icon = document.getElementById("add-home-icon");
    if (icon) icon.textContent = "check_circle";
});

window.addToHomeScreen = function () {
    setHeaderToolsOpen(false);
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then(result => {
            if (result.outcome === "accepted") deferredInstallPrompt = null;
        });
    } else {
        document.getElementById("add-to-home-modal").style.display = "flex";
    }
};

window.closeAddToHomeModal = function (e) {
    if (!e || e.target === document.getElementById("add-to-home-modal")) {
        document.getElementById("add-to-home-modal").style.display = "none";
    }
};

