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
        pageSize: 1000
    }
};

const USER_NAMES = {
    "adhammorsy2311@gmail.com": "Nobody",
    "ayaessam487@gmail.com": "My Love",
    "joboffers540@gmail.com": "JobOffers"
};

const ALLOWED_EMAILS = Object.keys(USER_NAMES);
const TODO_CATEGORY_CONFIG = {
    daily: {
        label: "Daily",
        description: "Fresh reset by day, with a Sunday to Saturday view",
        defaultPoints: 10
    },
    temporary: {
        label: "One-Time",
        description: "Add it for today only, then it clears tomorrow",
        defaultPoints: 10
    },
    weekly: {
        label: "Weekly",
        description: "Carries through the current Sunday to Saturday week",
        defaultPoints: 25
    },
    extra: {
        label: "Sweet Moments",
        description: "Cute bonus points for extra effort",
        defaultPoints: 15
    }
};
const TODO_CATEGORY_ORDER = ["daily", "weekly", "extra", "temporary"];
const TODO_WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6];
const TODO_WEEKDAY_META = [
    { index: 0, short: "Sun", narrow: "S", full: "Sunday" },
    { index: 1, short: "Mon", narrow: "M", full: "Monday" },
    { index: 2, short: "Tue", narrow: "T", full: "Tuesday" },
    { index: 3, short: "Wed", narrow: "W", full: "Wednesday" },
    { index: 4, short: "Thu", narrow: "T", full: "Thursday" },
    { index: 5, short: "Fri", narrow: "F", full: "Friday" },
    { index: 6, short: "Sat", narrow: "S", full: "Saturday" }
];
const DEFAULT_REACTION_EMOJIS = ["❤️", "🥰", "😘", "😮", "😂", "😢"];
const DAILY_TODO_TEMPLATE_TABLE = "daily_todo_templates";
const TODO_REMINDER_STORAGE_KEY = "private-chat-todo-reminder-v1";
const TODO_REMINDER_INTERVAL_MS = 3 * 60 * 60 * 1000;
const TODO_REMINDER_MESSAGE = "💕 Gentle reminder baby: open your checklist and update it when you can 🌸";

const DAILY_TODO_TEMPLATE = {
    id: "my-love-daily-default",
    owner: "adhammorsy2311@gmail.com",
    targetUser: "ayaessam487@gmail.com",
    title: "🌸 Daily Checklist",
    items: [
        { id: "put-medicine-in-bag", text: "Put your medicine in your bag", emoji: "💊", category: "daily", points: 10, order: 1, active: true, encouragement: "Bag ready, smart girl. You remembered the important stuff 💕" },
        { id: "eat-breakfast", text: "Eat a good breakfast", emoji: "🥐", category: "daily", points: 10, order: 2, active: true, encouragement: "Breakfast first, pretty girl. I love seeing you take care of yourself 🌸" },
        { id: "take-morning-medicine", text: "Take your morning medicine", emoji: "🌞", category: "daily", points: 10, order: 3, active: true, encouragement: "Morning medicine done. Good job habibti, keep going 💕" },
        { id: "enjoy-coffee", text: "Enjoy your coffee", emoji: "☕", category: "daily", points: 10, order: 4, active: true, encouragement: "Coffee time suits you so much, baby. Enjoy every sip ☕💕" },
        { id: "have-lunch", text: "Have lunch", emoji: "🍱", category: "daily", points: 10, order: 5, active: true, encouragement: "Lunch checked off. Proud of you for eating properly today 🌸" },
        { id: "finish-work", text: "Finish your work", emoji: "💼", category: "daily", points: 10, order: 6, active: true, encouragement: "Work done, superstar. You did amazing today 💼💕" },
        { id: "head-home-safely", text: "Head home safely", emoji: "🏡", category: "daily", points: 10, order: 7, active: true, encouragement: "Heading home safely makes my heart calm. Good girl 💕" },
        { id: "order-food", text: "Order your food", emoji: "🛍️", category: "daily", points: 10, order: 8, active: true, encouragement: "Food ordered. Love that you took care of dinner, baby 🌸" },
        { id: "self-care-check", text: "Have one calm self-care moment this week", emoji: "🌷", category: "weekly", points: 25, order: 9, active: true, encouragement: "That self-care moment matters. You deserve softness and peace 🌷💕" },
        { id: "water-bottle-refill", text: "Refill your water bottle for tomorrow", emoji: "🍼", category: "daily", points: 10, order: 10, active: true, encouragement: "Bottle refilled. Future-you is going to love you for that 💧💕" },
        { id: "go-into-room", text: "Go into your room", emoji: "🚪", category: "daily", points: 10, order: 11, active: true, encouragement: "Room time. Cozy mode activated for my favorite girl 🚪💕" },
        { id: "lock-door-securely", text: "Lock the door securely", emoji: "🔒", category: "daily", points: 10, order: 12, active: true, encouragement: "Door locked. Thank you for keeping yourself safe, habibti 🔒" },
        { id: "drink-some-water", text: "Drink some water", emoji: "💧", category: "daily", points: 10, order: 13, active: true, encouragement: "Water check. Good job baby, keep taking care of yourself 💧💕" },
        { id: "eat-meal", text: "Eat your meal", emoji: "🍽️", category: "daily", points: 10, order: 14, active: true, encouragement: "Meal finished. Proud of you, pretty girl 🍽️💕" },
        { id: "take-evening-medicine", text: "Take your evening medicine", emoji: "🌙", category: "daily", points: 10, order: 15, active: true, encouragement: "Evening medicine done. Perfect, baby 🌙💕" },
        { id: "double-check-door-locked", text: "Double-check the door is locked", emoji: "🔐", category: "daily", points: 10, order: 16, active: true, encouragement: "Double-check done. Safe and secure, just how I want you 🔐💕" },
        { id: "rest-and-sleep", text: "Get some rest and go to sleep", emoji: "😴", category: "daily", points: 10, order: 17, active: true, encouragement: "Sleep time, my love. Rest well and dream pretty 😴🌸" },
        { id: "send-a-cute-update", text: "Send a cute little update for extra love points", emoji: "💌", category: "extra", points: 15, order: 18, active: true, encouragement: "That cute update made my whole day better 💌💕" }
    ]
};

const DAILY_TODO_STORAGE_KEY = "my-love-daily-todo-progress-v1";
const DAILY_TODO_TABLE = "daily_todo_records";
const DAILY_TODO_SYNC_PREFIX = "__daily_todo_sync__:";
const THEME_STORAGE_KEY = "private-chat-theme-v1";
const APP_VIEW_STORAGE_KEY = "private-chat-app-view-v1";
const THEMES = {
    "midnight-cute": {
        emoji: "💕",
        label: "Midnight Cute"
    },
    cute: {
        emoji: "🌷",
        label: "Cute"
    },
    ink: {
        emoji: "🖤",
        label: "Ink (Dark)"
    },
    classic: {
        emoji: "💬",
        label: "Classic"
    }
};
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
    appViewEnabled: false,
    todoTemplate: DAILY_TODO_TEMPLATE,
    todoToday: null,
    todoDayWatcher: null,
    todoSyncMode: "unknown",
    todoTemplateSyncMode: "unknown",
    totalLoveScore: 0,
    loveStreak: 0,
    reactionSupport: "unknown",
    activeReactionPickerMessageId: null,
    activeTodoCategory: "daily",
    activeTodoDateKey: "",
    todoWeekRecords: {},
    headerToolsOpen: false,
    todoReminderWatcher: null,
    typingStopTimer: null,
    peerTypingTimer: null,
    isTypingActive: false
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
    updateComposerScrollbar(textarea);
}

function updateComposerScrollbar(textarea = document.getElementById("msg")) {
    const target = textarea || document.getElementById("msg");
    const rail = document.getElementById("composer-scrollbar");
    const thumb = document.getElementById("composer-scrollbar-thumb");
    if (!target || !rail || !thumb) return;

    const hasOverflow = target.scrollHeight - target.clientHeight > 2;
    const hasText = Boolean(target.value?.trim());

    if (!hasOverflow || !hasText) {
        rail.classList.add("hidden");
        thumb.style.height = "";
        thumb.style.transform = "";
        return;
    }

    const railHeight = rail.clientHeight;
    const thumbHeight = Math.max(24, Math.round((target.clientHeight / target.scrollHeight) * railHeight));
    const maxScrollTop = Math.max(1, target.scrollHeight - target.clientHeight);
    const maxThumbOffset = Math.max(0, railHeight - thumbHeight);
    const thumbOffset = (target.scrollTop / maxScrollTop) * maxThumbOffset;

    rail.classList.remove("hidden");
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translateY(${thumbOffset}px)`;
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

function slugifyTodoText(text) {
    return (text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || `todo-${Date.now()}`;
}

function getTodayDateKey() {
    return formatLocalDateKey(new Date());
}

function formatLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getWeekKey(dateKey = getTodayDateKey()) {
    const base = new Date(`${dateKey}T12:00:00`);
    base.setDate(base.getDate() - base.getDay());
    const year = base.getFullYear();
    const month = String(base.getMonth() + 1).padStart(2, "0");
    const day = String(base.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getTodoWeekdayMeta(dayIndex) {
    return TODO_WEEKDAY_META.find(day => day.index === dayIndex) || TODO_WEEKDAY_META[0];
}

function getTodoWeekdayIndex(dateKey = getTodayDateKey()) {
    return new Date(`${dateKey}T12:00:00`).getDay();
}

function getWeekDateKeys(dateKey = getTodayDateKey()) {
    const base = new Date(`${getWeekKey(dateKey)}T12:00:00`);
    return TODO_WEEKDAY_ORDER.map(offset => {
        const current = new Date(base);
        current.setDate(base.getDate() + offset);
        return formatLocalDateKey(current);
    });
}

function formatTodoDateLabel(dateKey, options = { weekday: "long", month: "short", day: "numeric" }) {
    if (!dateKey) return "";
    return new Date(`${dateKey}T12:00:00`).toLocaleDateString("en-US", options);
}

function normalizeTodoDaysOfWeek(item) {
    if (getTodoCategory(item) !== "daily") return [];

    const parsed = Array.isArray(item?.daysOfWeek)
        ? [...new Set(item.daysOfWeek
            .map(value => Number(value))
            .filter(value => Number.isInteger(value) && value >= 0 && value <= 6))]
            .sort((a, b) => a - b)
        : [];

    return parsed.length ? parsed : TODO_WEEKDAY_ORDER.slice();
}

function normalizeTodoActiveDate(item, fallbackDateKey = getTodayDateKey()) {
    if (getTodoCategory(item) !== "temporary") return "";
    return /^\d{4}-\d{2}-\d{2}$/.test(item?.activeDate || "") ? item.activeDate : fallbackDateKey;
}

function isTodoItemScheduledForDate(item, dateKey = getTodayDateKey()) {
    if (getTodoCategory(item) !== "daily") return true;
    return normalizeTodoDaysOfWeek(item).includes(getTodoWeekdayIndex(dateKey));
}

function isTodoItemActiveForDate(item, dateKey = getTodayDateKey()) {
    if (getTodoCategory(item) !== "temporary") return true;
    return normalizeTodoActiveDate(item, dateKey) === dateKey;
}

function getTodoCategory(item) {
    return TODO_CATEGORY_CONFIG[item?.category] ? item.category : "daily";
}

function getTodoItemPoints(item) {
    const category = getTodoCategory(item);
    const parsed = Number(item?.points);
    return Number.isFinite(parsed) && parsed > 0
        ? Math.round(parsed)
        : TODO_CATEGORY_CONFIG[category].defaultPoints;
}

function getTodoItemEncouragement(item) {
    return (item?.encouragement || "").trim() || DAILY_TODO_ENCOURAGEMENT_MESSAGE;
}

function getActiveTodoItems(dateKey = getTodayDateKey()) {
    return state.todoTemplate.items
        .filter(item => item.active !== false)
        .filter(item => isTodoItemActiveForDate(item, dateKey))
        .sort((a, b) => a.order - b.order);
}

function getScheduledTodoItems(dateKey = getTodayDateKey()) {
    return getActiveTodoItems(dateKey).filter(item => isTodoItemScheduledForDate(item, dateKey));
}

function normalizeTodoTemplate(template) {
    const sourceItems = Array.isArray(template?.items) ? template.items : DAILY_TODO_TEMPLATE.items;
    return {
        id: template?.id || DAILY_TODO_TEMPLATE.id,
        owner: template?.owner || DAILY_TODO_TEMPLATE.owner,
        targetUser: template?.targetUser || DAILY_TODO_TEMPLATE.targetUser,
        title: template?.title || DAILY_TODO_TEMPLATE.title,
        items: sourceItems.map((item, index) => {
            const category = getTodoCategory(item);
            return {
                id: item?.id || slugifyTodoText(item?.text || `todo-${index + 1}`),
                text: item?.text || "Untitled task",
                emoji: item?.emoji || "💕",
                category,
                encouragement: getTodoItemEncouragement(item),
                points: getTodoItemPoints({ ...item, category }),
                daysOfWeek: category === "daily" ? normalizeTodoDaysOfWeek(item) : [],
                activeDate: category === "temporary" ? normalizeTodoActiveDate(item) : "",
                order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index + 1,
                active: item?.active !== false
            };
        }).sort((a, b) => a.order - b.order)
    };
}

function createTodoRecord(dateKey = getTodayDateKey(), carryoverRecord = null) {
    const weekKey = getWeekKey(dateKey);
    const carryItems = Array.isArray(carryoverRecord?.items) ? carryoverRecord.items : [];
    const items = getActiveTodoItems(dateKey).map(item => {
        const carry = carryItems.find(source => (source.itemId || source.id) === item.id);
        const isWeekly = getTodoCategory(item) === "weekly";
        return {
            itemId: item.id,
            done: isWeekly ? Boolean(carry?.done) : false,
            completedAt: isWeekly ? carry?.completedAt || null : null
        };
    });

    return {
        templateId: state.todoTemplate.id,
        targetUser: state.todoTemplate.targetUser,
        dateKey,
        weekKey,
        items,
        summarySent: false
    };
}

function normalizeTodoRecord(record, fallbackDateKey = getTodayDateKey()) {
    const effectiveDateKey = record?.dateKey || fallbackDateKey;
    const normalized = createTodoRecord(effectiveDateKey);
    const sourceItems = Array.isArray(record?.items) ? record.items : [];

    normalized.templateId = record?.templateId || state.todoTemplate.id;
    normalized.targetUser = record?.targetUser || state.todoTemplate.targetUser;
    normalized.summarySent = Boolean(record?.summarySent);
    normalized.weekKey = record?.weekKey || getWeekKey(effectiveDateKey);
    normalized.items = normalized.items.map(item => {
        const match = sourceItems.find(source => (source.itemId || source.id) === item.itemId);
        return {
            itemId: item.itemId,
            done: Boolean(match?.done),
            completedAt: match?.completedAt || null
        };
    });

    return normalized;
}

function isTodoRecordMissingError(error) {
    return error?.code === "PGRST116";
}

function isTodoTableUnavailableError(error) {
    return error?.code === "42P01" || /daily_todo_records/i.test(error?.message || "");
}

function isTodoTemplateTableUnavailableError(error) {
    return error?.code === "42P01" || /daily_todo_templates/i.test(error?.message || "");
}

function isReactionColumnUnavailableError(error) {
    return error?.code === "42703" || /reactions_json/i.test(error?.message || "");
}

function mapTodoRowToRecord(row) {
    return normalizeTodoRecord({
        templateId: row?.template_id,
        targetUser: row?.target_email,
        dateKey: row?.date_key,
        weekKey: row?.week_key,
        items: Array.isArray(row?.items_json) ? row.items_json : []
    });
}

function mapTodoTemplateRowToTemplate(row) {
    return normalizeTodoTemplate({
        id: row?.id,
        owner: row?.owner_email,
        targetUser: row?.target_email,
        title: row?.title,
        items: Array.isArray(row?.items_json) ? row.items_json : []
    });
}

function createTodoSyncText(record) {
    return `${DAILY_TODO_SYNC_PREFIX}${JSON.stringify(normalizeTodoRecord(record))}`;
}

function parseTodoSyncText(text) {
    if (typeof text !== "string" || !text.startsWith(DAILY_TODO_SYNC_PREFIX)) return null;

    try {
        return normalizeTodoRecord(JSON.parse(text.slice(DAILY_TODO_SYNC_PREFIX.length)));
    } catch (error) {
        console.error("Todo sync message parse error:", error);
        return null;
    }
}

function extractTodoRecordFromMessage(message) {
    if (!message || message.message_type !== "text") return null;
    return parseTodoSyncText(message.text);
}

function filterVisibleMessages(messages) {
    return (messages || []).filter(message => !extractTodoRecordFromMessage(message));
}

async function fetchTodoRecordFromChatMessages(dateKey = getTodayDateKey()) {
    const { data, error } = await state.supabaseClient
        .from("chat_messages")
        .select("id, sender, text, message_type, created_at")
        .eq("message_type", "text")
        .like("text", `${DAILY_TODO_SYNC_PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) throw error;

    const match = (data || []).find(message => {
        const record = extractTodoRecordFromMessage(message);
        return record?.dateKey === dateKey;
    });

    return match ? extractTodoRecordFromMessage(match) : null;
}

