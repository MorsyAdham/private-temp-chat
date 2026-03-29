// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    supabase: {
        url: "https://twvwusthqhxnmghcnbjk.supabase.co",
        key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnd1c3RocWh4bm1naGNuYmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzUwMTAsImV4cCI6MjA4MTkxMTAxMH0.zPw0OH5TaWCM_SLGQYpUAp00mVZwamR13KPDs_HRb7s"
    },
    telegram: {
        botToken: "8551799267:AAF3DHlffeUhTCWYV5J5c0AoYRbDmfNkodo",
        chatId: "5637769598"
    },
    pagination: {
        initialLoad: 200,
        pageSize: 200
    }
};

const USER_NAMES = {
    "adhammorsy2311@gmail.com": "Nobody",
    "ayaessam487@gmail.com": "My Love",
    "joboffers540@gmail.com": "JobOffers"
};

const ALLOWED_EMAILS = Object.keys(USER_NAMES);

const DAILY_TODO_TEMPLATE = {
    id: "my-love-daily-default",
    owner: "adhammorsy2311@gmail.com",
    targetUser: "ayaessam487@gmail.com",
    title: "🌸 Daily Checklist",
    items: [
        { id: "put-medicine-in-bag", text: "Put your medicine in your bag", emoji: "💊", order: 1, active: true },
        { id: "eat-breakfast", text: "Eat a good breakfast", emoji: "🥐", order: 2, active: true },
        { id: "take-morning-medicine", text: "Take your morning medicine", emoji: "🌞", order: 3, active: true },
        { id: "enjoy-coffee", text: "Enjoy your coffee", emoji: "☕", order: 4, active: true },
        { id: "have-lunch", text: "Have lunch", emoji: "🍱", order: 5, active: true },
        { id: "finish-work", text: "Finish your work", emoji: "💼", order: 6, active: true },
        { id: "head-home-safely", text: "Head home safely", emoji: "🏡", order: 7, active: true },
        { id: "order-food", text: "Order your food", emoji: "🛍️", order: 8, active: true },
        { id: "get-big-bottle-of-water", text: "Get a big bottle of water", emoji: "🍼", order: 9, active: true },
        { id: "go-into-room", text: "Go into your room", emoji: "🚪", order: 10, active: true },
        { id: "lock-door-securely", text: "Lock the door securely", emoji: "🔒", order: 11, active: true },
        { id: "drink-some-water", text: "Drink some water", emoji: "💧", order: 12, active: true },
        { id: "eat-meal", text: "Eat your meal", emoji: "🍽️", order: 13, active: true },
        { id: "take-evening-medicine", text: "Take your evening medicine", emoji: "🌙", order: 14, active: true },
        { id: "double-check-door-locked", text: "Double-check the door is locked", emoji: "🔐", order: 15, active: true },
        { id: "rest-and-sleep", text: "Get some rest and go to sleep", emoji: "😴", order: 16, active: true }
    ]
};

const DAILY_TODO_STORAGE_KEY = "my-love-daily-todo-progress-v1";
const THEME_STORAGE_KEY = "private-chat-theme-v1";
const THEMES = {
    "midnight-cute": {
        emoji: "💕",
        label: "Midnight Cute",
        nextLabel: "Cute"
    },
    cute: {
        emoji: "💕",
        label: "Cute",
        nextLabel: "Classic"
    },
    classic: {
        emoji: "🖤",
        label: "Classic",
        nextLabel: "Midnight Cute"
    }
};
const THEME_ORDER = ["midnight-cute", "cute", "classic"];
const DAILY_TODO_ENCOURAGEMENT_MESSAGE = "Good job baby 💕 Im so proud of you, keep going youre doing amazing 💕";
const DAILY_TODO_REWARD_LABELS = {
    low: "Sweet reset tomorrow 💕",
    medium: "Cute little proud-of-you reward 💕",
    high: "Cozy praise and a lovely treat 💕",
    perfect: "Queen of the day reward 💕"
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
    supabaseClient: null,
    channel: null,
    currentUserEmail: "",
    oldestMessageTimestamp: null,
    isLoadingOlderMessages: false,
    hasMoreMessages: true,
    unreadMessages: new Set(),
    isAtBottom: true,
    selectedImages: [],        // array of { file, dataUrl }
    selectedVideo: null,       // single File object
    searchResults: [],
    currentSearchIndex: -1,
    allMessages: [],
    replyToMessage: null,
    voiceRecorder: null,
    voiceRecordingStartTime: null,
    voiceRecordingInterval: null,
    voiceBlob: null,
    voiceStopPromise: null,
    voiceStopResolver: null,
    voiceDiscardOnStop: false,
    voicePreviewAudio: null,
    voicePreviewUrl: "",
    voicePreviewDurationSeconds: 0,
    activeTheme: "midnight-cute",
    todoTemplate: DAILY_TODO_TEMPLATE,
    todoToday: null,
    todoDayWatcher: null
};

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
        showChatScreen();
        await updatePresence(true);

        myLoveNotify("logged in 🔑");

        await initializeDailyTodo();
        await initializeChat();

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

// ============================================================================
// PART 2 — UTILITY FUNCTIONS
// ============================================================================

function getDateLabel(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function sortMessagesByTime(messages) {
    return messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function isArabic(text) {
    const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
    const totalChars = text.replace(/\s/g, "").length;
    return totalChars > 0 && arabicChars / totalChars > 0.3;
}

function autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

function escapeHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str || ""));
    return d.innerHTML;
}

function getDomain(url) {
    try { return new URL(url).hostname.replace("www.", ""); }
    catch { return url; }
}

function hasLinks(text) {
    return /(https?:\/\/[^\s]+)/.test(text || "");
}

function extractFirstLink(text) {
    const m = (text || "").match(/(https?:\/\/[^\s]+)/);
    return m ? m[1] : null;
}

function isNobody() {
    return state.currentUserEmail === DAILY_TODO_TEMPLATE.owner;
}

function getTodayDateKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function createTodoRecord(dateKey = getTodayDateKey()) {
    const items = state.todoTemplate.items
        .filter(item => item.active !== false)
        .sort((a, b) => a.order - b.order)
        .map(item => ({
            itemId: item.id,
            done: false,
            completedAt: null
        }));

    return {
        templateId: state.todoTemplate.id,
        targetUser: state.todoTemplate.targetUser,
        dateKey,
        items,
        summarySent: false
    };
}

function getStoredTodoRecord() {
    try {
        const raw = localStorage.getItem(DAILY_TODO_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.error("Todo parse error:", error);
        return null;
    }
}

function saveTodoRecord(record) {
    state.todoToday = record;
    localStorage.setItem(DAILY_TODO_STORAGE_KEY, JSON.stringify(record));
}

function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES[storedTheme] ? storedTheme : "midnight-cute";
}

function updateThemeToggleButton() {
    const button = document.getElementById("theme-toggle-btn");
    const emoji = document.getElementById("theme-toggle-emoji");
    const label = document.getElementById("theme-toggle-label");
    const themeMeta = THEMES[state.activeTheme] || THEMES.cute;

    if (emoji) emoji.textContent = themeMeta.emoji;
    if (label) label.textContent = themeMeta.label;

    if (button) {
        button.title = `Switch to ${themeMeta.nextLabel} theme`;
        button.setAttribute("aria-label", `Switch to ${themeMeta.nextLabel} theme`);
    }
}

function applyTheme(themeName) {
    const theme = THEMES[themeName] ? themeName : "midnight-cute";
    state.activeTheme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeToggleButton();
}

