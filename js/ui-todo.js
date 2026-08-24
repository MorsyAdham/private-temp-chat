// General UI helpers plus the daily checklist / todo-list feature
// Split out of the original single app.js — see AGENTS.md for the module map.

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
    stopLoginFifiSpeech();
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";
}

// ---- LOGIN SCREEN FIFI SPEECH ----
const LOGIN_FIFI_LINES = [
    "Hi! I'm Fifi 🐘",
    "Welcome back! 💕",
    "Ready for some love? 🌸",
    "Type your password! 👀",
    "I missed you! 🥺",
    "Just you two 💕",
    "So cute that you're here 🌸",
    "Your little elephant says hi! 🐘",
    "Keeping all your secrets safe 🔒",
    "Log in, I'm waiting! ✨",
    "Fifi loves you! 💕",
];

let loginFifiTimer = null;
let loginFifiIndex = 0;

function startLoginFifiSpeech() {
    const wrap = document.getElementById("login-fifi-wrap");
    const bubble = document.getElementById("login-fifi-bubble");
    if (!wrap || !bubble) return;
    loginFifiIndex = Math.floor(Math.random() * LOGIN_FIFI_LINES.length);
    function show() {
        bubble.textContent = LOGIN_FIFI_LINES[loginFifiIndex];
        loginFifiIndex = (loginFifiIndex + 1) % LOGIN_FIFI_LINES.length;
        bubble.classList.remove("pop-in");
        void bubble.offsetWidth;
        bubble.classList.add("pop-in");
    }
    wrap.style.display = "block";
    show();
    loginFifiTimer = setInterval(show, 2500);
}

function stopLoginFifiSpeech() {
    if (loginFifiTimer) { clearInterval(loginFifiTimer); loginFifiTimer = null; }
    const wrap = document.getElementById("login-fifi-wrap");
    if (wrap) wrap.style.display = "none";
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
        loading: { cls: "loading", label: "Connecting…" },
        "uploading-photo": { cls: "loading", label: "Uploading photo…" },
        "uploading-video": { cls: "loading", label: "Uploading video…" },
        "sending-voice": { cls: "loading", label: "Sending voice…" },
        sending: { cls: "loading", label: "Sending…" }
    };

    const entry = map[status];
    if (entry) {
        if (entry.cls) div.classList.add(entry.cls);
        if (text) text.textContent = entry.label;
    } else {
        if (text) text.textContent = status;
    }
}

function announceForScreenReader(text) {
    const region = document.getElementById("sr-live-region");
    if (!region) return;
    region.textContent = "";
    // Re-set on the next frame so repeated identical messages still trigger an announcement.
    requestAnimationFrame(() => { region.textContent = text; });
}

function showAlert(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.setAttribute("role", "alert");
        container.setAttribute("aria-live", "assertive");
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast-visible"));
    setTimeout(() => {
        toast.classList.remove("toast-visible");
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

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
                <span class="material-symbols-outlined">add</span>
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
                        <span class="material-symbols-outlined">keyboard_arrow_up</span>
                    </button>
                    <button type="button" class="todo-mini-btn icon-only" ${isLastItem ? "disabled" : ""} onclick="moveTodoTemplateItem('${item.id}', 'down')" title="Move down">
                        <span class="material-symbols-outlined">keyboard_arrow_down</span>
                    </button>
                    <button type="button" class="todo-mini-btn icon-only" onclick="removeTodoTemplateItem('${item.id}')" title="Delete task">
                        <span class="material-symbols-outlined">delete</span>
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

    if (!list || !categoryNav || !weekNav || !progressText || !scoreText || !totalScoreText || !subtitle || !footerNote) return;

    if (!state.currentUserEmail || (!isMyLove() && !isNobody())) return;

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
                    <span><span class="material-symbols-outlined">check</span></span>
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