async function fetchTodoWeekRecordsFromChatMessages(dateKey = getTodayDateKey()) {
    const weekDateKeys = new Set(getWeekDateKeys(dateKey));
    const { data, error } = await state.supabaseClient
        .from("chat_messages")
        .select("id, sender, text, message_type, created_at")
        .eq("message_type", "text")
        .like("text", `${DAILY_TODO_SYNC_PREFIX}%`)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) throw error;

    return (data || []).reduce((records, message) => {
        const record = extractTodoRecordFromMessage(message);
        if (!record || !weekDateKeys.has(record.dateKey) || records[record.dateKey]) return records;
        records[record.dateKey] = record;
        return records;
    }, {});
}

async function syncTodoRecordToChatMessages(record) {
    const normalized = normalizeTodoRecord(record);
    const { data, error } = await state.supabaseClient
        .from("chat_messages")
        .insert([{
            sender: state.currentUserEmail,
            text: createTodoSyncText(normalized),
            message_type: "text",
            read: true
        }])
        .select()
        .single();

    if (error) throw error;

    state.todoSyncMode = "chat";
    return extractTodoRecordFromMessage(data) || normalized;
}

function createTodoRowPayload(record) {
    const normalized = normalizeTodoRecord(record);
    const metrics = getTodoMetrics(normalized);
    const totalScore = getCombinedTodoScore(normalized);

    return {
        template_id: state.todoTemplate.id,
        target_email: state.todoTemplate.targetUser,
        date_key: normalized.dateKey,
        week_key: normalized.weekKey || getWeekKey(normalized.dateKey),
        items_json: normalized.items,
        score: metrics.score,
        completed_count: metrics.completedCount,
        total_count: metrics.totalCount,
        reward_tier: metrics.rewardTier,
        total_score: totalScore
    };
}

function createTodoTemplateRowPayload(template = state.todoTemplate) {
    const normalized = normalizeTodoTemplate(template);
    return {
        id: normalized.id,
        owner_email: normalized.owner,
        target_email: normalized.targetUser,
        title: normalized.title,
        items_json: normalized.items
    };
}

async function fetchTodoTemplateFromSupabase() {
    if (!state.supabaseClient) return normalizeTodoTemplate(state.todoTemplate);

    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TEMPLATE_TABLE)
        .select("id, owner_email, target_email, title, items_json")
        .eq("id", DAILY_TODO_TEMPLATE.id)
        .maybeSingle();

    if (error) {
        if (isTodoTemplateTableUnavailableError(error)) {
            state.todoTemplateSyncMode = "local";
            return normalizeTodoTemplate(DAILY_TODO_TEMPLATE);
        }
        throw error;
    }

    state.todoTemplateSyncMode = "supabase";
    return data ? mapTodoTemplateRowToTemplate(data) : normalizeTodoTemplate(DAILY_TODO_TEMPLATE);
}

async function syncTodoTemplateToSupabase(template = state.todoTemplate) {
    const normalized = normalizeTodoTemplate(template);
    if (!state.supabaseClient) return normalized;

    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TEMPLATE_TABLE)
        .upsert(createTodoTemplateRowPayload(normalized), { onConflict: "id" })
        .select("id, owner_email, target_email, title, items_json")
        .single();

    if (error) {
        if (isTodoTemplateTableUnavailableError(error)) {
            state.todoTemplateSyncMode = "local";
            throw new Error("The daily_todo_templates table is missing. Run the SQL setup file first.");
        }
        throw error;
    }

    state.todoTemplateSyncMode = "supabase";
    return mapTodoTemplateRowToTemplate(data);
}

async function fetchCarryoverWeeklyRecord(dateKey = getTodayDateKey()) {
    if (!state.supabaseClient || state.todoSyncMode === "local" || state.todoSyncMode === "chat") return null;

    const weekStart = getWeekDateKeys(dateKey)[0];
    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TABLE)
        .select("template_id, target_email, date_key, week_key, items_json")
        .eq("template_id", state.todoTemplate.id)
        .eq("target_email", state.todoTemplate.targetUser)
        .gte("date_key", weekStart)
        .lt("date_key", dateKey)
        .order("date_key", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        if (isTodoTableUnavailableError(error)) return null;
        throw error;
    }

    return data ? mapTodoRowToRecord(data) : null;
}

async function fetchTodoRecordFromSupabase(dateKey = getTodayDateKey()) {
    if (!state.supabaseClient || state.todoSyncMode === "local") return null;
    if (state.todoSyncMode === "chat") return fetchTodoRecordFromChatMessages(dateKey);

    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TABLE)
        .select("template_id, target_email, date_key, week_key, items_json")
        .eq("template_id", state.todoTemplate.id)
        .eq("target_email", state.todoTemplate.targetUser)
        .eq("date_key", dateKey)
        .maybeSingle();

    if (error) {
        if (isTodoRecordMissingError(error)) return null;

        if (isTodoTableUnavailableError(error)) {
            state.todoSyncMode = "chat";
            console.warn("Todo sync table is unavailable. Falling back to hidden chat-based checklist sync.");
            return fetchTodoRecordFromChatMessages(dateKey);
        }

        throw error;
    }

    if (!data) {
        state.todoSyncMode = "supabase";
        return null;
    }

    state.todoSyncMode = "supabase";
    return mapTodoRowToRecord(data);
}

async function syncTodoRecordToSupabase(record) {
    if (!state.supabaseClient || state.todoSyncMode === "local") return normalizeTodoRecord(record);
    if (state.todoSyncMode === "chat") return syncTodoRecordToChatMessages(record);

    const payload = createTodoRowPayload(record);
    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TABLE)
        .upsert(payload, { onConflict: "template_id,target_email,date_key" })
        .select("template_id, target_email, date_key, week_key, items_json")
        .single();

    if (error) {
        if (isTodoTableUnavailableError(error)) {
            state.todoSyncMode = "chat";
            console.warn("Todo sync table is unavailable. Using hidden chat-based checklist sync.");
            return syncTodoRecordToChatMessages(record);
        }

        throw error;
    }

    state.todoSyncMode = "supabase";
    return mapTodoRowToRecord(data);
}

async function fetchTodoRecordsForWeek(dateKey = getTodayDateKey()) {
    if (!state.supabaseClient || state.todoSyncMode === "local") return {};
    if (state.todoSyncMode === "chat") return fetchTodoWeekRecordsFromChatMessages(dateKey);

    const weekDateKeys = getWeekDateKeys(dateKey);
    const weekStart = weekDateKeys[0];
    const weekEnd = weekDateKeys[weekDateKeys.length - 1];
    const { data, error } = await state.supabaseClient
        .from(DAILY_TODO_TABLE)
        .select("template_id, target_email, date_key, week_key, items_json")
        .eq("template_id", state.todoTemplate.id)
        .eq("target_email", state.todoTemplate.targetUser)
        .gte("date_key", weekStart)
        .lte("date_key", weekEnd)
        .order("date_key", { ascending: true });

    if (error) {
        if (isTodoTableUnavailableError(error)) {
            state.todoSyncMode = "chat";
            console.warn("Todo sync table is unavailable. Using hidden chat-based checklist sync.");
            return fetchTodoWeekRecordsFromChatMessages(dateKey);
        }

        throw error;
    }

    state.todoSyncMode = "supabase";
    return (data || []).reduce((records, row) => {
        records[row.date_key] = mapTodoRowToRecord(row);
        return records;
    }, {});
}

function getStoredTodoRecord() {
    try {
        const raw = localStorage.getItem(DAILY_TODO_STORAGE_KEY);
        if (!raw) return null;
        return normalizeTodoRecord(JSON.parse(raw));
    } catch (error) {
        console.error("Todo parse error:", error);
        return null;
    }
}