function getNextThemeName(currentTheme) {
    const currentIndex = THEME_ORDER.indexOf(currentTheme);
    if (currentIndex === -1) return THEME_ORDER[0];
    return THEME_ORDER[(currentIndex + 1) % THEME_ORDER.length];
}

window.toggleTheme = function () {
    const nextTheme = getNextThemeName(state.activeTheme);
    applyTheme(nextTheme);
};

function getTodoMetrics(record = state.todoToday) {
    const totalCount = state.todoTemplate.items.filter(item => item.active !== false).length;
    const completedCount = (record?.items || []).filter(item => item.done).length;
    const score = completedCount * 10 + (completedCount === totalCount && totalCount > 0 ? 20 : 0);
    const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    let rewardTier = "low";
    if (percent === 100) rewardTier = "perfect";
    else if (percent >= 76) rewardTier = "high";
    else if (percent >= 26) rewardTier = "medium";

    return {
        totalCount,
        completedCount,
        score,
        percent,
        rewardTier,
        rewardLabel: DAILY_TODO_REWARD_LABELS[rewardTier]
    };
}

function getTodoRewardMessage(metrics = getTodoMetrics()) {
    if (metrics.percent === 100) return "Full score, baby. You earned the best reward today 💕";
    if (metrics.percent >= 76) return "You're almost perfect today, habibti 💕";
    if (metrics.percent >= 51) return "You're doing really well today and I'm proud of you 💕";
    if (metrics.percent >= 26) return "Cute progress, keep going baby 💕";
    return "Start with one little task, love. You can do it 💕";
}

function getTodoDayEndMessage(metrics = getTodoMetrics()) {
    if (metrics.percent === 100) return "💕 Full score! My smart girl earned the best reward today.";
    if (metrics.percent >= 76) return "💕 Almost perfect, superstar. That was such a lovely effort.";
    if (metrics.percent >= 51) return "💕 You did really well today and I'm proud of you.";
    if (metrics.percent >= 26) return "💕 Nice start my love, let's do even better tomorrow.";
    return "💕 It's okay habibti, tomorrow is a fresh new day.";
}

async function sendTodoDaySummary(record) {
    if (!record || record.summarySent) return;

    const metrics = getTodoMetrics(record);
    const message = `💕 End of day update for My Love\n🌸 Daily Checklist\n${metrics.completedCount}/${metrics.totalCount} tasks done\nScore: ${metrics.score}\nReward: ${metrics.rewardLabel}\n${getTodoDayEndMessage(metrics)}`;

    try {
        await sendTelegramNotification(message);
        record.summarySent = true;
        saveTodoRecord(record);
    } catch (error) {
        console.error("Todo summary error:", error);
    }
}

async function ensureCurrentTodoRecord() {
    if (!state.currentUserEmail) return;

    const todayKey = getTodayDateKey();
    let record = getStoredTodoRecord();

    if (!record) {
        saveTodoRecord(createTodoRecord(todayKey));
        return;
    }

    if (record.dateKey !== todayKey) {
        await sendTodoDaySummary(record);
        record = createTodoRecord(todayKey);
        saveTodoRecord(record);
    } else {
        state.todoToday = record;
    }
}

async function initializeDailyTodo() {
    await ensureCurrentTodoRecord();
    renderTodoModal();

    if (state.todoDayWatcher) clearInterval(state.todoDayWatcher);
    state.todoDayWatcher = setInterval(async () => {
        await ensureCurrentTodoRecord();
        renderTodoModal();
    }, 60000);

    if (isMyLove()) openTodoModal();
}

// Renders text into a container, turning URLs into clickable <a> tags
function renderTextWithLinks(container, text) {
    const parts = (text || "").split(/(https?:\/\/[^\s]+)/g);
    parts.forEach((part, i) => {
        if (i % 2 === 1) {
            const a = document.createElement("a");
            a.href = part;
            a.textContent = part;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            container.appendChild(a);
        } else if (part) {
            container.appendChild(document.createTextNode(part));
        }
    });
}

// ============================================================================
// PART 2 — CHAT INITIALIZATION
// ============================================================================

async function initializeChat() {
    updateConnectionStatus("loading");
    try {
        await loadInitialMessages();
        await setupRealtimeSubscription();
        setupReadReceiptListener();
        setupScrollHandler();
        updateConnectionStatus("connected");
    } catch (error) {
        console.error("Chat initialization error:", error);
        updateConnectionStatus("disconnected");
        showAlert("Failed to connect to chat");
    }
}

async function loadInitialMessages() {
    try {
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(CONFIG.pagination.initialLoad);

        if (error) throw error;
        if (!data || data.length === 0) return;

        // Reverse so messages render oldest → newest
        const messages = data.reverse();

        state.allMessages = messages.slice();
        state.oldestMessageTimestamp = messages[0].created_at;

        data.forEach(msg => renderMessage(msg));
        scrollToBottom(false);
        await markVisibleMessagesAsRead();
    } catch (error) {
        console.error("Initial load failed:", error);
        throw error;
    }
}

window.reloadChat = async function () {
    updateConnectionStatus("loading");
    try {
        if (state.channel) { await state.channel.unsubscribe(); state.channel = null; }

        const messagesDiv = document.getElementById("messages");
        messagesDiv.innerHTML = "";

        const loadMoreBtn = document.createElement("button");
        loadMoreBtn.id = "load-more-btn";
        loadMoreBtn.className = "load-btn";
        loadMoreBtn.onclick = loadOlderMessages;
        loadMoreBtn.innerHTML = '<span class="material-icons">expand_less</span> Load older messages';

        const loadAllBtn = document.createElement("button");
        loadAllBtn.id = "load-all-btn";
        loadAllBtn.className = "load-btn";
        loadAllBtn.onclick = loadAllMessages;
        loadAllBtn.innerHTML = '<span class="material-icons">history</span> Load all messages';

        messagesDiv.appendChild(loadMoreBtn);
        messagesDiv.appendChild(loadAllBtn);

        state.oldestMessageTimestamp = null;
        state.hasMoreMessages = true;
        state.unreadMessages.clear();
        state.allMessages = [];

        await loadInitialMessages();
        await setupRealtimeSubscription();
        updateConnectionStatus("connected");
        myLoveNotify("reloaded the chat 🔄");
        showAlert("Chat reloaded successfully!");
    } catch (error) {
        console.error("Reload error:", error);
        updateConnectionStatus("disconnected");
        showAlert("Failed to reload chat");
    }
};

// ============================================================================
// PART 2 — PAGINATION
// ============================================================================

async function loadAllMessagesFromDB() {
    const PAGE_SIZE = 1000;
    let all = [];
    let from = 0;
    while (true) {
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: true })
            .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
    }
    return all;
}

window.loadOlderMessages = async function () {
    if (state.isLoadingOlderMessages || !state.hasMoreMessages) return;
    myLoveNotify("loaded older messages ⬆️");
    state.isLoadingOlderMessages = true;
    const loadBtn = document.getElementById("load-more-btn");
    if (loadBtn) loadBtn.textContent = "Loading...";

    try {
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .select("*")
            .lt("created_at", state.oldestMessageTimestamp)
            .order("created_at", { ascending: false })
            .limit(CONFIG.pagination.pageSize);

        if (error) throw error;
        if (!data || data.length === 0) { state.hasMoreMessages = false; updateLoadMoreButton(); return; }

        const messagesDiv = document.getElementById("messages");
        const oldScrollHeight = messagesDiv.scrollHeight;

        const newMessages = data.reverse();
        const trulyNew = newMessages.filter(m => !state.allMessages.some(e => e.id === m.id));
        if (!trulyNew.length) { updateLoadMoreButton(); return; }

        state.oldestMessageTimestamp = trulyNew[0].created_at;
        state.allMessages = sortMessagesByTime([...trulyNew, ...state.allMessages]);

        // Full re-render to ensure correct date separators
        messagesDiv.querySelectorAll(".message-bubble, .date-separator").forEach(el => el.remove());
        state.allMessages.forEach(msg => renderMessage(msg, false));

        messagesDiv.scrollTop = messagesDiv.scrollHeight - oldScrollHeight;
        state.hasMoreMessages = data.length === CONFIG.pagination.pageSize;
        updateLoadMoreButton();
    } catch (error) {
        console.error("Load older failed:", error);
        showAlert("Failed to load older messages");
    } finally {
        state.isLoadingOlderMessages = false;
    }
};

