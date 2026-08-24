// Shared utility functions: formatting, DOM helpers, web push, escaping, etc.
// Split out of the original single app.js — see AGENTS.md for the module map.

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
    const backdrop = document.getElementById("header-tools-backdrop");
    const button = document.getElementById("tools-toggle-btn");
    if (menu) {
        menu.style.display = state.headerToolsOpen ? "flex" : "none";
        menu.classList.toggle("header-tools-menu--open", state.headerToolsOpen);
    }
    if (backdrop) backdrop.style.display = state.headerToolsOpen ? "block" : "none";
    document.body.classList.toggle("menu-sheet-open", state.headerToolsOpen);
    if (button) {
        button.setAttribute("aria-expanded", state.headerToolsOpen ? "true" : "false");
        button.title = state.headerToolsOpen ? "Close menu" : "Menu";
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
    updateStatusBarColor();
};

// Keeps the OS status bar (installed PWA) / browser toolbar color in sync with the
// active theme instead of staying stuck on whatever color was set at install time.
function updateStatusBarColor() {
    // Read the value straight from CSS so this never drifts out of sync with the
    // theme palettes defined there.
    const color = getComputedStyle(document.body).getPropertyValue("--dark-bg").trim();
    if (!color) return;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
        meta.setAttribute("content", color);
    });
}

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