function buildTodoWeekRecordMap(anchorDateKey = getTodayDateKey(), sourceRecords = {}) {
    const recordMap = {};
    let carryoverRecord = null;

    getWeekDateKeys(anchorDateKey).forEach(dateKey => {
        const sourceRecord = sourceRecords[dateKey];
        const record = sourceRecord
            ? normalizeTodoRecord(sourceRecord, dateKey)
            : createTodoRecord(dateKey, carryoverRecord);
        recordMap[dateKey] = record;
        carryoverRecord = record;
    });

    return recordMap;
}

function removeExpiredTemporaryTodoItems(template = state.todoTemplate, todayKey = getTodayDateKey()) {
    const normalized = normalizeTodoTemplate(template);
    const items = normalized.items.filter(item =>
        getTodoCategory(item) !== "temporary" || normalizeTodoActiveDate(item, todayKey) === todayKey
    );

    if (items.length === normalized.items.length) return normalized;
    return { ...normalized, items };
}

async function pruneExpiredTemporaryTodoItems(todayKey = getTodayDateKey()) {
    const cleanedTemplate = removeExpiredTemporaryTodoItems(state.todoTemplate, todayKey);
    if (cleanedTemplate.items.length === state.todoTemplate.items.length) return;

    state.todoTemplate = cleanedTemplate;
    if (state.todoToday) {
        state.todoToday = normalizeTodoRecord(state.todoToday);
        saveTodoRecord(state.todoToday);
    }

    if (!state.supabaseClient || state.todoTemplateSyncMode === "local") return;

    try {
        state.todoTemplate = await syncTodoTemplateToSupabase(cleanedTemplate);
        if (state.todoToday) {
            state.todoToday = normalizeTodoRecord(state.todoToday);
            saveTodoRecord(state.todoToday);
        }
    } catch (error) {
        console.error("Temporary todo cleanup error:", error);
    }
}

function syncTodoWeekRecords(record = state.todoToday) {
    const currentRecord = record ? normalizeTodoRecord(record) : null;
    const todayKey = currentRecord?.dateKey || getTodayDateKey();
    const sameWeek = getWeekKey(state.activeTodoDateKey || todayKey) === getWeekKey(todayKey);
    const sourceRecords = sameWeek ? { ...state.todoWeekRecords } : {};
    if (currentRecord) sourceRecords[todayKey] = currentRecord;
    state.todoWeekRecords = buildTodoWeekRecordMap(todayKey, sourceRecords);
    if (!sameWeek || !state.activeTodoDateKey || !state.todoWeekRecords[state.activeTodoDateKey]) {
        state.activeTodoDateKey = todayKey;
    }
}

function getTodoRecordForDate(dateKey = getTodayDateKey()) {
    if (!dateKey) return null;
    if (state.todoWeekRecords?.[dateKey]) return state.todoWeekRecords[dateKey];
    if (state.todoToday?.dateKey === dateKey) return state.todoToday;
    return null;
}

async function ensureCurrentTodoWeekRecords() {
    const todayKey = getTodayDateKey();
    const storedRecord = getStoredTodoRecord();
    let sourceRecords = {};

    try {
        sourceRecords = await fetchTodoRecordsForWeek(todayKey);
    } catch (error) {
        console.error("Todo week sync error:", error);
    }

    if (storedRecord && getWeekKey(storedRecord.dateKey) === getWeekKey(todayKey)) {
        sourceRecords[storedRecord.dateKey] = storedRecord;
    }

    if (state.todoToday && getWeekKey(state.todoToday.dateKey) === getWeekKey(todayKey)) {
        sourceRecords[state.todoToday.dateKey] = state.todoToday;
    }

    state.todoWeekRecords = buildTodoWeekRecordMap(todayKey, sourceRecords);
    if (!state.activeTodoDateKey || !state.todoWeekRecords[state.activeTodoDateKey]) {
        state.activeTodoDateKey = todayKey;
    }
}

function saveTodoRecord(record) {
    const normalized = normalizeTodoRecord(record);
    state.todoToday = normalized;
    syncTodoWeekRecords(normalized);
    localStorage.setItem(DAILY_TODO_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
}

function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES[storedTheme] ? storedTheme : "midnight-cute";
}

function getStoredAppViewPreference() {
    return localStorage.getItem(APP_VIEW_STORAGE_KEY) === "true";
}

function updateThemeControls() {
    const select = document.getElementById("theme-select");
    const emoji = document.getElementById("theme-toggle-emoji");
    const label = document.getElementById("theme-toggle-label");
    const themeMeta = THEMES[state.activeTheme] || THEMES.cute;

    if (emoji) emoji.textContent = themeMeta.emoji;
    if (label) label.textContent = "Theme";
    if (select) select.value = state.activeTheme;
}

function setHeaderToolsOpen(isOpen) {
    state.headerToolsOpen = Boolean(isOpen);
    const menu = document.getElementById("header-tools-menu");
    const button = document.getElementById("tools-toggle-btn");
    if (menu) menu.style.display = state.headerToolsOpen ? "flex" : "none";
    if (button) {
        button.setAttribute("aria-expanded", state.headerToolsOpen ? "true" : "false");
        button.title = state.headerToolsOpen ? "Close tools" : "More tools";
    }
}

window.toggleHeaderTools = function (event) {
    event?.stopPropagation();
    setHeaderToolsOpen(!state.headerToolsOpen);
};

function applyTheme(themeName) {
    const theme = THEMES[themeName] ? themeName : "midnight-cute";
    state.activeTheme = theme;
    document.body.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeControls();
};

window.setThemeFromMenu = function (themeName) {
    applyTheme(themeName);
    setHeaderToolsOpen(false);
};

window.toggleAppViewFromMenu = async function () {
    await toggleAppView();
    setHeaderToolsOpen(false);
};

function updateAppViewButton() {
    const button = document.getElementById("app-view-btn");
    const icon = document.getElementById("app-view-icon");
    const label = document.getElementById("app-view-label");
    if (!button || !icon || !label) return;

    const isEnabled = state.appViewEnabled;
    icon.textContent = isEnabled ? "fullscreen_exit" : "smartphone";
    label.textContent = isEnabled ? "Exit App View" : "App View";
    button.title = isEnabled ? "Exit app view" : "Enter app view";
    button.setAttribute("aria-label", button.title);
}

function applyViewportMetrics(viewportHeight = window.innerHeight) {
    const safeHeight = Math.max(320, Math.round(viewportHeight || window.innerHeight || 0));
    document.documentElement.style.setProperty("--app-height", `${safeHeight}px`);
}

function syncViewportLayout() {
    const vv = window.visualViewport;
    if (!vv) {
        applyViewportMetrics(window.innerHeight);
        return;
    }

    applyViewportMetrics(vv.height);

    if (window.innerHeight - vv.height > 120) {
        requestAnimationFrame(() => scrollToBottom(false));
    }
}

function ensureComposerVisible() {
    const composer = document.getElementById("voice-recording")?.style.display === "flex"
        ? document.getElementById("voice-recording")
        : document.querySelector(".input-area");

    if (!composer) return;

    requestAnimationFrame(() => {
        composer.scrollIntoView({ block: "end", inline: "nearest" });
        scrollToBottom(false);
    });
}

function applyAppViewLayout(enabled) {
    state.appViewEnabled = enabled;
    document.body.classList.toggle("app-view-enabled", enabled);
    localStorage.setItem(APP_VIEW_STORAGE_KEY, String(enabled));
    updateAppViewButton();
}

async function requestBrowserFullscreen() {
    if (document.fullscreenElement || !document.documentElement.requestFullscreen) return;
    try {
        await document.documentElement.requestFullscreen();
    } catch (error) {
        console.warn("Fullscreen request was not granted:", error);
    }
}

async function exitBrowserFullscreen() {
    if (!document.fullscreenElement || !document.exitFullscreen) return;
    try {
        await document.exitFullscreen();
    } catch (error) {
        console.warn("Fullscreen exit failed:", error);
    }
}

window.toggleAppView = async function () {
    if (state.appViewEnabled) {
        await exitBrowserFullscreen();
        applyAppViewLayout(false);
        return;
    }

    applyAppViewLayout(true);
    await requestBrowserFullscreen();
};