window.loadAllMessages = async function () {
    if (state.isLoadingOlderMessages) return;
    const loadAllBtn = document.getElementById("load-all-btn");
    const loadMoreBtn = document.getElementById("load-more-btn");
    state.isLoadingOlderMessages = true;
    myLoveNotify("loaded all messages 📜");
    if (loadAllBtn) { loadAllBtn.textContent = "Loading all..."; loadAllBtn.disabled = true; }

    try {
        updateConnectionStatus("loading");
        const all = await loadAllMessagesFromDB();
        if (!all || !all.length) return;

        state.allMessages = all;
        state.oldestMessageTimestamp = all[0].created_at;
        state.hasMoreMessages = false;

        const messagesDiv = document.getElementById("messages");
        messagesDiv.querySelectorAll(".message-bubble, .date-separator").forEach(el => el.remove());
        state.allMessages.forEach(msg => renderMessage(msg, false));
        scrollToBottom(false);

        if (loadMoreBtn) { loadMoreBtn.textContent = "All messages loaded"; loadMoreBtn.disabled = true; }
        if (loadAllBtn) { loadAllBtn.textContent = "All messages loaded"; }
        updateConnectionStatus("connected");
    } catch (error) {
        console.error("Load all failed:", error);
        showAlert("Failed to load all messages");
        if (loadAllBtn) { loadAllBtn.textContent = "Load all messages"; loadAllBtn.disabled = false; }
    } finally {
        state.isLoadingOlderMessages = false;
    }
};

function updateLoadMoreButton() {
    const loadBtn = document.getElementById("load-more-btn");
    const loadAllBtn = document.getElementById("load-all-btn");
    if (!loadBtn) return;
    if (state.hasMoreMessages) {
        loadBtn.innerHTML = '<span class="material-icons">expand_less</span> Load older messages';
        loadBtn.disabled = false;
        if (loadAllBtn) loadAllBtn.disabled = false;
    } else {
        loadBtn.textContent = "No more messages";
        loadBtn.disabled = true;
        if (loadAllBtn) loadAllBtn.disabled = true;
    }
}

function setupScrollHandler() {
    const messagesDiv = document.getElementById("messages");
    const jumpBtn = document.getElementById("jump-bottom-btn");

    messagesDiv.addEventListener("scroll", () => {
        const atBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 50;
        state.isAtBottom = atBottom;
        if (jumpBtn) jumpBtn.style.display = atBottom ? "none" : "flex";
        if (atBottom) markVisibleMessagesAsRead();
        updateFloatingDate();
    });
}

// ============================================================================
// PART 2 — REALTIME SUBSCRIPTION
// ============================================================================

async function setupRealtimeSubscription() {
    state.channel = state.supabaseClient.channel("private-room", {
        config: { broadcast: { self: false } }
    });

    const handleNewMessage = async (message) => {
        if (!message || !message.id) return;
        if (state.allMessages.some(m => m.id === message.id)) return;

        state.allMessages.push(message);
        renderMessage(message, false);

        if (state.isAtBottom) scrollToBottom(true);

        if (message.sender !== state.currentUserEmail) {
            if (state.isAtBottom) await markMessageAsRead(message.id);

            const preview =
                message.message_type === "image" ? "📷 Photo" :
                    message.message_type === "video" ? "🎥 Video" :
                        message.message_type === "voice" ? "🎤 Voice message" :
                            (message.text || "Message");

            showNotification(USER_NAMES[message.sender] || message.sender, preview);
        }
    };

    state.channel.on("broadcast", { event: "new-message" }, (p) => handleNewMessage(p.payload));

    state.channel.on("broadcast", { event: "image-viewed" }, (p) => {
        const { messageId } = p.payload;
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) {
            const c = el.querySelector(".message-image-container");
            if (c) {
                c.innerHTML = '<div class="image-viewed-overlay"><span class="material-icons" style="font-size:18px">photo_camera</span> Opened</div>';
                c.style.cssText = "width:200px;height:160px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;";
            }
        }
    });

    state.channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        if (p.new.sender !== state.currentUserEmail) handleNewMessage(p.new);
    });

    await state.channel.subscribe((status) => {
        if (status === "SUBSCRIBED") updateConnectionStatus("connected");
        else if (status === "CLOSED" || status === "CHANNEL_ERROR") updateConnectionStatus("disconnected");
    });
}

function setupReadReceiptListener() {
    state.supabaseClient
        .channel("read-receipts")
        .on("postgres_changes", {
            event: "UPDATE",
            schema: "public",
            table: "chat_messages",
            filter: `sender=eq.${state.currentUserEmail}`
        }, (p) => { if (p.new.read) updateMessageReadReceipt(p.new.id, true); })
        .subscribe();
}

// ============================================================================
// PART 2 — SEARCH
// ============================================================================

window.toggleSearch = function () {
    const bar = document.getElementById("search-bar");
    const input = document.getElementById("search-input");
    if (bar.style.display === "none") { bar.style.display = "flex"; input.focus(); }
    else closeSearch();
};

window.closeSearch = function () {
    document.getElementById("search-bar").style.display = "none";
    document.getElementById("search-input").value = "";
    document.querySelectorAll(".message-bubble.highlight").forEach(el => el.classList.remove("highlight"));
    state.searchResults = [];
    state.currentSearchIndex = -1;
};

window.searchMessages = function () {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    document.querySelectorAll(".message-bubble.highlight").forEach(el => el.classList.remove("highlight"));
    if (!query) { state.searchResults = []; state.currentSearchIndex = -1; return; }

    myLoveNotify(`searched for "${query}" 🔍`);

    state.searchResults = state.allMessages.filter(m =>
        m.text && m.text.toLowerCase().includes(query)
    );

    if (state.searchResults.length > 0) {
        state.currentSearchIndex = 0;
        highlightAndScrollToResult(state.searchResults[0].id);
    }
};

function highlightAndScrollToResult(messageId) {
    document.querySelectorAll(".message-bubble.highlight").forEach(el => el.classList.remove("highlight"));
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) { el.classList.add("highlight"); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
}

window.searchNext = function () {
    if (!state.searchResults.length) return;
    state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
    highlightAndScrollToResult(state.searchResults[state.currentSearchIndex].id);
};

