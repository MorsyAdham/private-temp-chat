// Config constants, USER_NAMES, themes list, todo/category constants
// Split out of the original single app.js — see AGENTS.md for the module map.

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    supabase: {
        url: "https://twvwusthqhxnmghcnbjk.supabase.co",
        key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnd1c3RocWh4bm1naGNuYmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzUwMTAsImV4cCI6MjA4MTkxMTAxMH0.zPw0OH5TaWCM_SLGQYpUAp00mVZwamR13KPDs_HRb7s"
    },
    pagination: {
        initialLoad: 200,
        pageSize: 150
    },
    vapid: {
        publicKey: "BDNr_hcau1wH8wi6hT5L98_J0Vguop-8oi7x0vVQSGyRH96_kiAePm6rYiBmLY6zHEUQHcA1Q2LkAlSp9ptiB8g"
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
const CHECKLIST_POPUP_MUTED_KEY = "private-chat-checklist-popup-muted-v1";
const TELEGRAM_MUTED_KEY = "private-chat-telegram-muted-v1";
const CHROME_NOTIF_MUTED_KEY = "private-chat-chrome-notif-muted-v1";
const PUSH_DEFAULTS_APPLIED_KEY = "private-chat-push-defaults-applied-v1";
const ELEPHANT_NAME = "Fifi";

// ── Web Push helpers ──────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

function getRecipientEmail() {
    if (state.currentUserEmail === "adhammorsy2311@gmail.com") return "ayaessam487@gmail.com";
    if (state.currentUserEmail === "ayaessam487@gmail.com") return "adhammorsy2311@gmail.com";
    return null;
}

async function subscribeToWebPush() {
    try {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        if (Notification.permission !== "granted") return;
        if (!CONFIG.vapid.publicKey) return;
        const reg = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise((_, rej) => setTimeout(() => rej(new Error("SW timeout")), 5000))
        ]);
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(CONFIG.vapid.publicKey)
            });
        }
        await state.supabaseClient.from("push_subscriptions").upsert(
            { user_email: state.currentUserEmail, endpoint: sub.endpoint, subscription: sub.toJSON() },
            { onConflict: "user_email,endpoint" }
        );
    } catch (err) {
        console.warn("Web Push subscribe:", err);
    }
}

async function sendWebPushToRecipient(title, body) {
    try {
        if (!CONFIG.vapid.publicKey) return;
        const to_email = getRecipientEmail();
        if (!to_email) return;
        await state.supabaseClient.functions.invoke("send-push", { body: { to_email, title, body } });
    } catch (err) {
        console.warn("Web Push send:", err);
    }
}
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