function getTodoMetrics(record = state.todoToday, category = null, dateKey = record?.dateKey || getTodayDateKey()) {
    const activeItems = category
        ? getScheduledTodoItems(dateKey).filter(item => getTodoCategory(item) === category)
        : getScheduledTodoItems(dateKey);
    const totalCount = activeItems.length;
    const completedEntries = (record?.items || []).filter(item =>
        item.done && activeItems.some(templateItem => templateItem.id === item.itemId)
    );
    const completedCount = completedEntries.length;
    const score = completedEntries.reduce((sum, entry) => {
        const templateItem = activeItems.find(item => item.id === entry.itemId);
        return sum + getTodoItemPoints(templateItem);
    }, 0) + (completedCount === totalCount && totalCount > 0 ? 20 : 0);
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

function getCombinedTodoScore(record = state.todoToday, dateKey = record?.dateKey || getTodayDateKey()) {
    return TODO_CATEGORY_ORDER.reduce((sum, category) => {
        if (!getTodoItemsByCategory(category, dateKey).length) return sum;
        return sum + getTodoMetrics(record, category, dateKey).score;
    }, 0);
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

    const metrics = getTodoMetrics(record, null, record.dateKey);
    const message = `💕 End of day update for My Love\n🌸 Daily Checklist\n${metrics.completedCount}/${metrics.totalCount} tasks done\nScore: ${metrics.score}\nReward: ${metrics.rewardLabel}\n${getTodoDayEndMessage(metrics)}`;

    try {
        await sendTelegramNotification(message);
        record.summarySent = true;
        saveTodoRecord(record);
    } catch (error) {
        console.error("Todo summary error:", error);
    }
}

function getLastTodoReminderAt() {
    const raw = localStorage.getItem(TODO_REMINDER_STORAGE_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
}

function setLastTodoReminderAt(timestamp) {
    localStorage.setItem(TODO_REMINDER_STORAGE_KEY, String(timestamp));
}

async function maybeSendTodoReminder() {
    if (!state.currentUserEmail || !state.todoToday) return;
    if (getTodoMetrics(state.todoToday).percent === 100) return;

    const now = Date.now();
    if (now - getLastTodoReminderAt() < TODO_REMINDER_INTERVAL_MS) return;

    try {
        const thresholdIso = new Date(now - TODO_REMINDER_INTERVAL_MS).toISOString();
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .select("id, created_at")
            .eq("message_type", "system")
            .eq("text", TODO_REMINDER_MESSAGE)
            .gte("created_at", thresholdIso)
            .order("created_at", { ascending: false })
            .limit(1);

        if (error) throw error;
        if ((data || []).length) {
            setLastTodoReminderAt(now);
            return;
        }

        await sendSystemMessage(TODO_REMINDER_MESSAGE, {
            notifyTelegram: true,
            telegramText: `💕 Checklist reminder for My Love\n${TODO_REMINDER_MESSAGE}`
        });
        setLastTodoReminderAt(now);
    } catch (error) {
        console.error("Todo reminder error:", error);
    }
}

async function refreshTodoScoreboard() {
    if (!state.supabaseClient || state.todoSyncMode === "local" || state.todoSyncMode === "chat") {
        state.totalLoveScore = getCombinedTodoScore(state.todoToday);
        state.loveStreak = getTodoMetrics(state.todoToday).completedCount > 0 ? 1 : 0;
        renderLoveStatsBar();
        return;
    }

    try {
        const { data, error } = await state.supabaseClient
            .from(DAILY_TODO_TABLE)
            .select("date_key, score, completed_count")
            .eq("template_id", state.todoTemplate.id)
            .eq("target_email", state.todoTemplate.targetUser)
            .order("date_key", { ascending: false })
            .limit(365);

        if (error) throw error;

        const rows = data || [];
        state.totalLoveScore = rows.reduce((sum, row) => sum + (Number(row.score) || 0), 0);

        let streak = 0;
        let cursor = new Date(`${getTodayDateKey()}T12:00:00`);
        const rowMap = new Map(rows.map(row => [row.date_key, row]));

        while (true) {
            const key = cursor.toISOString().slice(0, 10);
            const row = rowMap.get(key);
            if (!row || (Number(row.completed_count) || 0) <= 0) break;
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
        }

        state.loveStreak = streak;
        renderLoveStatsBar();
    } catch (error) {
        console.error("Todo scoreboard error:", error);
    }
}

async function ensureCurrentTodoRecord() {
    if (!state.currentUserEmail) return;

    try {
        state.todoTemplate = await fetchTodoTemplateFromSupabase();
    } catch (error) {
        console.error("Todo template sync error:", error);
        state.todoTemplate = normalizeTodoTemplate(DAILY_TODO_TEMPLATE);
    }

    await pruneExpiredTemporaryTodoItems();

    const todayKey = getTodayDateKey();
    const storedRecord = getStoredTodoRecord();

    if (storedRecord && storedRecord.dateKey !== todayKey) {
        await sendTodoDaySummary(storedRecord);
    }

    try {
        let record = await fetchTodoRecordFromSupabase(todayKey);

        if (!record) {
            const weeklyCarryover = await fetchCarryoverWeeklyRecord(todayKey);
            record = storedRecord?.dateKey === todayKey
                ? storedRecord
                : createTodoRecord(todayKey, weeklyCarryover);

            record = await syncTodoRecordToSupabase(record);
        }

        saveTodoRecord(record);
    } catch (error) {
        console.error("Todo sync error:", error);

        let record = storedRecord;
        if (!record || record.dateKey !== todayKey) {
            record = createTodoRecord(todayKey);
        }

        saveTodoRecord(record);
    }

    state.activeTodoDateKey = todayKey;
    await ensureCurrentTodoWeekRecords();
    await refreshTodoScoreboard();
}

async function initializeDailyTodo() {
    await ensureCurrentTodoRecord();
    renderTodoModal();
    renderLoveStatsBar();

    if (state.todoDayWatcher) clearInterval(state.todoDayWatcher);
    state.todoDayWatcher = setInterval(async () => {
        await ensureCurrentTodoRecord();
        renderTodoModal();
    }, 60000);

    if (state.todoReminderWatcher) clearInterval(state.todoReminderWatcher);
    state.todoReminderWatcher = setInterval(() => {
        maybeSendTodoReminder();
    }, 60000);
    maybeSendTodoReminder();

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
        updateMessageCountNote();
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

        const messages = filterVisibleMessages(data).reverse();
        if (!messages.length) return;

        state.allMessages = messages.slice();
        state.oldestMessageTimestamp = messages[0].created_at;

        messages.forEach(msg => renderMessage(msg));
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

        const spinner = document.createElement("div");
        spinner.id = "load-more-spinner";
        spinner.className = "load-more-spinner";
        spinner.style.display = "none";
        spinner.innerHTML = '<span class="material-icons spin-icon">autorenew</span>';
        messagesDiv.appendChild(spinner);

        state.oldestMessageTimestamp = null;
        state.hasMoreMessages = true;
        state.unreadMessages.clear();
        state.allMessages = [];

        await loadInitialMessages();
        await setupRealtimeSubscription();
        updateConnectionStatus("connected");
        myLoveNotify("reloaded the chat 🔄");
    } catch (error) {
        console.error("Reload error:", error);
        updateConnectionStatus("disconnected");
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
    return filterVisibleMessages(all);
}

window.loadOlderMessages = async function () {
    if (state.isLoadingOlderMessages || !state.hasMoreMessages || !state.oldestMessageTimestamp) return;
    state.isLoadingOlderMessages = true;
    const spinner = document.getElementById("load-more-spinner");
    if (spinner) spinner.style.display = "flex";

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

        const newMessages = filterVisibleMessages(data).reverse();
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
    state.isLoadingOlderMessages = true;
    const spinner = document.getElementById("load-more-spinner");
    if (spinner) spinner.style.display = "flex";
    myLoveNotify("loaded all messages 📜");

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
        updateConnectionStatus("connected");
        updateMessageCountNote();
    } catch (error) {
        console.error("Load all failed:", error);
        showAlert("Failed to load all messages");
    } finally {
        state.isLoadingOlderMessages = false;
        if (spinner) spinner.style.display = "none";
    }
};

function updateLoadMoreButton() {
    const spinner = document.getElementById("load-more-spinner");
    if (spinner) spinner.style.display = "none";
    updateMessageCountNote();
}

function updateMessageCountNote() {
    const note = document.getElementById("msg-count-note");
    if (!note) return;
    const loaded = state.allMessages.length;
    if (!state.hasMoreMessages) {
        note.textContent = `All ${loaded} messages loaded`;
    } else {
        note.textContent = `${loaded} loaded · tap to load all`;
    }
}

window.loadAllFromMenu = async function () {
    setHeaderToolsOpen(false);
    await loadAllMessages();
    updateMessageCountNote();
};

function setupAutoLoadScroll() {
    const messagesDiv = document.getElementById("messages");
    if (!messagesDiv) return;
    let debounce = null;
    messagesDiv.addEventListener("scroll", () => {
        // Guard: initial load not finished yet (timestamp is null during/after clear)
        if (!state.oldestMessageTimestamp) return;
        if (messagesDiv.scrollTop > 160 || !state.hasMoreMessages || state.isLoadingOlderMessages) return;
        clearTimeout(debounce);
        debounce = setTimeout(async () => {
            if (!state.oldestMessageTimestamp) return;
            if (messagesDiv.scrollTop <= 160 && state.hasMoreMessages && !state.isLoadingOlderMessages) {
                const spinner = document.getElementById("load-more-spinner");
                if (spinner) spinner.style.display = "flex";
                await loadOlderMessages();
            }
        }, 250);
    }, { passive: true });
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
        const todoRecord = extractTodoRecordFromMessage(message);
        if (todoRecord) {
            saveTodoRecord(todoRecord);
            renderTodoModal();
            return;
        }

        if (state.allMessages.some(m => m.id === message.id)) return;

        state.allMessages.push(message);
        renderMessage(message, false);

        if (state.isAtBottom) scrollToBottom(true);

        if (message.sender !== state.currentUserEmail) {
            hideTypingIndicator();
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
    state.channel.on("broadcast", { event: "reaction-updated" }, (p) => applyMessageUpdate(p.payload));
    state.channel.on("broadcast", { event: "typing" }, (p) => {
        if (p.payload?.sender !== state.currentUserEmail) showTypingIndicator();
    });
    state.channel.on("broadcast", { event: "typing-stop" }, (p) => {
        if (p.payload?.sender !== state.currentUserEmail) hideTypingIndicator();
    });

    state.channel.on("broadcast", { event: "image-viewed" }, (p) => {
        const { messageId, viewerId } = p.payload;
        updateMessageViewedState(messageId, viewerId);
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) {
            const c = el.querySelector(".message-image-container");
            if (c) {
                c.innerHTML = '<div class="image-viewed-overlay"><span class="material-icons" style="font-size:18px">photo_camera</span> Opened</div>';
                c.style.cssText = "width:200px;height:160px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;";
            }
        }
    });

    state.channel.on("broadcast", { event: "video-viewed" }, (p) => {
        const { messageId, viewerId } = p.payload;
        updateMessageViewedState(messageId, viewerId);
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) {
            const c = el.querySelector(".message-video-container");
            if (c) renderExpiredMediaState(c, "videocam", "Opened");
        }
    });

    state.channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        if (p.new.sender !== state.currentUserEmail) handleNewMessage(p.new);
    });

    state.channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_messages" }, (p) => {
        applyMessageUpdate(p.new);
    });

    if (state.todoSyncMode === "supabase") {
        state.channel.on("postgres_changes", { event: "*", schema: "public", table: DAILY_TODO_TABLE }, (p) => {
            const row = p.new || p.old;
            if (!row) return;
            if (row.template_id !== state.todoTemplate.id) return;
            if (row.target_email !== state.todoTemplate.targetUser) return;
            if (!getWeekDateKeys().includes(row.date_key)) return;

            const record = mapTodoRowToRecord(row);
            if (row.date_key === getTodayDateKey()) {
                saveTodoRecord(record);
            } else {
                const sourceRecords = { ...state.todoWeekRecords, [row.date_key]: record };
                if (state.todoToday) sourceRecords[state.todoToday.dateKey] = state.todoToday;
                state.todoWeekRecords = buildTodoWeekRecordMap(getTodayDateKey(), sourceRecords);
            }
            refreshTodoScoreboard();
            renderTodoModal();
        });
    }

    if (state.todoTemplateSyncMode === "supabase") {
        state.channel.on("postgres_changes", { event: "*", schema: "public", table: DAILY_TODO_TEMPLATE_TABLE }, (p) => {
            const row = p.new || p.old;
            if (!row) return;
            if (row.id !== state.todoTemplate.id) return;

            state.todoTemplate = mapTodoTemplateRowToTemplate(row);
            if (state.todoToday) {
                state.todoToday = normalizeTodoRecord(state.todoToday);
                saveTodoRecord(state.todoToday);
            }
            ensureCurrentTodoWeekRecords();
            renderTodoModal();
        });
    }

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