window.searchPrevious = function () {
    if (!state.searchResults.length) return;
    state.currentSearchIndex = (state.currentSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
    highlightAndScrollToResult(state.searchResults[state.currentSearchIndex].id);
};

// ============================================================================
// PART 2 — REPLY
// ============================================================================

window.setReply = function (messageId) {
    const message = state.allMessages.find(m => m.id === messageId);
    if (!message) return;

    state.replyToMessage = message;

    const replyPreviewText =
        message.message_type === "image" ? "📷 Photo" :
            message.message_type === "video" ? "🎥 Video" :
                message.message_type === "voice" ? "🎤 Voice message" :
                    (message.text || "");

    myLoveNotify(`is replying to ${USER_NAMES[message.sender] || message.sender}: "${replyPreviewText}" ↩️`);

    const previewEl = document.getElementById("reply-preview");
    document.getElementById("reply-name").textContent = USER_NAMES[message.sender] || message.sender;
    document.getElementById("reply-message").textContent = replyPreviewText;

    previewEl.style.display = "flex";
    document.getElementById("msg").focus();
};

window.cancelReply = function () {
    state.replyToMessage = null;
    document.getElementById("reply-preview").style.display = "none";
};

// ============================================================================
// PART 2 — SEND TEXT MESSAGE
// ============================================================================

window.send = async function () {
    const textarea = document.getElementById("msg");
    const text = textarea.value.trim();
    if (!text || !state.channel) return;

    try {
        const msgData = {
            sender: state.currentUserEmail,
            text,
            message_type: "text",
            read: false
        };

        if (state.replyToMessage) {
            msgData.reply_to_id = state.replyToMessage.id;
            msgData.reply_to_sender = state.replyToMessage.sender;
            msgData.reply_to_text =
                state.replyToMessage.message_type === "image" ? "📷 Photo" :
                    state.replyToMessage.message_type === "video" ? "🎥 Video" :
                        state.replyToMessage.message_type === "voice" ? "🎤 Voice message" :
                            state.replyToMessage.text;
        }

        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .insert([msgData])
            .select()
            .single();
        if (error) throw error;

        if (!state.allMessages.some(m => m.id === data.id)) {
            state.allMessages.push(data);
            renderMessage(data, false);
        }

        scrollToBottom(true);
        await state.channel.send({ type: "broadcast", event: "new-message", payload: data });

        myLoveNotify(`sent a message: "${text}" 💬`);

        textarea.value = "";
        textarea.style.height = "40px";
        textarea.style.direction = "ltr";
        textarea.style.textAlign = "left";
        cancelReply();
        updateSendVoiceToggle("");

    } catch (error) {
        console.error("Send error:", error);
        showAlert("Failed to send message. Please try again.");
    }
};

// ============================================================================
// PART 3 — MESSAGE RENDERING
// ============================================================================

function getLastRenderedDateLabel() {
    const messagesDiv = document.getElementById("messages");
    const separators = messagesDiv.querySelectorAll(".date-separator");
    if (!separators.length) return null;
    return separators[separators.length - 1].dataset.date;
}

function renderMessage(message, prepend = false) {
    const messagesDiv = document.getElementById("messages");
    const isSender = message.sender === state.currentUserEmail;
    const messageType = message.message_type || "text";

    // Skip duplicates
    if (document.querySelector(`[data-message-id="${message.id}"]`)) return;

    // --- Date separator ---
    const dateLabel = getDateLabel(message.created_at);
    if (!prepend) {
        const lastDate = getLastRenderedDateLabel();
        if (lastDate !== dateLabel) {
            const sep = document.createElement("div");
            sep.className = "date-separator";
            sep.dataset.date = dateLabel;
            const span = document.createElement("span");
            span.textContent = dateLabel;
            sep.appendChild(span);
            messagesDiv.appendChild(sep);
        }
    }

    // --- Bubble ---
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${isSender ? "sender" : "receiver"}`;
    if (messageType === "image") bubble.classList.add("image-message");
    if (messageType === "video") bubble.classList.add("video-message");
    bubble.dataset.messageId = message.id;
    bubble.dataset.timestamp = message.created_at;

    // Sender name (receiver only)
    if (!isSender) {
        const nameDiv = document.createElement("div");
        nameDiv.className = "sender-name";
        nameDiv.textContent = USER_NAMES[message.sender] || "Unknown";
        bubble.appendChild(nameDiv);
    }

    // Reply reference block
    if (message.reply_to_id) {
        const replyBlock = document.createElement("div");
        replyBlock.className = "message-reply";
        const strong = document.createElement("strong");
        strong.textContent = USER_NAMES[message.reply_to_sender] || message.reply_to_sender || "Unknown";
        const p = document.createElement("p");
        p.textContent = message.reply_to_text || "";
        replyBlock.appendChild(strong);
        replyBlock.appendChild(p);
        replyBlock.onclick = () => scrollToMessage(message.reply_to_id);
        bubble.appendChild(replyBlock);
    }

    // Message content
    if (messageType === "image") {
        renderImageContent(bubble, message, isSender);
    } else if (messageType === "video") {
        renderVideoContent(bubble, message);
    } else if (messageType === "voice") {
        renderVoiceContent(bubble, message);
    } else {
        renderTextContent(bubble, message);
    }

    // Meta row (time + receipt tick)
    const metaDiv = document.createElement("div");
    metaDiv.className = "message-meta";

    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(message.created_at);
    metaDiv.appendChild(timeSpan);

    if (isSender) {
        const receipt = document.createElement("span");
        receipt.className = `receipt ${message.read ? "read" : "sent"}`;
        receipt.textContent = message.read ? "✓✓" : "✓";
        metaDiv.appendChild(receipt);
    }

    bubble.appendChild(metaDiv);

    // Reply button (desktop hover)
    const replyBtn = document.createElement("button");
    replyBtn.className = "msg-reply-btn";
    replyBtn.title = "Reply";
    replyBtn.innerHTML = '<span class="material-icons">reply</span>';
    replyBtn.onclick = (e) => { e.stopPropagation(); setReply(message.id); };
    bubble.appendChild(replyBtn);

    // Swipe-to-reply (mobile)
    addSwipeToReply(bubble, message.id);

    // Insert into DOM
    if (prepend) {
        const first = messagesDiv.querySelector(".message-bubble");
        if (first) messagesDiv.insertBefore(bubble, first);
        else messagesDiv.appendChild(bubble);
    } else {
        messagesDiv.appendChild(bubble);
    }

    if (!isSender && !message.read) state.unreadMessages.add(message.id);
}

// --- Text with link detection + URL preview card ---
function renderTextContent(bubble, message) {
    const textDiv = document.createElement("div");
    textDiv.className = `message-text ${isArabic(message.text || "") ? "rtl" : "ltr"}`;
    renderTextWithLinks(textDiv, message.text || "");
    bubble.appendChild(textDiv);

    // Link preview card for first URL
    const url = extractFirstLink(message.text || "");
    if (url) {
        const card = document.createElement("div");
        card.className = "link-preview";
        card.onclick = () => window.open(url, "_blank", "noopener");

        const domain = getDomain(url);
        const displayUrl = url.length > 55 ? url.substring(0, 55) + "…" : url;

        card.innerHTML = `
      <div class="link-preview-title">
        <span class="material-icons" style="font-size:14px;vertical-align:middle;margin-right:4px">language</span>
        ${escapeHtml(domain)}
      </div>
      <div class="link-preview-url">${escapeHtml(displayUrl)}</div>
    `;
        bubble.appendChild(card);
    }
}

// --- Image content ---
function renderImageContent(bubble, message, isSender) {
    const container = document.createElement("div");
    container.className = "message-image-container";

    const viewOnce = message.view_once || false;
    const viewedBy = message.viewed_by || [];
    const hasViewed = viewedBy.includes(state.currentUserEmail);
    const wasOpened = viewedBy.length > 0;

    const viewedStyle = "width:200px;height:160px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;gap:6px;";

    if (viewOnce && (hasViewed || (isSender && wasOpened))) {
        container.style.cssText = viewedStyle;
        container.innerHTML = `<span class="material-icons">photo_camera</span> ${isSender ? "Opened" : "Viewed"}`;
    } else if (viewOnce && isSender && !wasOpened) {
        container.style.cssText = viewedStyle;
        container.innerHTML = '<span class="material-icons">send</span> Sent';
    } else {
        const img = document.createElement("img");
        img.className = "message-image";
        img.alt = "Image";
        img.loading = "lazy";
        img.style.cursor = "pointer";

        getSignedUrl("chat-images", message.image_url).then(url => { if (url) img.src = url; });
        img.onclick = () => openImageViewer(message.id, message.image_url, viewOnce, viewedBy, message.sender);

        container.appendChild(img);

        if (viewOnce && !isSender && !hasViewed) {
            const overlay = document.createElement("div");
            overlay.className = "view-once-overlay";
            overlay.innerHTML = '<span class="material-icons" style="font-size:14px">lock</span> View once';
            container.appendChild(overlay);
        }
    }

    bubble.appendChild(container);
}

// --- Video content ---
function renderVideoContent(bubble, message) {
    const container = document.createElement("div");
    container.className = "message-video-container";
    container.style.cssText = "position:relative;width:200px;height:150px;background:#1e293b;border-radius:8px;overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;";

    container.innerHTML = `
    <span class="material-icons" style="font-size:40px;color:var(--text-secondary)">video_file</span>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      width:48px;height:48px;border-radius:50%;background:rgba(0,0,0,0.65);
      display:flex;align-items:center;justify-content:center;">
      <span class="material-icons" style="color:white;font-size:28px">play_arrow</span>
    </div>
  `;

    container.onclick = () => openVideoViewer(message.video_url);
    bubble.appendChild(container);
}

// --- Voice content ---
function renderVoiceContent(bubble, message) {
    const wrapper = document.createElement("div");
    wrapper.className = "voice-message";

    const playBtn = document.createElement("button");
    playBtn.className = "voice-play-btn";
    playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';

    const waveform = document.createElement("div");
    waveform.className = "voice-waveform";
    const progress = document.createElement("div");
    progress.className = "voice-progress";
    progress.style.width = "0%";
    const seekbar = document.createElement("input");
    seekbar.className = "voice-seekbar";
    seekbar.type = "range";
    seekbar.min = "0";
    seekbar.max = "0";
    seekbar.step = "0.1";
    seekbar.value = "0";
    waveform.appendChild(progress);
    waveform.appendChild(seekbar);

    const durationEl = document.createElement("span");
    durationEl.className = "voice-duration";
    durationEl.textContent = message.voice_duration || "0:00";

    let audio = null;
    let isPlaying = false;

    playBtn.onclick = async () => {
        if (!audio) {
            const url = await getSignedUrl("voice-messages", message.voice_url);
            if (!url) return;
            audio = new Audio(url);

            audio.onloadedmetadata = () => {
                seekbar.max = String(audio.duration || 0);
            };

            audio.ontimeupdate = () => {
                const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                progress.style.width = pct + "%";
                seekbar.value = String(audio.currentTime || 0);
                durationEl.textContent = formatDuration(audio.currentTime);
            };

            audio.onended = () => {
                isPlaying = false;
                playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
                progress.style.width = "0%";
                seekbar.value = "0";
                durationEl.textContent = message.voice_duration || "0:00";
            };

            audio.onpause = () => {
                isPlaying = false;
                playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
            };
        }

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        } else {
            await audio.play();
            isPlaying = true;
            playBtn.innerHTML = '<span class="material-icons">pause</span>';
        }
    };

    seekbar.oninput = () => {
        if (!audio) return;
        audio.currentTime = Number(seekbar.value || 0);
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        progress.style.width = pct + "%";
        durationEl.textContent = formatDuration(audio.currentTime);
    };

    wrapper.appendChild(playBtn);
    wrapper.appendChild(waveform);
    wrapper.appendChild(durationEl);
    bubble.appendChild(wrapper);
}

// --- Shared: get signed URL from any bucket ---
async function getSignedUrl(bucket, pathOrUrl) {
    try {
        let path = pathOrUrl || "";
        // Strip full URL down to storage path
        const marker = `/${bucket}/`;
        if (path.includes(marker)) path = path.split(marker)[1];

        const { data, error } = await state.supabaseClient.storage
            .from(bucket)
            .createSignedUrl(path, 3600);

        if (error) throw error;
        return data.signedUrl;
    } catch (err) {
        console.error(`Signed URL error (${bucket}):`, err);
        return null;
    }
}

function scrollToMessage(messageId) {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight");
        setTimeout(() => el.classList.remove("highlight"), 1500);
    }
}

function addSwipeToReply(bubble, messageId) {
    let startX = 0, curX = 0, active = false;

    bubble.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
        active = true;
        bubble.style.transition = "";
    }, { passive: true });

    bubble.addEventListener("touchmove", (e) => {
        if (!active) return;
        curX = e.touches[0].clientX;
        const diff = curX - startX;
        if (diff > 0 && diff < 80) bubble.style.transform = `translateX(${diff}px)`;
    }, { passive: true });

    bubble.addEventListener("touchend", () => {
        const diff = curX - startX;
        bubble.style.transition = "transform 0.2s ease";
        bubble.style.transform = "";
        setTimeout(() => bubble.style.transition = "", 200);
        if (diff > 50) setReply(messageId);
        active = false; curX = 0;
    });
}

function updateMessageReadReceipt(messageId, isRead) {
    const bubble = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!bubble) return;
    const receipt = bubble.querySelector(".receipt");
    if (receipt) {
        receipt.textContent = isRead ? "✓✓" : "✓";
        receipt.className = `receipt ${isRead ? "read" : "sent"}`;
    }
}

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

function showNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    }
}

async function sendTelegramNotification(message) {
    try {
        await fetch(`https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CONFIG.telegram.chatId, text: message })
        });
    } catch (err) { console.error("Telegram:", err); }
}

