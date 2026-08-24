// Top-level DOMContentLoaded / global event listener wiring (load this file last)
// Split out of the original single app.js — see AGENTS.md for the module map.

// ============================================================================
// PART 3 — EVENT LISTENERS
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    injectDynamicStyles();
    applyTheme(getStoredTheme());
    applyAppViewLayout(getStoredAppViewPreference());
    syncViewportLayout();
    setupElephantInteraction();
    setupAutoLoadScroll();
    startLoginFifiSpeech();

    const msgTextarea = document.getElementById("msg");

    // Initial state: show mic, hide send (no text yet)
    updateSendVoiceToggle("");

    if (msgTextarea) {
        msgTextarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
        });

        msgTextarea.addEventListener("input", (e) => {
            const ta = e.target;
            autoResizeTextarea(ta);
            updateSendVoiceToggle(ta.value);
            broadcastTyping(ta.value.trim().length > 0);
            elephantOnTypingInput(ta.value.trim().length > 0);

            const text = ta.value;
            if (text.trim().length > 0) {
                ta.style.direction = isArabic(text) ? "rtl" : "ltr";
                ta.style.textAlign = isArabic(text) ? "right" : "left";
            } else {
                ta.style.direction = "ltr";
                ta.style.textAlign = "left";
            }
        });

        msgTextarea.addEventListener("scroll", () => {
            updateComposerScrollbar(msgTextarea);
        });

        updateComposerScrollbar(msgTextarea);
    }

    // Escape closes any open overlay
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        setHeaderToolsOpen(false);

        const checks = [
            { id: "image-viewer-modal", fn: closeImageViewer },
            { id: "video-viewer-modal", fn: closeVideoViewer },
            { id: "image-preview-modal", fn: cancelImageSend },
            { id: "video-preview-modal", fn: cancelVideoSend },
            { id: "attachment-menu", fn: closeAttachmentMenu },
            { id: "todo-modal", fn: closeTodoModal },
            { id: "search-bar", fn: closeSearch },
            { id: "add-to-home-modal", fn: () => closeAddToHomeModal() },
            { id: "checklist-popup", fn: closeChecklistPopup }
        ];

        for (const { id, fn } of checks) {
            const el = document.getElementById(id);
            if (el && el.style.display === "flex") { fn(); break; }
        }
    });

    // Arrow keys navigate search results
    document.addEventListener("keydown", (e) => {
        const bar = document.getElementById("search-bar");
        if (!bar || bar.style.display !== "flex") return;
        if (e.key === "ArrowDown") { e.preventDefault(); searchNext(); }
        if (e.key === "ArrowUp") { e.preventDefault(); searchPrevious(); }
    });

    document.addEventListener("fullscreenchange", () => {
        updateAppViewButton();
    });

    window.addEventListener("resize", syncViewportLayout);

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", syncViewportLayout);
        window.visualViewport.addEventListener("scroll", syncViewportLayout);
    }

    document.addEventListener("focusin", (event) => {
        if (event.target?.matches("textarea, input, [contenteditable='true']")) {
            setTimeout(syncViewportLayout, 50);
            setTimeout(ensureComposerVisible, 80);
            setTimeout(syncViewportLayout, 180);
            setTimeout(ensureComposerVisible, 220);
            setTimeout(ensureComposerVisible, 380);
        }
    });

    document.addEventListener("focusout", () => {
        setTimeout(syncViewportLayout, 120);
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".header-tools")) {
            setHeaderToolsOpen(false);
        }
        if (!event.target.closest(".attachment-dock")) {
            closeAttachmentMenu();
        }
        if (!event.target.closest(".reaction-picker, .reaction-chip")) {
            closeReactionPickers();
        }
        if (!event.target.closest(".msg-context-menu, .msg-menu-btn")) {
            closeMessageContextMenu();
        }
    });
});

window.addEventListener("beforeunload", async () => {
    if (state.currentUserEmail) await updatePresence(false);
    if (state.channel) state.channel.unsubscribe();
    if (state.todoDayWatcher) clearInterval(state.todoDayWatcher);
    if (state.todoReminderWatcher) clearInterval(state.todoReminderWatcher);
});