window.toggleSearchFromMenu = function () {
    toggleSearch();
    setHeaderToolsOpen(false);
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

async function insertChatMessage(messageData) {
    const { data, error } = await state.supabaseClient
        .from("chat_messages")
        .insert([messageData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function sendSystemMessage(text, metadata = {}) {
    const systemMessage = await insertChatMessage({
        sender: metadata.sender || state.currentUserEmail || state.todoTemplate.owner,
        text,
        message_type: "system",
        read: true
    });

    if (!state.allMessages.some(message => message.id === systemMessage.id)) {
        state.allMessages.push(systemMessage);
        renderMessage(systemMessage, false);
        scrollToBottom(true);
    }

    if (state.channel) {
        await state.channel.send({ type: "broadcast", event: "new-message", payload: systemMessage });
    }

    const telegramText = metadata.telegramText || (metadata.notifyTelegram ? text : "");
    if (telegramText) {
        try {
            await sendTelegramNotification(telegramText);
        } catch (error) {
            console.error("System message Telegram notification error:", error);
        }
    }

    return systemMessage;
}

function getReplyPayload() {
    if (!state.replyToMessage) return {};

    return {
        reply_to_id: state.replyToMessage.id,
        reply_to_sender: state.replyToMessage.sender,
        reply_to_text:
            state.replyToMessage.message_type === "image" ? "📷 Photo" :
                state.replyToMessage.message_type === "video" ? "🎥 Video" :
                    state.replyToMessage.message_type === "voice" ? "🎤 Voice message" :
                        (state.replyToMessage.text || "")
    };
}

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

        Object.assign(msgData, getReplyPayload());

        const data = await insertChatMessage(msgData);

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
        textarea.scrollTop = 0;
        updateComposerScrollbar(textarea);
        cancelReply();
        updateSendVoiceToggle("");
        broadcastTyping(false);
        elephantOnSend();

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

function isSystemMessage(message) {
    return (message?.message_type || "text") === "system";
}

function normalizeMessageReactions(message) {
    return Array.isArray(message?.reactions_json)
        ? message.reactions_json
            .map(entry => ({
                emoji: entry?.emoji || "",
                users: Array.isArray(entry?.users) ? entry.users.filter(Boolean) : []
            }))
            .filter(entry => entry.emoji && entry.users.length)
        : [];
}

function getReactionCount(message) {
    return normalizeMessageReactions(message).reduce((sum, entry) => sum + entry.users.length, 0);
}

function closeReactionPickers() {
    document.querySelectorAll(".reaction-picker").forEach(el => el.remove());
    state.activeReactionPickerMessageId = null;
}

// ============================================================================
// TYPING INDICATOR
// ============================================================================

function broadcastTyping(active) {
    if (!state.channel) return;
    clearTimeout(state.typingStopTimer);
    if (active) {
        if (!state.isTypingActive) {
            state.isTypingActive = true;
            state.channel.send({ type: "broadcast", event: "typing", payload: { sender: state.currentUserEmail } });
        }
        state.typingStopTimer = setTimeout(() => {
            state.isTypingActive = false;
            state.channel.send({ type: "broadcast", event: "typing-stop", payload: { sender: state.currentUserEmail } });
        }, 3000);
    } else {
        if (state.isTypingActive) {
            state.isTypingActive = false;
            state.channel.send({ type: "broadcast", event: "typing-stop", payload: { sender: state.currentUserEmail } });
        }
    }
}

function showTypingIndicator() {
    const el = document.getElementById("typing-indicator");
    if (!el) return;
    el.style.display = "block";
    clearTimeout(state.peerTypingTimer);
    state.peerTypingTimer = setTimeout(hideTypingIndicator, 6000);
    if (state.isAtBottom) {
        const messagesDiv = document.getElementById("messages");
        if (messagesDiv) messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    elephantOnPeerTyping(true);
}

function hideTypingIndicator() {
    clearTimeout(state.peerTypingTimer);
    const el = document.getElementById("typing-indicator");
    if (el) el.style.display = "none";
    elephantOnPeerTyping(false);
}

// ============================================================================
// BABY ELEPHANT COMPANION
// ============================================================================

let elephantCurrentState = "idle";
let elephantThinkTimer = null;
let elephantHappyTimer = null;

function setElephantState(newState) {
    const el = document.getElementById("chat-elephant");
    if (!el || elephantCurrentState === newState) return;
    el.classList.remove(elephantCurrentState);
    el.classList.add(newState);
    elephantCurrentState = newState;
}

function elephantOnTypingInput(hasText) {
    clearTimeout(elephantThinkTimer);
    if (elephantCurrentState === "happy") return;
    if (hasText) {
        setElephantState("typing");
        elephantThinkTimer = setTimeout(() => {
            if (elephantCurrentState === "typing") setElephantState("thinking");
        }, 2200);
    } else {
        setElephantState("idle");
    }
}

function elephantOnSend() {
    clearTimeout(elephantThinkTimer);
    clearTimeout(elephantHappyTimer);
    setElephantState("happy");
    elephantHappyTimer = setTimeout(() => setElephantState("idle"), 1900);
}

function elephantOnPeerTyping(active) {
    if (elephantCurrentState === "happy" || elephantCurrentState === "typing" || elephantCurrentState === "thinking") return;
    setElephantState(active ? "waiting" : "idle");
}

// ---- INTERACTIVE TAPS ----
const ELEPHANT_FUN_STATES = ["surprised", "playful", "shy", "winking", "playful", "surprised"];
let elephantFunIndex = 0;
let elephantTapCount = 0;
let elephantTapResetTimer = null;
let elephantInteractionTimer = null;

function elephantHandleTap() {
    clearTimeout(elephantTapResetTimer);
    clearTimeout(elephantInteractionTimer);
    elephantTapCount++;

    elephantTapResetTimer = setTimeout(() => {
        const prevChatState = ["typing","thinking","waiting","happy"].includes(elephantCurrentState)
            ? elephantCurrentState : "idle";

        if (elephantTapCount >= 4) {
            // Many rapid taps = angry
            setElephantState("angry");
            elephantInteractionTimer = setTimeout(() => setElephantState("idle"), 1800);
        } else {
            const next = ELEPHANT_FUN_STATES[elephantFunIndex % ELEPHANT_FUN_STATES.length];
            elephantFunIndex++;
            setElephantState(next);
            const duration = next === "winking" ? 2200
                           : next === "shy"     ? 2000
                           : 1600;
            elephantInteractionTimer = setTimeout(() => {
                if (["surprised","playful","shy","winking","angry","tickled"].includes(elephantCurrentState)) {
                    setElephantState(["typing","thinking","waiting"].includes(prevChatState) ? prevChatState : "idle");
                }
            }, duration);
        }
        elephantTapCount = 0;
    }, 220);
}

function elephantHandleLongPress() {
    clearTimeout(elephantTapResetTimer);
    clearTimeout(elephantInteractionTimer);
    elephantTapCount = 0;
    setElephantState("tickled");
    elephantInteractionTimer = setTimeout(() => {
        setElephantState("happy");
        elephantHappyTimer = setTimeout(() => setElephantState("idle"), 1800);
    }, 1100);
}

function setupElephantInteraction() {
    const el = document.getElementById("chat-elephant");
    if (!el) return;
    let lpTimer = null;
    let startX = 0, startY = 0;

    el.addEventListener("pointerdown", (e) => {
        startX = e.clientX; startY = e.clientY;
        lpTimer = setTimeout(() => { lpTimer = null; elephantHandleLongPress(); }, 420);
    });
    el.addEventListener("pointermove", (e) => {
        if (!lpTimer) return;
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
            clearTimeout(lpTimer); lpTimer = null;
        }
    });
    ["pointerup","pointercancel"].forEach(ev => {
        el.addEventListener(ev, () => {
            if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; elephantHandleTap(); }
        });
    });
}

// ============================================================================
// MESSAGE CONTEXT MENU
// ============================================================================

let activeContextMenu = null;

function openMessageContextMenu(messageId, anchor) {
    closeMessageContextMenu();
    const message = state.allMessages.find(m => m.id === messageId);
    if (!message) return;

    const bubble = document.querySelector(`[data-message-id="${messageId}"]`);
    if (bubble) bubble.classList.add("menu-open");

    const menu = document.createElement("div");
    menu.className = "msg-context-menu";

    const reactBtn = document.createElement("button");
    reactBtn.className = "msg-context-option";
    reactBtn.innerHTML = '<span class="material-icons">add_reaction</span>React';
    reactBtn.onclick = (e) => {
        e.stopPropagation();
        closeMessageContextMenu();
        openReactionPicker(messageId);
    };
    menu.appendChild(reactBtn);

    const messageType = message.message_type || "text";
    if (messageType === "text" && message.text) {
        const copyBtn = document.createElement("button");
        copyBtn.className = "msg-context-option";
        copyBtn.innerHTML = '<span class="material-icons">content_copy</span>Copy';
        copyBtn.onclick = (e) => {
            e.stopPropagation();
            closeMessageContextMenu();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(message.text).catch(() => fallbackCopy(message.text));
            } else {
                fallbackCopy(message.text);
            }
        };
        menu.appendChild(copyBtn);
    }

    document.body.appendChild(menu);
    activeContextMenu = { menu, messageId };

    requestAnimationFrame(() => {
        const anchorRect = anchor.getBoundingClientRect();
        const menuW = menu.offsetWidth || 160;
        const menuH = menu.offsetHeight || 90;
        let left = anchorRect.left - menuW / 2 + anchorRect.width / 2;
        let top = anchorRect.top - menuH - 8;
        left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
        top = top < 8 ? anchorRect.bottom + 8 : top;
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;
    });
}

function closeMessageContextMenu() {
    if (!activeContextMenu) return;
    const { menu, messageId } = activeContextMenu;
    menu.remove();
    const bubble = document.querySelector(`[data-message-id="${messageId}"]`);
    if (bubble) bubble.classList.remove("menu-open");
    activeContextMenu = null;
}

function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
}

function positionReactionPicker(picker, bubble, isSender) {
    const rect = bubble.getBoundingClientRect();
    const pickerWidth = picker.offsetWidth || 280;
    const viewportWidth = window.innerWidth;
    const margin = 12;

    let left = isSender ? rect.left : rect.right - pickerWidth;
    left = Math.max(margin, Math.min(left, viewportWidth - pickerWidth - margin));

    const top = Math.max(margin, rect.top - picker.offsetHeight - 8);

    picker.style.position = "fixed";
    picker.style.left = `${left}px`;
    picker.style.top = `${top}px`;
    picker.style.right = "auto";
}

function addLongPressReaction(bubble, messageId) {
    let timer = null;
    let startX = 0;
    let startY = 0;
    let lastTapTime = 0;
    const shouldIgnore = (target) => !!target?.closest("input, button, textarea, audio, video, a, .voice-waveform, .voice-message, .message-reactions");

    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    };

    bubble.addEventListener("contextmenu", (e) => e.preventDefault());

    bubble.addEventListener("pointerdown", (event) => {
        if (shouldIgnore(event.target) || event.pointerType === "mouse") return;
        const now = Date.now();
        startX = event.clientX;
        startY = event.clientY;

        if (now - lastTapTime < 300) {
            // Double tap → heart reaction
            clearTimer();
            lastTapTime = 0;
            toggleMessageReaction(messageId, "❤️");
            return;
        }
        lastTapTime = now;

        timer = setTimeout(() => {
            openReactionPicker(messageId);
            clearTimer();
        }, 450);
    });

    bubble.addEventListener("pointermove", (event) => {
        if (!timer) return;
        if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) {
            clearTimer();
        }
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(eventName => {
        bubble.addEventListener(eventName, clearTimer);
    });
}

function renderMessageReactionBar(bubble, message) {
    let bar = bubble.querySelector(".message-reactions");
    const reactions = normalizeMessageReactions(message);

    if (!reactions.length) {
        if (bar) bar.remove();
        return;
    }

    if (!bar) {
        bar = document.createElement("div");
        bar.className = "message-reactions";
        bubble.appendChild(bar);
    }

    bar.innerHTML = "";
    reactions.forEach(entry => {
        entry.users.forEach(user => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = `reaction-chip ${user === state.currentUserEmail ? "mine" : ""}`;
            chip.textContent = entry.emoji;
            chip.title = `${USER_NAMES[user] || user} reacted with ${entry.emoji}`;
            chip.setAttribute("aria-label", chip.title);
            chip.onclick = (event) => {
                event.stopPropagation();
                if (user === state.currentUserEmail) {
                    toggleMessageReaction(message.id, entry.emoji);
                }
            };
            bar.appendChild(chip);
        });
    });
}

function renderSystemMessageContent(bubble, message) {
    const text = message.text || "";

    if (text.startsWith("✓ ")) {
        // Todo encouragement message — split into task line + cute message
        const newlineIdx = text.indexOf("\n");
        const taskLine = newlineIdx > -1 ? text.slice(0, newlineIdx) : text;
        const encouragementLine = newlineIdx > -1 ? text.slice(newlineIdx + 1).trim() : "";

        const taskEl = document.createElement("div");
        taskEl.className = "system-todo-task";
        taskEl.textContent = taskLine;
        bubble.appendChild(taskEl);

        if (encouragementLine) {
            const msgEl = document.createElement("div");
            msgEl.className = "system-todo-encouragement";
            msgEl.textContent = encouragementLine;
            bubble.appendChild(msgEl);
        }
    } else {
        const textDiv = document.createElement("div");
        textDiv.className = "system-message-text";
        textDiv.textContent = text;
        bubble.appendChild(textDiv);
    }
}

function getReactionMessagePreview(message) {
    if (!message) return "a message";

    if (message.message_type === "image") return "a photo";
    if (message.message_type === "video") return "a video";
    if (message.message_type === "voice") return "a voice message";
    if (message.message_type === "system") return "a system update";

    const text = (message.text || "").replace(/\s+/g, " ").trim();
    if (!text) return "a message";
    if (text.length <= 60) return `"${text}"`;
    return `"${text.slice(0, 57)}..."`;
}

window.openReactionPicker = function (messageId, anchor = null) {
    const bubble = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!bubble || bubble.classList.contains("system")) return;

    if (state.activeReactionPickerMessageId === messageId) {
        closeReactionPickers();
        return;
    }

    closeReactionPickers();
    state.activeReactionPickerMessageId = messageId;

    const picker = document.createElement("div");
    picker.className = "reaction-picker";
    DEFAULT_REACTION_EMOJIS.forEach(emoji => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "reaction-option";
        button.textContent = emoji;
        button.onclick = (event) => {
            event.stopPropagation();
            closeReactionPickers();
            toggleMessageReaction(messageId, emoji);
        };
        picker.appendChild(button);
    });

    const isSender = bubble.classList.contains("sender");
    document.body.appendChild(picker);
    if (isSender) {
        picker.classList.add("sender-side");
    } else {
        picker.classList.add("receiver-side");
    }
    requestAnimationFrame(() => positionReactionPicker(picker, bubble, isSender));
}

async function toggleMessageReaction(messageId, emoji) {
    if (!state.supabaseClient) return;

    const message = state.allMessages.find(entry => entry.id === messageId);
    if (!message) return;

    const reactions = normalizeMessageReactions(message).map(entry => ({
        emoji: entry.emoji,
        users: entry.users.slice()
    }));
    const existing = reactions.find(entry => entry.emoji === emoji);
    const hadUserReaction = !!existing?.users.includes(state.currentUserEmail);

    if (existing) {
        existing.users = existing.users.includes(state.currentUserEmail)
            ? existing.users.filter(user => user !== state.currentUserEmail)
            : existing.users.concat(state.currentUserEmail);
    } else {
        reactions.push({ emoji, users: [state.currentUserEmail] });
    }

    const cleaned = reactions.filter(entry => entry.users.length);

    try {
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .update({ reactions_json: cleaned })
            .eq("id", messageId)
            .select()
            .single();

        if (error) throw error;
        state.reactionSupport = "supabase";
        applyMessageUpdate(data);
        if (state.channel) {
            await state.channel.send({ type: "broadcast", event: "reaction-updated", payload: data });
        }

        const actionText = hadUserReaction ? "removed" : "reacted";
        myLoveNotify(`${actionText} ${emoji} to ${getReactionMessagePreview(message)}`);
    } catch (error) {
        console.error("Reaction update error:", error);
        if (isReactionColumnUnavailableError(error)) {
            state.reactionSupport = "unsupported";
            showAlert("Message reactions need the SQL setup file to add the reactions_json column.");
        }
    }
}