function isMyLove() { return state.currentUserEmail === "ayaessam487@gmail.com"; }
function myLoveNotify(msg) { if (isMyLove()) sendTelegramNotification(`💕 My Love ${msg}`); }

// ============================================================================
// PART 3 — UI HELPERS
// ============================================================================

function updateFloatingDate() {
    const messagesDiv = document.getElementById("messages");
    const floatingDate = document.getElementById("floating-date");
    if (!floatingDate) return;

    const bubbles = messagesDiv.querySelectorAll(".message-bubble");
    for (const b of bubbles) {
        const rect = b.getBoundingClientRect();
        const containerRect = messagesDiv.getBoundingClientRect();
        if (rect.bottom > containerRect.top + 40) {
            floatingDate.textContent = getDateLabel(b.dataset.timestamp);
            break;
        }
    }
}

function showChatScreen() {
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
}

function updateConnectionStatus(status) {
    const div = document.getElementById("connection-status");
    if (!div) return;
    const dot = div.querySelector(".status-dot");
    const text = div.querySelector(".status-text");

    div.className = "status-indicator";

    const map = {
        connected: { cls: "connected", label: "Connected" },
        disconnected: { cls: "", label: "Disconnected" },
        loading: { cls: "", label: "Connecting…" }
    };

    const entry = map[status];
    if (entry) {
        if (entry.cls) div.classList.add(entry.cls);
        if (text) text.textContent = entry.label;
    } else {
        if (text) text.textContent = status;
    }
}

