// App bootstrap: Supabase client init, auth state listener, login/logout
// Split out of the original single app.js — see AGENTS.md for the module map.

// ============================================================================
// INITIALIZATION & AUTHENTICATION
// ============================================================================

function initializeApp() {
    state.supabaseClient = window.supabase.createClient(
        CONFIG.supabase.url,
        CONFIG.supabase.key
    );
}

window.login = async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showAlert("Please enter both email and password");
        return;
    }

    try {
        const { data, error } = await state.supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (!ALLOWED_EMAILS.includes(data.user.email)) {
            await state.supabaseClient.auth.signOut();
            showAlert("Access denied");
            return;
        }

        state.currentUserEmail = data.user.email;
        await requestNotificationPermission();

        // Apply per-user notification defaults once per device.
        // Aya: Chrome alerts off by default (she uses Telegram). Adham: on by default.
        if (localStorage.getItem(PUSH_DEFAULTS_APPLIED_KEY) === null) {
            if (isMyLove()) localStorage.setItem(CHROME_NOTIF_MUTED_KEY, "true");
            localStorage.setItem(PUSH_DEFAULTS_APPLIED_KEY, "true");
        }

        // Subscribe this device to Web Push — fire-and-forget so it never blocks login
        subscribeToWebPush();

        showChatScreen();
        await updatePresence(true);

        notifyPartner("just logged in 🔑");

        updateMenuMuteStates();
        if (isNobody()) {
            const telegramBtn = document.getElementById("telegram-mute-btn");
            if (telegramBtn) telegramBtn.style.display = "";
        }

        await initializeDailyTodo();
        await initializeChat();

        if (!isNobody()) setTimeout(showChecklistReminderPopup, 600);

    } catch (error) {
        console.error("Login error:", error);
        showAlert("Login failed: " + error.message);
    }
};

async function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
    }
}

async function updatePresence(isOnline) {
    try {
        await state.supabaseClient.from("presence").upsert({
            email: state.currentUserEmail,
            online: isOnline,
            last_seen: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error updating presence:", error);
    }
}