function applyMessageUpdate(message) {
    if (!message?.id) return;
    const index = state.allMessages.findIndex(entry => entry.id === message.id);
    if (index === -1) return;

    state.allMessages[index] = { ...state.allMessages[index], ...message };
    const bubble = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!bubble) return;

    renderMessageReactionBar(bubble, state.allMessages[index]);
    if (message.read !== undefined) updateMessageReadReceipt(message.id, message.read);
}

function renderMessage(message, prepend = false) {
    const messagesDiv = document.getElementById("messages");
    const isSender = message.sender === state.currentUserEmail;
    const messageType = message.message_type || "text";
    const isSystem = isSystemMessage(message);

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
    bubble.className = `message-bubble ${isSystem ? "system" : (isSender ? "sender" : "receiver")}`;
    if (messageType === "image") bubble.classList.add("image-message");
    if (messageType === "video") bubble.classList.add("video-message");
    bubble.dataset.messageId = message.id;
    bubble.dataset.timestamp = message.created_at;

    // Sender name (receiver only)
    if (!isSender && !isSystem) {
        const nameDiv = document.createElement("div");
        nameDiv.className = "sender-name";
        nameDiv.textContent = USER_NAMES[message.sender] || "Unknown";
        bubble.appendChild(nameDiv);
    }

    // Reply reference block
    if (message.reply_to_id && !isSystem) {
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
    if (isSystem) {
        renderSystemMessageContent(bubble, message);
    } else if (messageType === "image") {
        renderImageContent(bubble, message, isSender);
    } else if (messageType === "video") {
        renderVideoContent(bubble, message, isSender);
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

    if (isSender && !isSystem) {
        const receipt = document.createElement("span");
        receipt.className = `receipt ${message.read ? "read" : "sent"}`;
        receipt.textContent = message.read ? "✓✓" : "✓";
        metaDiv.appendChild(receipt);
    }

    bubble.appendChild(metaDiv);

    // Reply button (desktop hover)
    if (!isSystem) {
        const replyBtn = document.createElement("button");
        replyBtn.className = "msg-reply-btn";
        replyBtn.title = "Reply";
        replyBtn.innerHTML = '<span class="material-icons">reply</span>';
        replyBtn.onclick = (e) => { e.stopPropagation(); setReply(message.id); };
        bubble.appendChild(replyBtn);

        // Three-dot options button
        const menuBtn = document.createElement("button");
        menuBtn.className = "msg-menu-btn";
        menuBtn.type = "button";
        menuBtn.title = "Options";
        menuBtn.textContent = "⋮";
        menuBtn.onclick = (e) => { e.stopPropagation(); openMessageContextMenu(message.id, menuBtn); };
        bubble.appendChild(menuBtn);

        addLongPressReaction(bubble, message.id);

        // Swipe-to-reply (mobile)
        addSwipeToReply(bubble, message.id);
    }

    // Insert into DOM
    if (prepend) {
        const first = messagesDiv.querySelector(".message-bubble");
        if (first) messagesDiv.insertBefore(bubble, first);
        else messagesDiv.appendChild(bubble);
    } else {
        messagesDiv.appendChild(bubble);
    }

    renderMessageReactionBar(bubble, message);

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

function renderExpiredMediaState(container, iconName, label) {
    container.style.cssText = "width:200px;height:160px;background:#1e293b;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:13px;gap:6px;";
    container.innerHTML = `<span class="material-icons">${iconName}</span> ${label}`;
}

// --- Video content ---
function renderVideoContent(bubble, message, isSender) {
    const container = document.createElement("div");
    container.className = "message-video-container";
    const viewOnce = message.view_once || false;
    const viewedBy = message.viewed_by || [];
    const hasViewed = viewedBy.includes(state.currentUserEmail);
    const wasOpened = viewedBy.length > 0;

    if (viewOnce && (hasViewed || (isSender && wasOpened))) {
        renderExpiredMediaState(container, "videocam", isSender ? "Opened" : "Viewed");
    } else if (viewOnce && isSender && !wasOpened) {
        renderExpiredMediaState(container, "send", "Sent");
    } else {
        container.style.cssText = "position:relative;width:200px;height:150px;background:#1e293b;border-radius:8px;overflow:hidden;cursor:pointer;display:flex;align-items:center;justify-content:center;";
        container.innerHTML = `
        <span class="material-icons" style="font-size:40px;color:var(--text-secondary)">video_file</span>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:48px;height:48px;border-radius:50%;background:rgba(0,0,0,0.65);
          display:flex;align-items:center;justify-content:center;">
          <span class="material-icons" style="color:white;font-size:28px">play_arrow</span>
        </div>
      `;

        if (viewOnce && !isSender && !hasViewed) {
            const overlay = document.createElement("div");
            overlay.className = "view-once-overlay";
            overlay.innerHTML = '<span class="material-icons" style="font-size:14px">lock</span> View once';
            container.appendChild(overlay);
        }

        container.onclick = () => openVideoViewer(message.id, message.video_url, viewOnce, viewedBy, message.sender);
    }

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

    async function ensureVoiceAudio() {
        if (!audio) {
            const url = await getSignedUrl("voice-messages", message.voice_url);
            if (!url) return null;
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
        return audio;
    }

    playBtn.onclick = async () => {
        const readyAudio = await ensureVoiceAudio();
        if (!readyAudio) return;

        if (isPlaying) {
            readyAudio.pause();
            isPlaying = false;
            playBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        } else {
            await readyAudio.play();
            isPlaying = true;
            playBtn.innerHTML = '<span class="material-icons">pause</span>';
        }
    };

    seekbar.oninput = async () => {
        const readyAudio = await ensureVoiceAudio();
        if (!readyAudio) return;
        readyAudio.currentTime = Number(seekbar.value || 0);
        const pct = readyAudio.duration ? (readyAudio.currentTime / readyAudio.duration) * 100 : 0;
        progress.style.width = pct + "%";
        durationEl.textContent = formatDuration(readyAudio.currentTime);
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
    const isInteractiveTarget = (target) => {
        return !!target?.closest("input, button, textarea, audio, video, a, .voice-waveform, .voice-message");
    };

    bubble.addEventListener("touchstart", (e) => {
        if (isInteractiveTarget(e.target)) {
            active = false;
            return;
        }
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

    bubble.addEventListener("touchend", (e) => {
        if (isInteractiveTarget(e.target)) {
            active = false;
            curX = 0;
            return;
        }
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
    const floatingDateLabel = floatingDate ? floatingDate.querySelector(".floating-date-label") : null;
    if (!floatingDateLabel) return;

    const bubbles = messagesDiv.querySelectorAll(".message-bubble");
    for (const b of bubbles) {
        const rect = b.getBoundingClientRect();
        const containerRect = messagesDiv.getBoundingClientRect();
        if (rect.bottom > containerRect.top + 40) {
            floatingDateLabel.textContent = getDateLabel(b.dataset.timestamp);
            break;
        }
    }
}

function showChatScreen() {
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
}

function updateMessageViewedState(messageId, viewerId = state.currentUserEmail) {
    const message = state.allMessages.find(entry => entry.id === messageId);
    if (!message) return;

    const viewedBy = Array.isArray(message.viewed_by) ? message.viewed_by.slice() : [];
    if (!viewedBy.includes(viewerId)) {
        viewedBy.push(viewerId);
        message.viewed_by = viewedBy;
    }
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

function getProgressLevel(value, thresholds = { low: 1, medium: 3, high: 7, peak: 14 }) {
    if (value >= thresholds.peak) return "peak";
    if (value >= thresholds.high) return "high";
    if (value >= thresholds.medium) return "medium";
    if (value >= thresholds.low) return "low";
    return "zero";
}

function renderLoveStatsBar() {
    const streakCard = document.getElementById("header-streak-card");
    const streakText = document.getElementById("header-streak-text");
    if (streakText) streakText.textContent = state.loveStreak > 0 ? `${state.loveStreak}` : "0";
    if (streakCard) streakCard.dataset.level = getProgressLevel(state.loveStreak, { low: 1, medium: 3, high: 7, peak: 14 });
}

function getTodoItemsByCategory(category, dateKey = getTodayDateKey()) {
    return getActiveTodoItems(dateKey).filter(item => getTodoCategory(item) === category);
}

function getVisibleTodoCategories(dateKey = getTodayDateKey()) {
    return TODO_CATEGORY_ORDER.filter(category => {
        if (isNobody()) return true;
        return getTodoItemsByCategory(category, dateKey).length > 0;
    });
}

function getScheduledTodoItemsByCategory(category, dateKey = getTodayDateKey()) {
    return getTodoItemsByCategory(category, dateKey).filter(item => isTodoItemScheduledForDate(item, dateKey));
}

function getTodoViewDateKey(category = state.activeTodoCategory) {
    return category === "daily" ? (state.activeTodoDateKey || getTodayDateKey()) : getTodayDateKey();
}

function getTodoViewRecord(category = state.activeTodoCategory) {
    const dateKey = getTodoViewDateKey(category);
    return getTodoRecordForDate(dateKey) || createTodoRecord(dateKey);
}

function isTodoDateEditable(dateKey = getTodayDateKey()) {
    return dateKey === getTodayDateKey();
}

function getTodoCategoryProgress(category, record = state.todoToday, dateKey = record?.dateKey || getTodayDateKey()) {
    const items = getScheduledTodoItemsByCategory(category, dateKey);
    const entries = Array.isArray(record?.items) ? record.items : [];
    const completedCount = items.reduce((sum, item) => {
        const entry = entries.find(progressItem => progressItem.itemId === item.id);
        return sum + (entry?.done ? 1 : 0);
    }, 0);

    return {
        totalCount: items.length,
        completedCount
    };
}

window.setTodoCategory = function (category) {
    if (!TODO_CATEGORY_CONFIG[category]) return;
    state.activeTodoCategory = category;
    if (category === "daily" && !state.activeTodoDateKey) {
        state.activeTodoDateKey = getTodayDateKey();
    }
    renderTodoModal();
};

function ensureValidActiveTodoCategory() {
    const visibleCategories = getVisibleTodoCategories();
    if (!visibleCategories.length) {
        state.activeTodoCategory = "daily";
        return;
    }

    if (!visibleCategories.includes(state.activeTodoCategory)) {
        state.activeTodoCategory = visibleCategories[0];
    }
}

window.setTodoActiveDate = function (dateKey) {
    if (!dateKey || !state.todoWeekRecords?.[dateKey]) return;
    state.activeTodoDateKey = dateKey;
    renderTodoModal();
};

function renderTodoCategoryNav(container) {
    if (!container) return;
    ensureValidActiveTodoCategory();
    container.innerHTML = "";

    getVisibleTodoCategories()
        .forEach(category => {
            const dateKey = category === "daily" ? getTodoViewDateKey("daily") : getTodayDateKey();
            const record = category === "daily" ? getTodoViewRecord("daily") : state.todoToday;
            const progress = getTodoCategoryProgress(category, record, dateKey);
            const button = document.createElement("button");
            button.type = "button";
            button.className = `todo-category-tab ${state.activeTodoCategory === category ? "active" : ""}`;
            button.innerHTML = `
                <div class="todo-category-tab-top">
                    <strong>${escapeHtml(TODO_CATEGORY_CONFIG[category].label)}</strong>
                </div>
                <span class="todo-category-tab-meta">${progress.completedCount}/${progress.totalCount} done</span>
            `;
            button.onclick = () => setTodoCategory(category);
            container.appendChild(button);
        });
}

function renderTodoWeekNav(container) {
    if (!container) return;

    if (state.activeTodoCategory !== "daily" || !getTodoItemsByCategory("daily").length) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
    }

    const todayKey = getTodayDateKey();
    const activeDateKey = getTodoViewDateKey("daily");
    const weekDateKeys = getWeekDateKeys(todayKey);
    container.style.display = "grid";
    container.innerHTML = "";

    weekDateKeys.forEach(dateKey => {
        const dayMeta = getTodoWeekdayMeta(getTodoWeekdayIndex(dateKey));
        const record = getTodoRecordForDate(dateKey) || createTodoRecord(dateKey);
        const progress = getTodoCategoryProgress("daily", record, dateKey);
        const button = document.createElement("button");
        button.type = "button";
        button.className = `todo-weekday-tab ${activeDateKey === dateKey ? "active" : ""} ${todayKey === dateKey ? "today" : ""}`;
        button.innerHTML = `
            <strong>${dayMeta.short}</strong>
            <span>${new Date(`${dateKey}T12:00:00`).getDate()}</span>
            <small>${progress.completedCount}/${progress.totalCount}</small>
        `;
        button.onclick = () => setTodoActiveDate(dateKey);
        container.appendChild(button);
    });
}

function renderTodoEditorDayButtons(selectedDays = [], options = {}) {
    const mode = options.mode || "draft";
    const itemId = options.itemId || "";
    return TODO_WEEKDAY_META.map(day => {
        const isActive = selectedDays.includes(day.index);
        const action = mode === "draft"
            ? `toggleTodoDraftDay(${day.index})`
            : `toggleTodoTemplateItemDay('${itemId}', ${day.index})`;
        return `
            <button type="button"
                class="todo-editor-day ${isActive ? "active" : ""}"
                ${mode === "draft" ? `data-draft-day="${day.index}"` : ""}
                onclick="${action}">${day.short}</button>
        `;
    }).join("");
}

function getSelectedTodoDraftDays() {
    return Array.from(document.querySelectorAll(".todo-editor-composer [data-draft-day].active"))
        .map(button => Number(button.dataset.draftDay))
        .filter(value => Number.isInteger(value) && value >= 0 && value <= 6)
        .sort((a, b) => a - b);
}

window.toggleTodoDraftDay = function (dayIndex) {
    const button = document.querySelector(`.todo-editor-composer [data-draft-day="${dayIndex}"]`);
    if (!button) return;

    const activeButtons = document.querySelectorAll(".todo-editor-composer [data-draft-day].active");
    if (button.classList.contains("active") && activeButtons.length === 1) return;
    button.classList.toggle("active");
};

function resequenceTodoTemplateItems(items = []) {
    return items.map((item, index) => ({
        ...item,
        order: index + 1
    }));
}

function renderTodoTemplateEditor(list) {
    if (!isNobody()) return;

    const category = state.activeTodoCategory;
    const items = getTodoItemsByCategory(category);
    const editor = document.createElement("div");
    editor.className = "todo-editor";
    const categoryLabel = TODO_CATEGORY_CONFIG[category].label;
    const currentDayIndex = getTodoWeekdayIndex();
    editor.innerHTML = `
        <div class="todo-editor-header">
            <strong>Organize ${categoryLabel}</strong>
            <span>Add a new task first, then adjust the cards below if you want to fine-tune the details.</span>
        </div>
    `;

    const composer = document.createElement("div");
    composer.className = "todo-editor-composer";
    composer.innerHTML = `
        <div class="todo-editor-composer-header">
            <div>
                <strong>Add New ${categoryLabel} Task</strong>
                <p>${category === "daily"
                    ? "Choose where the task shows up during the Sunday to Saturday week."
                    : category === "temporary"
                        ? "These tasks are only for today and disappear automatically tomorrow."
                    : TODO_CATEGORY_CONFIG[category].description}</p>
            </div>
            <button type="button" class="todo-mini-btn todo-mini-btn-accent" onclick="addTodoTemplateItemFromForm('${category}')">
                <span class="material-icons">add</span>
                Create task
            </button>
        </div>
        <div class="todo-editor-grid">
            <label class="todo-editor-field todo-editor-field-emoji">
                <span>Emoji</span>
                <input type="text" id="todo-new-item-emoji" class="todo-editor-emoji" value="💕" maxlength="4">
            </label>
            <label class="todo-editor-field">
                <span>Task title</span>
                <input type="text" id="todo-new-item-text" class="todo-editor-text" value="" placeholder="Write the task clearly">
            </label>
            <label class="todo-editor-field todo-editor-field-points">
                <span>Points</span>
                <input type="number" id="todo-new-item-points" class="todo-editor-points" min="1" max="100" value="${TODO_CATEGORY_CONFIG[category]?.defaultPoints || 10}">
            </label>
        </div>
        <label class="todo-editor-field">
            <span>Encouragement message</span>
            <textarea id="todo-new-item-note" class="todo-editor-note" rows="2" placeholder="Cute message after the task gets checked">${escapeHtml(DAILY_TODO_ENCOURAGEMENT_MESSAGE)}</textarea>
        </label>
        ${category === "daily" ? `
            <div class="todo-editor-schedule todo-editor-schedule-panel">
                <span class="todo-editor-schedule-label">Show on these days</span>
                <div class="todo-editor-days">
                    ${renderTodoEditorDayButtons([currentDayIndex], { mode: "draft" })}
                </div>
            </div>
        ` : category === "temporary" ? `
            <div class="todo-editor-schedule todo-editor-schedule-panel">
                <span class="todo-editor-schedule-label">Availability</span>
                <p>This task will only stay in the One-Time list for today.</p>
            </div>
        ` : ""}
    `;
    editor.appendChild(composer);

    const section = document.createElement("div");
    section.className = "todo-editor-section";

    const header = document.createElement("div");
    header.className = "todo-editor-list-header";
    header.innerHTML = `
        <div>
            <strong>Current ${categoryLabel} Tasks</strong>
            <p>${items.length} task${items.length === 1 ? "" : "s"} in this category.</p>
        </div>
    `;
    section.appendChild(header);

    items.forEach(item => {
        const row = document.createElement("div");
        row.className = "todo-editor-item";
        const itemDays = normalizeTodoDaysOfWeek(item);
        const itemIndex = items.findIndex(entry => entry.id === item.id);
        const isFirstItem = itemIndex <= 0;
        const isLastItem = itemIndex === items.length - 1;
        row.innerHTML = `
            <div class="todo-editor-item-header">
                <div>
                    <strong>${escapeHtml(item.text)}</strong>
                    <span>${categoryLabel} task</span>
                </div>
                <div class="todo-editor-item-actions">
                    <button type="button" class="todo-mini-btn icon-only" ${isFirstItem ? "disabled" : ""} onclick="moveTodoTemplateItem('${item.id}', 'up')" title="Move up">
                        <span class="material-icons">keyboard_arrow_up</span>
                    </button>
                    <button type="button" class="todo-mini-btn icon-only" ${isLastItem ? "disabled" : ""} onclick="moveTodoTemplateItem('${item.id}', 'down')" title="Move down">
                        <span class="material-icons">keyboard_arrow_down</span>
                    </button>
                    <button type="button" class="todo-mini-btn icon-only" onclick="removeTodoTemplateItem('${item.id}')" title="Delete task">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
            <div class="todo-editor-grid">
                <label class="todo-editor-field todo-editor-field-emoji">
                    <span>Emoji</span>
                    <input type="text" class="todo-editor-emoji" value="${escapeHtml(item.emoji || "💕")}" maxlength="4"
                        onchange="updateTodoTemplateItem('${item.id}', 'emoji', this.value)">
                </label>
                <label class="todo-editor-field">
                    <span>Task title</span>
                    <input type="text" class="todo-editor-text" value="${escapeHtml(item.text)}"
                        onchange="updateTodoTemplateItem('${item.id}', 'text', this.value)">
                </label>
                <label class="todo-editor-field todo-editor-field-points">
                    <span>Points</span>
                    <input type="number" class="todo-editor-points" min="1" max="100" value="${getTodoItemPoints(item)}"
                        onchange="updateTodoTemplateItem('${item.id}', 'points', this.value)">
                </label>
            </div>
            <label class="todo-editor-field">
                <span>Encouragement message</span>
                <textarea class="todo-editor-note" rows="2"
                    onchange="updateTodoTemplateItem('${item.id}', 'encouragement', this.value)">${escapeHtml(getTodoItemEncouragement(item))}</textarea>
            </label>
        `;

        if (category === "daily") {
            const schedule = document.createElement("div");
            schedule.className = "todo-editor-schedule";
            schedule.innerHTML = `
                <span class="todo-editor-schedule-label">Show on</span>
                <div class="todo-editor-days">
                    ${renderTodoEditorDayButtons(itemDays, { mode: "item", itemId: item.id })}
                </div>
            `;
            row.appendChild(schedule);
        } else if (category === "temporary") {
            const schedule = document.createElement("div");
            schedule.className = "todo-editor-schedule";
            schedule.innerHTML = `
                <span class="todo-editor-schedule-label">Availability</span>
                <p>Visible on ${formatTodoDateLabel(normalizeTodoActiveDate(item))} only, then removed automatically.</p>
            `;
            row.appendChild(schedule);
        }

        section.appendChild(row);
    });

    editor.appendChild(section);

    list.appendChild(editor);
}

function renderTodoModal() {
    const list = document.getElementById("todo-list");
    const categoryNav = document.getElementById("todo-category-nav");
    const weekNav = document.getElementById("todo-week-nav");
    const progressText = document.getElementById("todo-progress-text");
    const scoreText = document.getElementById("todo-score-text");
    const totalScoreText = document.getElementById("todo-total-score-text");
    const subtitle = document.getElementById("todo-subtitle");
    const footerNote = document.getElementById("todo-footer-note");
    const todoBtn = document.getElementById("todo-btn");

    if (!list || !categoryNav || !weekNav || !progressText || !scoreText || !totalScoreText || !subtitle || !footerNote || !todoBtn) return;

    if (!state.currentUserEmail || (!isMyLove() && !isNobody())) {
        todoBtn.style.display = "none";
        return;
    }

    todoBtn.style.display = "flex";

    if (!state.todoToday) {
        state.todoToday = createTodoRecord();
        saveTodoRecord(state.todoToday);
    }

    const viewDateKey = getTodoViewDateKey();
    const viewRecord = getTodoViewRecord();
    const isViewingToday = isTodoDateEditable(viewDateKey);
    const metrics = getTodoMetrics(viewRecord, state.activeTodoCategory, viewDateKey);
    const categoryLabel = TODO_CATEGORY_CONFIG[state.activeTodoCategory]?.label || "Checklist";
    progressText.textContent = `${metrics.completedCount} / ${metrics.totalCount} ${categoryLabel.toLowerCase()} done`;
    scoreText.textContent = `💕 ${metrics.score} ${categoryLabel.toLowerCase()} points`;
    totalScoreText.textContent = `💖 ${state.totalLoveScore}`;
    scoreText.dataset.level = getProgressLevel(metrics.percent, { low: 1, medium: 40, high: 75, peak: 100 });
    renderLoveStatsBar();

    if (isMyLove()) {
        subtitle.textContent = state.activeTodoCategory === "daily"
            ? `🌸 ${formatTodoDateLabel(viewDateKey)}`
            : `🌸 ${categoryLabel} checklist`;
        if (state.activeTodoCategory === "daily" && !isViewingToday) {
            footerNote.textContent = viewDateKey < getTodayDateKey()
                ? `Saved progress from ${formatTodoDateLabel(viewDateKey)} stays here, but only today's daily list can be edited.`
                : `You can preview ${formatTodoDateLabel(viewDateKey)} here, but it only becomes checkable on that day.`;
        } else {
            footerNote.textContent = DAILY_TODO_ENCOURAGEMENT_MESSAGE;
        }
    } else if (isNobody()) {
        subtitle.textContent = state.activeTodoCategory === "daily"
            ? `🌸 ${formatTodoDateLabel(viewDateKey)}`
            : `🌸 ${categoryLabel} checklist`;
        footerNote.textContent = state.activeTodoCategory === "daily"
            ? `On ${formatTodoDateLabel(viewDateKey)} My Love has finished ${metrics.completedCount} of ${metrics.totalCount} tasks and collected ${metrics.score} points.`
            : `Today My Love has finished ${metrics.completedCount} of ${metrics.totalCount} tasks and collected ${metrics.score} points.`;
    } else {
        subtitle.textContent = state.activeTodoCategory === "daily"
            ? `🌸 ${formatTodoDateLabel(viewDateKey)}`
            : `🌸 ${categoryLabel} checklist`;
        footerNote.textContent = "Read-only view.";
    }

    list.innerHTML = "";
    renderTodoCategoryNav(categoryNav);
    renderTodoWeekNav(weekNav);

    const activeItems = getScheduledTodoItemsByCategory(state.activeTodoCategory, viewDateKey);
    if (activeItems.length) {
        const section = document.createElement("div");
        section.className = "todo-category-section";

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "todo-category-header";
        sectionHeader.innerHTML = `
            <div>
                <strong>${TODO_CATEGORY_CONFIG[state.activeTodoCategory].label}</strong>
                <p>${state.activeTodoCategory === "daily"
                    ? `${formatTodoDateLabel(viewDateKey)} · ${TODO_CATEGORY_CONFIG[state.activeTodoCategory].description}`
                    : TODO_CATEGORY_CONFIG[state.activeTodoCategory].description}</p>
            </div>
        `;
        section.appendChild(sectionHeader);

        activeItems.forEach(item => {
            const progress = viewRecord.items.find(entry => entry.itemId === item.id) || { done: false, completedAt: null };
            const canToggle = isMyLove() && isViewingToday;

            const row = document.createElement("div");
            row.className = `todo-item ${progress.done ? "completed" : ""}`;

            row.innerHTML = `
                <label class="todo-checkbox">
                    <input type="checkbox" ${progress.done ? "checked" : ""} ${canToggle ? "" : "disabled"} onchange="toggleTodoItem('${item.id}')">
                    <span><span class="material-icons">check</span></span>
                </label>
                <div class="todo-item-content">
                    <strong>${escapeHtml(item.emoji || "💕")} ${escapeHtml(item.text)}</strong>
                    <p>${progress.done
                        ? `Done at ${formatTime(progress.completedAt)} · +${getTodoItemPoints(item)} pts`
                        : (canToggle
                            ? `Tap when it's done · worth ${getTodoItemPoints(item)} pts`
                            : (state.activeTodoCategory === "daily" && !isViewingToday
                                ? (viewDateKey < getTodayDateKey()
                                    ? "Past daily tasks stay visible here, but they can no longer be edited."
                                    : "Future daily tasks can be previewed here and checked on their day.")
                                : "My Love can check this item from her account."))}</p>
                </div>
            `;

            section.appendChild(row);
        });

        list.appendChild(section);
    } else {
        const empty = document.createElement("div");
        empty.className = "todo-empty-state";
        empty.innerHTML = `
            <strong>No tasks here yet</strong>
            <p>${state.activeTodoCategory === "daily"
                ? `There are no daily tasks scheduled for ${formatTodoDateLabel(viewDateKey)}.`
                : `There are no ${categoryLabel.toLowerCase()} tasks in this checklist yet.`}</p>
        `;
        list.appendChild(empty);
    }

    renderTodoTemplateEditor(list);
}

async function persistTodoTemplateUpdate(nextTemplate) {
    state.todoTemplate = normalizeTodoTemplate(nextTemplate);
    if (state.todoToday) {
        state.todoToday = normalizeTodoRecord(state.todoToday);
        saveTodoRecord(state.todoToday);
    }
    renderTodoModal();

    try {
        state.todoTemplate = await syncTodoTemplateToSupabase(state.todoTemplate);
        if (state.todoToday) {
            state.todoToday = normalizeTodoRecord(state.todoToday);
            saveTodoRecord(state.todoToday);
        }
        renderTodoModal();
    } catch (error) {
        console.error("Todo template update error:", error);
        showAlert(error.message || "Failed to save checklist template.");
    }
}

window.addTodoTemplateItem = async function (category) {
    if (!isNobody()) return;

    const items = state.todoTemplate.items.slice();
    const nextOrder = items.length ? Math.max(...items.map(item => Number(item.order) || 0)) + 1 : 1;
    const currentDayIndex = getTodoWeekdayIndex();
    items.push({
        id: `${category}-${Date.now()}`,
        text: "New lovely task",
        emoji: "💕",
        category,
        encouragement: "Good job baby 💕 Im so proud of you, keep going youre doing amazing 💕",
        points: TODO_CATEGORY_CONFIG[category]?.defaultPoints || 10,
        daysOfWeek: category === "daily" ? [currentDayIndex] : [],
        activeDate: category === "temporary" ? getTodayDateKey() : "",
        order: nextOrder,
        active: true
    });

    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

window.addTodoTemplateItemFromForm = async function (category) {
    if (!isNobody()) return;

    const textInput = document.getElementById("todo-new-item-text");
    const emojiInput = document.getElementById("todo-new-item-emoji");
    const pointsInput = document.getElementById("todo-new-item-points");
    const noteInput = document.getElementById("todo-new-item-note");
    const text = textInput?.value?.trim() || "";

    if (!text) {
        showAlert("Write the task title first.");
        textInput?.focus();
        return;
    }

    const selectedDays = category === "daily" ? getSelectedTodoDraftDays() : [];
    if (category === "daily" && !selectedDays.length) {
        showAlert("Pick at least one day for the daily task.");
        return;
    }

    const items = state.todoTemplate.items.slice();
    const nextOrder = items.length ? Math.max(...items.map(item => Number(item.order) || 0)) + 1 : 1;
    items.push({
        id: `${category}-${Date.now()}`,
        text,
        emoji: emojiInput?.value?.trim() || "💕",
        category,
        encouragement: noteInput?.value?.trim() || DAILY_TODO_ENCOURAGEMENT_MESSAGE,
        points: Math.max(1, Number(pointsInput?.value) || (TODO_CATEGORY_CONFIG[category]?.defaultPoints || 10)),
        daysOfWeek: category === "daily" ? selectedDays : [],
        activeDate: category === "temporary" ? getTodayDateKey() : "",
        order: nextOrder,
        active: true
    });

    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

window.updateTodoTemplateItem = async function (itemId, field, value) {
    if (!isNobody()) return;

    const items = state.todoTemplate.items.map(item => {
        if (item.id !== itemId) return item;
        if (field === "points") return { ...item, points: Math.max(1, Number(value) || getTodoItemPoints(item)) };
        return { ...item, [field]: value };
    });

    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

window.removeTodoTemplateItem = async function (itemId) {
    if (!isNobody()) return;

    const items = resequenceTodoTemplateItems(
        state.todoTemplate.items
            .filter(item => item.id !== itemId)
            .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
    );
    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

window.moveTodoTemplateItem = async function (itemId, direction) {
    if (!isNobody()) return;

    const targetItem = state.todoTemplate.items.find(item => item.id === itemId);
    if (!targetItem) return;

    const sortedItems = state.todoTemplate.items
        .slice()
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const category = getTodoCategory(targetItem);
    const categoryIndexes = sortedItems.reduce((indexes, item, index) => {
        if (getTodoCategory(item) === category) indexes.push(index);
        return indexes;
    }, []);

    const currentIndex = categoryIndexes.findIndex(index => sortedItems[index].id === itemId);
    if (currentIndex === -1) return;

    const delta = direction === "up" ? -1 : 1;
    const targetCategoryIndex = currentIndex + delta;
    if (targetCategoryIndex < 0 || targetCategoryIndex >= categoryIndexes.length) return;

    const fromIndex = categoryIndexes[currentIndex];
    const toIndex = categoryIndexes[targetCategoryIndex];
    [sortedItems[fromIndex], sortedItems[toIndex]] = [sortedItems[toIndex], sortedItems[fromIndex]];

    const items = resequenceTodoTemplateItems(sortedItems);
    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

window.toggleTodoTemplateItemDay = async function (itemId, dayIndex) {
    if (!isNobody()) return;

    let blocked = false;
    const items = state.todoTemplate.items.map(item => {
        if (item.id !== itemId || getTodoCategory(item) !== "daily") return item;

        const currentDays = normalizeTodoDaysOfWeek(item);
        const nextDays = currentDays.includes(dayIndex)
            ? currentDays.filter(value => value !== dayIndex)
            : [...currentDays, dayIndex].sort((a, b) => a - b);

        if (!nextDays.length) {
            blocked = true;
            return item;
        }

        return { ...item, daysOfWeek: nextDays };
    });

    if (blocked) {
        showAlert("A daily task needs at least one selected day.");
        return;
    }

    await persistTodoTemplateUpdate({ ...state.todoTemplate, items });
};

async function announceTodoEncouragement(templateItem, metrics) {
    const emoji = templateItem?.emoji || "💕";
    const taskText = templateItem?.text || "A task";
    const encouragement = getTodoItemEncouragement(templateItem);
    const text = `✓ ${emoji} ${taskText}\n${encouragement}`;

    try {
        await sendSystemMessage(text, {
            notifyTelegram: true,
            telegramText: `💕 My Love finished: ${taskText}\n${encouragement}`
        });
    } catch (error) {
        console.error("System encouragement message error:", error);
    }
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
    const menu = document.getElementById("attachment-menu");
    const icon = document.getElementById("attach-btn-icon");
    const button = document.getElementById("attach-btn");
    if (menu) menu.style.display = "flex";
    if (icon) icon.textContent = "close";
    if (button) button.title = "Close attachments";
};

window.closeAttachmentMenu = function () {
    const menu = document.getElementById("attachment-menu");
    const icon = document.getElementById("attach-btn-icon");
    const button = document.getElementById("attach-btn");
    if (menu) menu.style.display = "none";
    if (icon) icon.textContent = "add";
    if (button) button.title = "Attach";
};

window.toggleAttachmentMenu = function (event) {
    event?.stopPropagation();
    const menu = document.getElementById("attachment-menu");
    if (!menu) return;
    if (menu.style.display === "flex") {
        closeAttachmentMenu();
        return;
    }
    openAttachmentMenu();
};

window.openTodoModal = async function () {
    await ensureCurrentTodoRecord();
    state.activeTodoDateKey = getTodayDateKey();
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
    if (!isTodoDateEditable(getTodoViewDateKey())) return;

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

    try {
        const syncedRecord = await syncTodoRecordToSupabase(state.todoToday);
        saveTodoRecord(syncedRecord);
        await refreshTodoScoreboard();
        renderTodoModal();
    } catch (error) {
        console.error("Todo update sync error:", error);
    }

    if (!wasDone && entry.done) {
        await refreshTodoScoreboard();
        await announceTodoEncouragement(templateItem, getTodoMetrics(state.todoToday));
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
    const replyPayload = getReplyPayload();

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
                    read: false,
                    ...replyPayload
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
        cancelReply();
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
    document.getElementById("video-view-once-checkbox").checked = false;
    document.getElementById("video-preview-modal").style.display = "flex";
    event.target.value = "";
};

window.cancelVideoSend = function () {
    state.selectedVideo = null;
    const v = document.getElementById("preview-video");
    v.pause(); v.src = "";
    document.getElementById("video-view-once-checkbox").checked = false;
    document.getElementById("video-preview-modal").style.display = "none";
};

window.confirmVideoSend = async function () {
    if (!state.selectedVideo) return;
    const file = state.selectedVideo;
    const viewOnce = document.getElementById("video-view-once-checkbox").checked;
    const replyPayload = getReplyPayload();
    state.selectedVideo = null;

    document.getElementById("video-preview-modal").style.display = "none";
    document.getElementById("video-view-once-checkbox").checked = false;
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
                view_once: viewOnce,
                viewed_by: [],
                read: false,
                ...replyPayload
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

        myLoveNotify(`sent ${viewOnce ? "a view-once video 🔒" : "a video 🎥"}`);

        cancelReply();
        updateConnectionStatus("connected");
    } catch (err) {
        console.error("confirmVideoSend:", err);
        showAlert("Failed to send video. Please try again.");
        updateConnectionStatus("connected");
    }
};

window.openVideoViewer = async function (messageId, videoPath, viewOnce, viewedBy, senderEmail) {
    const hasViewed = (viewedBy || []).includes(state.currentUserEmail);
    if (viewOnce && hasViewed) return;

    try {
        const url = await getSignedUrl("chat-videos", videoPath);
        if (!url) throw new Error("No URL");

        const v = document.getElementById("viewer-video");
        v.src = url;
        document.getElementById("video-viewer-modal").style.display = "flex";
        v.play();

        if (viewOnce && !hasViewed) {
            const nextViewedBy = [...(viewedBy || []), state.currentUserEmail];
            const { error } = await state.supabaseClient
                .from("chat_messages")
                .update({ viewed_by: nextViewedBy })
                .eq("id", messageId);
            if (error) throw error;

            updateMessageViewedState(messageId, state.currentUserEmail);

            setTimeout(() => {
                const el = document.querySelector(`[data-message-id="${messageId}"]`);
                if (el) {
                    const c = el.querySelector(".message-video-container");
                    if (c) renderExpiredMediaState(c, "videocam", "Viewed");
                }
            }, 100);

            if (state.channel) {
                state.channel.send({ type: "broadcast", event: "video-viewed", payload: { messageId, viewerId: state.currentUserEmail } });
            }

            myLoveNotify(`opened ${USER_NAMES[senderEmail] || senderEmail}'s view-once video 👀`);
            return;
        }

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
    const replyPayload = getReplyPayload();

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
                read: false,
                ...replyPayload
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
        cancelReply();
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
    applyAppViewLayout(getStoredAppViewPreference());
    syncViewportLayout();
    setupElephantInteraction();
    setupAutoLoadScroll();

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