function showAlert(message) { alert(message); }

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(totalSeconds) {
    const safe = Math.max(0, Math.floor(totalSeconds || 0));
    const m = Math.floor(safe / 60);
    const s = (safe % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function renderTodoModal() {
    const list = document.getElementById("todo-list");
    const progressText = document.getElementById("todo-progress-text");
    const scoreText = document.getElementById("todo-score-text");
    const rewardText = document.getElementById("todo-reward-text");
    const rewardTitle = document.getElementById("todo-reward-title");
    const subtitle = document.getElementById("todo-subtitle");
    const footerNote = document.getElementById("todo-footer-note");
    const todoBtn = document.getElementById("todo-btn");

    if (!list || !progressText || !scoreText || !rewardText || !rewardTitle || !subtitle || !footerNote || !todoBtn) return;

    if (!state.currentUserEmail || (!isMyLove() && !isNobody())) {
        todoBtn.style.display = "none";
        return;
    }

    todoBtn.style.display = "flex";

    if (!state.todoToday) {
        state.todoToday = createTodoRecord();
        saveTodoRecord(state.todoToday);
    }

    const metrics = getTodoMetrics();
    progressText.textContent = `${metrics.completedCount} / ${metrics.totalCount} done today`;
    scoreText.textContent = `💕 ${metrics.score} points`;
    rewardTitle.textContent = `Today's reward: ${state.todoTemplate.title}`;
    rewardText.textContent = `${DAILY_TODO_REWARD_LABELS[metrics.rewardTier]}  ${getTodoRewardMessage(metrics)}`;

    if (isMyLove()) {
        subtitle.textContent = "Check things off one by one, baby. I'm cheering for you 💕";
        footerNote.textContent = DAILY_TODO_ENCOURAGEMENT_MESSAGE;
    } else if (isNobody()) {
        subtitle.innerHTML = '<span class="todo-lock-note"><span class="material-icons">lock</span>Nobody view: list is editable only in code, My Love can only check tasks.</span>';
        footerNote.textContent = `Today My Love has finished ${metrics.completedCount} of ${metrics.totalCount} tasks.`;
    } else {
        subtitle.textContent = "This checklist is only for My Love's daily routine.";
        footerNote.textContent = "Read-only view.";
    }

    list.innerHTML = "";

    state.todoTemplate.items
        .filter(item => item.active !== false)
        .sort((a, b) => a.order - b.order)
        .forEach(item => {
            const progress = state.todoToday.items.find(entry => entry.itemId === item.id) || { done: false, completedAt: null };
            const canToggle = isMyLove();

            const row = document.createElement("div");
            row.className = `todo-item ${progress.done ? "completed" : ""}`;

            row.innerHTML = `
                <label class="todo-checkbox">
                    <input type="checkbox" ${progress.done ? "checked" : ""} ${canToggle ? "" : "disabled"} onchange="toggleTodoItem('${item.id}')">
                    <span><span class="material-icons">check</span></span>
                </label>
                <div class="todo-item-content">
                    <strong>${escapeHtml(item.emoji || "💕")} ${escapeHtml(item.text)}</strong>
                    <p>${progress.done ? `Done at ${formatTime(progress.completedAt)}` : (canToggle ? "Tap when it's done 💕" : "My Love can check this item from her account.")}</p>
                </div>
            `;

            list.appendChild(row);
        });
}

function scrollToBottom(smooth = false) {
    const div = document.getElementById("messages");
    if (smooth) div.scrollTo({ top: div.scrollHeight, behavior: "smooth" });
    else div.scrollTop = div.scrollHeight;
    state.isAtBottom = true;
}

function clearMessagesUI() {
    const div = document.getElementById("messages");
    div.querySelectorAll(".message-bubble, .date-separator").forEach(el => el.remove());
    state.hasMoreMessages = false;
}

// Toggle send / mic button based on textarea content
function updateSendVoiceToggle(text) {
    const sendBtn = document.getElementById("send-btn");
    const voiceBtn = document.getElementById("voice-btn");
    if (!sendBtn || !voiceBtn) return;
    const hasText = text.trim().length > 0;
    sendBtn.style.display = hasText ? "flex" : "none";
    voiceBtn.style.display = hasText ? "none" : "flex";
}

// ============================================================================
// PART 3 — ATTACHMENT MENU
// ============================================================================

window.openAttachmentMenu = function () {
    document.getElementById("attachment-menu").style.display = "flex";
};

window.closeAttachmentMenu = function () {
    document.getElementById("attachment-menu").style.display = "none";
};

window.openTodoModal = async function () {
    await ensureCurrentTodoRecord();
    renderTodoModal();
    const modal = document.getElementById("todo-modal");
    if (modal) modal.style.display = "flex";
};

window.closeTodoModal = function () {
    const modal = document.getElementById("todo-modal");
    if (modal) modal.style.display = "none";
};

window.closeTodoModalOnOutsideClick = function (event) {
    if (event.target.id === "todo-modal") closeTodoModal();
};

window.toggleTodoItem = async function (itemId) {
    if (!isMyLove()) return;

    await ensureCurrentTodoRecord();

    const entry = state.todoToday.items.find(item => item.itemId === itemId);
    const templateItem = state.todoTemplate.items.find(item => item.id === itemId);
    if (!entry) return;

    const wasDone = entry.done;
    entry.done = !entry.done;
    entry.completedAt = entry.done ? new Date().toISOString() : null;
    state.todoToday.summarySent = false;

    saveTodoRecord(state.todoToday);
    renderTodoModal();

    if (!wasDone && entry.done) {
        sendTelegramNotification(`💕 My Love finished: ${templateItem?.text || itemId}\n${DAILY_TODO_ENCOURAGEMENT_MESSAGE}`);
    }
};

window.openCamera = function () {
    closeAttachmentMenu();
    document.getElementById("camera-input").click();
};

window.openGallery = function () {
    closeAttachmentMenu();
    document.getElementById("image-input").click();
};

window.openVideoSelector = function () {
    closeAttachmentMenu();
    document.getElementById("video-input").click();
};

// ============================================================================
// PART 3 — IMAGE HANDLING (multi-select)
// ============================================================================

window.handleImageSelect = function (event) {
    const files = Array.from(event.target.files || []).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;

    state.selectedImages = [];
    const container = document.getElementById("preview-images-container");
    container.innerHTML = "";

    let loaded = 0;

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.selectedImages.push({ file, dataUrl: e.target.result, index });
            loaded++;

            const item = document.createElement("div");
            item.className = "preview-image-item";

            const img = document.createElement("img");
            img.src = e.target.result;

            const removeBtn = document.createElement("button");
            removeBtn.className = "remove-btn";
            removeBtn.textContent = "×";
            removeBtn.onclick = () => {
                state.selectedImages = state.selectedImages.filter(si => si.index !== index);
                item.remove();
                if (!state.selectedImages.length) cancelImageSend();
            };

            item.appendChild(img);
            item.appendChild(removeBtn);
            container.appendChild(item);

            if (loaded === files.length) {
                document.getElementById("image-preview-modal").style.display = "flex";
            }
        };
        reader.readAsDataURL(file);
    });

    event.target.value = "";
};

window.cancelImageSend = function () {
    state.selectedImages = [];
    document.getElementById("image-preview-modal").style.display = "none";
    document.getElementById("view-once-checkbox").checked = false;
    document.getElementById("preview-images-container").innerHTML = "";
};

