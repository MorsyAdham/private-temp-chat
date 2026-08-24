// Read receipts and in-app/push/Telegram notifications
// Split out of the original single app.js — see AGENTS.md for the module map.

// ============================================================================
// PART 3 — READ RECEIPTS
// ============================================================================

async function markMessageAsRead(messageId) {
    try {
        await state.supabaseClient.from("chat_messages").update({ read: true }).eq("id", messageId);
        state.unreadMessages.delete(messageId);
    } catch (err) { console.error("markMessageAsRead:", err); }
}

async function markVisibleMessagesAsRead() {
    if (!state.unreadMessages.size) return;
    try {
        const ids = Array.from(state.unreadMessages);
        await state.supabaseClient
            .from("chat_messages")
            .update({ read: true })
            .in("id", ids)
            .neq("sender", state.currentUserEmail);
        state.unreadMessages.clear();
    } catch (err) { console.error("markVisibleMessagesAsRead:", err); }
}

// ============================================================================
// PART 3 — NOTIFICATIONS
// ============================================================================

async function showNotification(title, body) {
    if (localStorage.getItem(CHROME_NOTIF_MUTED_KEY) === "true") return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    // Note: these are foreground-only notifications (app must be open).
    // Background notifications require Web Push — handled via Telegram instead.
    try {
        if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
                reg.showNotification(title, { body, vibrate: [100, 50, 100] });
                return;
            }
        }
    } catch (_) {}
    new Notification(title, { body });
}

async function sendTelegramNotification(title, body = "") {
    if (localStorage.getItem(TELEGRAM_MUTED_KEY) === "true") return;
    try {
        await state.supabaseClient.functions.invoke("send-telegram", { body: { title, body } });
    } catch (err) { console.error("Telegram:", err); }
}

function isMyLove() { return state.currentUserEmail === "ayaessam487@gmail.com"; }

// Sends Chrome push + Telegram (Telegram only if current user is My Love)
function notifyPartner(body) {
    const label = (USER_NAMES[state.currentUserEmail] || "Someone") + " 💕";
    sendWebPushToRecipient(label, body);
    if (isMyLove()) sendTelegramNotification(label, body);
}

// ---- CHECKLIST POPUP ----
function showChecklistReminderPopup() {
    if (localStorage.getItem(CHECKLIST_POPUP_MUTED_KEY) === "true") return;
    const popup = document.getElementById("checklist-popup");
    if (!popup) return;
    popup.style.display = "flex";
    // Force reflow so the CSS animation triggers
    void popup.offsetWidth;
}

window.closeChecklistPopup = function () {
    const popup = document.getElementById("checklist-popup");
    if (popup) popup.style.display = "none";
};

window.closeTodoModalAndOpen = function () {
    closeChecklistPopup();
    openTodoModal();
};

// ---- NOTIFICATION TOGGLES ----
window.toggleChecklistPopupMute = function () {
    const muted = localStorage.getItem(CHECKLIST_POPUP_MUTED_KEY) === "true";
    localStorage.setItem(CHECKLIST_POPUP_MUTED_KEY, String(!muted));
    updateMenuMuteStates();
};

window.toggleTelegramMute = function () {
    const muted = localStorage.getItem(TELEGRAM_MUTED_KEY) === "true";
    localStorage.setItem(TELEGRAM_MUTED_KEY, String(!muted));
    updateMenuMuteStates();
};

window.toggleChromeNotifMute = async function () {
    const muted = localStorage.getItem(CHROME_NOTIF_MUTED_KEY) === "true";
    const turningOff = !muted;
    localStorage.setItem(CHROME_NOTIF_MUTED_KEY, String(turningOff));
    updateMenuMuteStates();

    // Turning OFF → remove this device's push subscription so no pushes are sent to it
    // Turning ON → re-subscribe so pushes resume
    try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (turningOff) {
            if (sub) {
                await sub.unsubscribe();
                await state.supabaseClient.from("push_subscriptions")
                    .delete()
                    .eq("user_email", state.currentUserEmail)
                    .eq("endpoint", sub.endpoint);
            }
        } else {
            await subscribeToWebPush();
        }
    } catch (err) {
        console.warn("Chrome notif toggle:", err);
    }
};

window.logout = async function () {
    try {
        if (state.currentUserEmail) {
            notifyPartner("logged out 👋");
            await updatePresence(false);
        }
        if (state.channel) { state.channel.unsubscribe(); state.channel = null; }
        if (state.todoDayWatcher) clearInterval(state.todoDayWatcher);
        if (state.todoReminderWatcher) clearInterval(state.todoReminderWatcher);
        await state.supabaseClient.auth.signOut();
    } catch (err) { console.error("Logout:", err); }
    window.location.reload();
};

function updateMenuMuteStates() {
    const checklistMuted = localStorage.getItem(CHECKLIST_POPUP_MUTED_KEY) === "true";
    document.getElementById("checklist-popup-mute-btn")?.classList.toggle("tool-muted", checklistMuted);

    const chromeMuted = localStorage.getItem(CHROME_NOTIF_MUTED_KEY) === "true";
    document.getElementById("chrome-notif-mute-btn")?.classList.toggle("tool-muted", chromeMuted);

    const telegramMuted = localStorage.getItem(TELEGRAM_MUTED_KEY) === "true";
    document.getElementById("telegram-mute-btn")?.classList.toggle("tool-muted", telegramMuted);
}