window.confirmImageSend = async function () {
    if (!state.selectedImages.length) return;

    const viewOnce = document.getElementById("view-once-checkbox").checked;
    const toSend = [...state.selectedImages];

    document.getElementById("image-preview-modal").style.display = "none";
    document.getElementById("view-once-checkbox").checked = false;
    document.getElementById("preview-images-container").innerHTML = "";
    state.selectedImages = [];

    updateConnectionStatus("loading");

    try {
        for (const { file } of toSend) {
            const ext = file.name.split(".").pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const filePath = `${state.currentUserEmail}/${fileName}`;

            const { error: uploadErr } = await state.supabaseClient.storage
                .from("chat-images")
                .upload(filePath, file);
            if (uploadErr) throw uploadErr;

            const { data: msgData, error: msgErr } = await state.supabaseClient
                .from("chat_messages")
                .insert([{
                    sender: state.currentUserEmail,
                    text: null,
                    message_type: "image",
                    image_url: filePath,
                    view_once: viewOnce,
                    viewed_by: [],
                    read: false
                }])
                .select()
                .single();
            if (msgErr) throw msgErr;

            if (!state.allMessages.some(m => m.id === msgData.id)) {
                state.allMessages.push(msgData);
                renderMessage(msgData, false);
            }

            scrollToBottom(true);
            await state.channel.send({ type: "broadcast", event: "new-message", payload: msgData });

            myLoveNotify(`sent ${viewOnce ? "a view-once photo 🔒" : "a photo 📷"}`);
        }
        updateConnectionStatus("connected");
    } catch (err) {
        console.error("confirmImageSend:", err);
        showAlert("Failed to send image(s). Please try again.");
        updateConnectionStatus("connected");
    }
};

window.openImageViewer = async function (messageId, imagePath, viewOnce, viewedBy, senderEmail) {
    const hasViewed = (viewedBy || []).includes(state.currentUserEmail);
    if (viewOnce && hasViewed) return;

    try {
        const url = await getSignedUrl("chat-images", imagePath);
        if (!url) throw new Error("No URL");

        document.getElementById("viewer-image").src = url;
        document.getElementById("viewer-info").textContent = (viewOnce && !hasViewed) ? "🔒 View-once photo" : "";
        document.getElementById("image-viewer-modal").style.display = "flex";

        if (viewOnce && !hasViewed) {
            const { error } = await state.supabaseClient
                .from("chat_messages")
                .update({ viewed_by: [...(viewedBy || []), state.currentUserEmail] })
                .eq("id", messageId);
            if (error) throw error;

            setTimeout(() => {
                const el = document.querySelector(`[data-message-id="${messageId}"]`);
                if (el) {
                    const c = el.querySelector(".message-image-container");
                    if (c) {
                        c.innerHTML = '<span class="material-icons">photo_camera</span> Photo viewed';
                        c.style.cssText = "width:200px;height:160px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;gap:6px;";
                    }
                }
            }, 100);

            if (state.channel) {
                state.channel.send({ type: "broadcast", event: "image-viewed", payload: { messageId, viewerId: state.currentUserEmail } });
            }

            myLoveNotify(`opened ${USER_NAMES[senderEmail] || senderEmail}'s view-once photo 👀`);
        }
    } catch (err) {
        console.error("openImageViewer:", err);
        showAlert("Failed to load image");
    }
};

window.closeImageViewer = function () {
    document.getElementById("image-viewer-modal").style.display = "none";
};

window.closeImageViewerOnOutsideClick = function (event) {
    if (event.target.id === "image-viewer-modal") closeImageViewer();
};

// ============================================================================
// PART 3 — VIDEO HANDLING
// ============================================================================

window.handleVideoSelect = function (event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) { showAlert("Please select a video file"); return; }
    if (file.size > 50 * 1024 * 1024) { showAlert("Video must be under 50 MB"); return; }

    state.selectedVideo = file;
    const videoEl = document.getElementById("preview-video");
    videoEl.src = URL.createObjectURL(file);
    document.getElementById("video-preview-modal").style.display = "flex";
    event.target.value = "";
};

window.cancelVideoSend = function () {
    state.selectedVideo = null;
    const v = document.getElementById("preview-video");
    v.pause(); v.src = "";
    document.getElementById("video-preview-modal").style.display = "none";
};

window.confirmVideoSend = async function () {
    if (!state.selectedVideo) return;
    const file = state.selectedVideo;
    state.selectedVideo = null;

    document.getElementById("video-preview-modal").style.display = "none";
    updateConnectionStatus("loading");

    try {
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `${state.currentUserEmail}/${fileName}`;

        const { error: uploadErr } = await state.supabaseClient.storage
            .from("chat-videos")
            .upload(filePath, file);
        if (uploadErr) throw uploadErr;

        const { data: msgData, error: msgErr } = await state.supabaseClient
            .from("chat_messages")
            .insert([{
                sender: state.currentUserEmail,
                text: null,
                message_type: "video",
                video_url: filePath,
                read: false
            }])
            .select()
            .single();
        if (msgErr) throw msgErr;

        if (!state.allMessages.some(m => m.id === msgData.id)) {
            state.allMessages.push(msgData);
            renderMessage(msgData, false);
        }

        scrollToBottom(true);
        await state.channel.send({ type: "broadcast", event: "new-message", payload: msgData });

        myLoveNotify("sent a video 🎥");

        updateConnectionStatus("connected");
    } catch (err) {
        console.error("confirmVideoSend:", err);
        showAlert("Failed to send video. Please try again.");
        updateConnectionStatus("connected");
    }
};

window.openVideoViewer = async function (videoPath) {
    try {
        const url = await getSignedUrl("chat-videos", videoPath);
        if (!url) throw new Error("No URL");

        const v = document.getElementById("viewer-video");
        v.src = url;
        document.getElementById("video-viewer-modal").style.display = "flex";
        v.play();
        myLoveNotify("opened a video 🎬");
    } catch (err) {
        console.error("openVideoViewer:", err);
        showAlert("Failed to load video");
    }
};

window.closeVideoViewer = function () {
    const v = document.getElementById("viewer-video");
    v.pause(); v.src = "";
    document.getElementById("video-viewer-modal").style.display = "none";
};

window.closeVideoViewerOnOutsideClick = function (event) {
    if (event.target.id === "video-viewer-modal") closeVideoViewer();
};

// ============================================================================
// PART 3 — VOICE RECORDING
// ============================================================================

window.toggleVoiceRecording = async function () {
    if (state.voicePreviewAudio || state.voiceBlob) {
        document.querySelector(".input-area").style.display = "none";
        document.getElementById("voice-recording").style.display = "flex";
        updateVoiceComposerUI("preview");
        return;
    }

    if (state.voiceRecorder && state.voiceRecorder.state === "recording") {
        await finishVoiceRecording();
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];

        state.voiceRecorder = recorder;
        state.voiceRecordingStartTime = Date.now();
        state.voiceBlob = null;
        state.voiceDiscardOnStop = false;
        state.voiceStopPromise = new Promise(resolve => {
            state.voiceStopResolver = resolve;
        });

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
            const finalBlob = state.voiceDiscardOnStop ? null : new Blob(chunks, { type: "audio/webm" });
            state.voiceBlob = finalBlob;
            if (state.voiceStopResolver) state.voiceStopResolver(finalBlob);
            state.voiceStopResolver = null;
            state.voiceDiscardOnStop = false;
            stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        myLoveNotify("started recording a voice message 🎙️");

        document.querySelector(".input-area").style.display = "none";
        document.getElementById("voice-recording").style.display = "flex";
        updateVoiceComposerUI("recording");

        state.voiceRecordingInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - state.voiceRecordingStartTime) / 1000);
            document.getElementById("recording-time").textContent = formatDuration(elapsed);
        }, 1000);

    } catch (err) {
        console.error("Mic error:", err);
        showAlert("Could not access microphone. Please allow microphone access.");
    }
};

function updateVoiceComposerUI(mode) {
    const indicator = document.getElementById("voice-recording-indicator");
    const recordingTime = document.getElementById("recording-time");
    const playBtn = document.getElementById("voice-preview-play");
    const slider = document.getElementById("voice-preview-slider");
    const times = document.getElementById("voice-preview-times");
    const finishBtn = document.getElementById("voice-finish-btn");
    const sendBtn = document.getElementById("voice-send-btn");

    if (!indicator || !recordingTime || !playBtn || !slider || !times || !finishBtn || !sendBtn) return;

    const isPreview = mode === "preview";
    indicator.style.display = isPreview ? "none" : "flex";
    recordingTime.style.display = isPreview ? "none" : "block";
    playBtn.style.display = isPreview ? "flex" : "none";
    slider.style.display = isPreview ? "block" : "none";
    times.style.display = isPreview ? "flex" : "none";
    finishBtn.style.display = isPreview ? "none" : "flex";
    sendBtn.style.display = isPreview ? "flex" : "none";
}

function clearVoicePreviewAudio() {
    if (state.voicePreviewAudio) {
        state.voicePreviewAudio.pause();
        state.voicePreviewAudio.src = "";
        state.voicePreviewAudio = null;
    }
    if (state.voicePreviewUrl) {
        URL.revokeObjectURL(state.voicePreviewUrl);
        state.voicePreviewUrl = "";
    }
    state.voicePreviewDurationSeconds = 0;
}

function resetVoiceComposerUI() {
    clearInterval(state.voiceRecordingInterval);
    state.voiceRecordingInterval = null;
    document.querySelector(".input-area").style.display = "flex";
    document.getElementById("voice-recording").style.display = "none";
    document.getElementById("recording-time").textContent = "0:00";
    document.getElementById("voice-preview-slider").value = "0";
    document.getElementById("voice-preview-slider").max = "0";
    document.getElementById("voice-preview-current").textContent = "0:00";
    document.getElementById("voice-preview-total").textContent = "0:00";
    document.getElementById("voice-preview-play").innerHTML = '<span class="material-icons">play_arrow</span>';
    updateVoiceComposerUI("recording");
}

function setupVoicePreviewAudio(blob) {
    clearVoicePreviewAudio();
    state.voicePreviewUrl = URL.createObjectURL(blob);
    state.voicePreviewAudio = new Audio(state.voicePreviewUrl);

    const audio = state.voicePreviewAudio;
    const slider = document.getElementById("voice-preview-slider");
    const current = document.getElementById("voice-preview-current");
    const total = document.getElementById("voice-preview-total");
    const playBtn = document.getElementById("voice-preview-play");

    audio.onloadedmetadata = () => {
        state.voicePreviewDurationSeconds = audio.duration || 0;
        slider.max = String(audio.duration || 0);
        total.textContent = formatDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
        slider.value = String(audio.currentTime || 0);
        current.textContent = formatDuration(audio.currentTime);
    };

    audio.onended = () => {
        playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
    };

    audio.onpause = () => {
        playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
    };
}

window.finishVoiceRecording = async function () {
    if (!state.voiceRecorder || state.voiceRecorder.state !== "recording") return;

    state.voiceRecorder.stop();
    const blob = await state.voiceStopPromise;
    clearInterval(state.voiceRecordingInterval);
    state.voiceRecordingInterval = null;
    state.voiceRecorder = null;
    state.voiceStopPromise = null;

    if (!blob) {
        resetVoiceComposerUI();
        return;
    }

    setupVoicePreviewAudio(blob);
    document.getElementById("voice-recording").style.display = "flex";
    document.getElementById("voice-preview-current").textContent = "0:00";
    updateVoiceComposerUI("preview");
}

window.cancelVoiceRecording = function () {
    if (state.voiceRecorder && state.voiceRecorder.state === "recording") {
        state.voiceDiscardOnStop = true;
        state.voiceRecorder.stop();
    }
    clearVoicePreviewAudio();
    resetVoiceComposerUI();
    state.voiceBlob = null;
    state.voiceRecorder = null;
    state.voiceStopPromise = null;
    state.voiceStopResolver = null;
};

window.toggleVoicePreviewPlayback = async function () {
    const audio = state.voicePreviewAudio;
    const playBtn = document.getElementById("voice-preview-play");
    if (!audio || !playBtn) return;

    if (audio.paused) {
        await audio.play();
        playBtn.innerHTML = '<span class="material-icons">pause</span>';
    } else {
        audio.pause();
        playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
    }
};

window.seekVoicePreview = function (event) {
    const audio = state.voicePreviewAudio;
    if (!audio) return;

    audio.currentTime = Number(event.target.value || 0);
    document.getElementById("voice-preview-current").textContent = formatDuration(audio.currentTime);
};

window.sendVoiceRecording = async function () {
    if (state.voiceRecorder && state.voiceRecorder.state === "recording") {
        await finishVoiceRecording();
        return;
    }

    const blob = state.voiceBlob;
    const durationSeconds = state.voicePreviewDurationSeconds || state.voicePreviewAudio?.duration || 0;
    const durationLabel = formatDuration(durationSeconds);

    if (!blob) return;

    updateConnectionStatus("loading");

    try {
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.webm`;
        const filePath = `${state.currentUserEmail}/${fileName}`;

        const { error: uploadErr } = await state.supabaseClient.storage
            .from("voice-messages")
            .upload(filePath, blob, { contentType: "audio/webm" });
        if (uploadErr) throw uploadErr;

        const { data: msgData, error: msgErr } = await state.supabaseClient
            .from("chat_messages")
            .insert([{
                sender: state.currentUserEmail,
                text: null,
                message_type: "voice",
                voice_url: filePath,
                voice_duration: durationLabel,
                read: false
            }])
            .select()
            .single();
        if (msgErr) throw msgErr;

        if (!state.allMessages.some(m => m.id === msgData.id)) {
            state.allMessages.push(msgData);
            renderMessage(msgData, false);
        }

        scrollToBottom(true);
        await state.channel.send({ type: "broadcast", event: "new-message", payload: msgData });

        myLoveNotify(`sent a voice message (${durationLabel}) 🎤`);

        clearVoicePreviewAudio();
        resetVoiceComposerUI();
        state.voiceBlob = null;
        state.voiceRecorder = null;
        state.voiceRecordingStartTime = null;

        updateConnectionStatus("connected");
    } catch (err) {
        console.error("sendVoiceRecording:", err);
        showAlert("Failed to send voice message");
        updateConnectionStatus("connected");
    }
};

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
    .msg-reply-btn .material-icons { font-size: 18px; }
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
// PART 3 — EVENT LISTENERS
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    injectDynamicStyles();
    applyTheme(getStoredTheme());

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

            const text = ta.value;
            if (text.trim().length > 0) {
                ta.style.direction = isArabic(text) ? "rtl" : "ltr";
                ta.style.textAlign = isArabic(text) ? "right" : "left";
            } else {
                ta.style.direction = "ltr";
                ta.style.textAlign = "left";
            }
        });
    }

    // Escape closes any open overlay
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;

        const checks = [
            { id: "image-viewer-modal", fn: closeImageViewer },
            { id: "video-viewer-modal", fn: closeVideoViewer },
            { id: "image-preview-modal", fn: cancelImageSend },
            { id: "video-preview-modal", fn: cancelVideoSend },
            { id: "attachment-menu", fn: closeAttachmentMenu },
            { id: "todo-modal", fn: closeTodoModal },
            { id: "search-bar", fn: closeSearch }
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
});

window.addEventListener("beforeunload", async () => {
    if (state.currentUserEmail) await updatePresence(false);
    if (state.channel) state.channel.unsubscribe();
    if (state.todoDayWatcher) clearInterval(state.todoDayWatcher);
});
