// Chat load/pagination, realtime subscription, search, reply, sending text messages
// Split out of the original single app.js — see AGENTS.md for the module map.

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
    // Hide jump-mode banner if active
    const jb = document.getElementById("jump-banner");
    if (jb) jb.style.display = "none";
    const ji = document.getElementById("jump-date-input");
    if (ji) ji.value = "";

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
        notifyPartner("reloaded the chat 🔄");
    } catch (error) {
        console.error("Reload error:", error);
        updateConnectionStatus("disconnected");
    }
};

// ============================================================================
// PART 2 — PAGINATION
// ============================================================================

// Jump to a specific date — loads ALL messages on that day, then scroll-up loads older
window.jumpToDateFromMenu = async function (dateString) {
    if (!dateString || !state.supabaseClient) return;
    setHeaderToolsOpen(false);

    const dayStart = new Date(dateString + "T00:00:00").toISOString();
    const dayEnd   = new Date(dateString + "T23:59:59.999").toISOString();
    const dateLabel = new Date(dateString + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric"
    });

    updateConnectionStatus("loading");
    try {
        const { data, error } = await state.supabaseClient
            .from("chat_messages")
            .select("*")
            .gte("created_at", dayStart)
            .lte("created_at", dayEnd)
            .order("created_at", { ascending: true });
        if (error) throw error;

        const messages = filterVisibleMessages(data || []);
        if (!messages.length) {
            showAlert(`No messages found on ${dateLabel}. Try a different date.`);
            updateConnectionStatus("connected");
            // Reset the date input so user can pick again
            const input = document.getElementById("jump-date-input");
            if (input) input.value = "";
            return;
        }

        state.allMessages = messages;
        state.oldestMessageTimestamp = messages[0].created_at;
        state.hasMoreMessages = true;

        const messagesDiv = document.getElementById("messages");
        messagesDiv.querySelectorAll(".message-bubble, .date-separator").forEach(el => el.remove());
        state.allMessages.forEach(msg => renderMessage(msg, false));
        messagesDiv.scrollTop = 0;

        // Show the jump-mode banner
        const banner = document.getElementById("jump-banner");
        const bannerLabel = document.getElementById("jump-banner-label");
        if (banner) banner.style.display = "flex";
        if (bannerLabel) bannerLabel.textContent = dateLabel;

        updateConnectionStatus("connected");
        updateMessageCountNote();
    } catch (err) {
        console.error("Jump to date failed:", err);
        showAlert("Failed to load messages for that date.");
        updateConnectionStatus("connected");
    }
};

window.exitJumpMode = function () {
    const banner = document.getElementById("jump-banner");
    if (banner) banner.style.display = "none";
    const input = document.getElementById("jump-date-input");
    if (input) input.value = "";
    reloadChat();
};

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
        const newMessages = filterVisibleMessages(data).reverse(); // oldest first
        const trulyNew = newMessages.filter(m => !state.allMessages.some(e => e.id === m.id));
        if (!trulyNew.length) { updateLoadMoreButton(); return; }

        state.oldestMessageTimestamp = trulyNew[0].created_at;
        state.allMessages = sortMessagesByTime([...trulyNew, ...state.allMessages]);

        // Efficient prepend: build into a DocumentFragment, no full re-render
        const frag = document.createDocumentFragment();
        let lastFragDate = null;
        trulyNew.forEach(msg => {
            const dateLabel = getDateLabel(msg.created_at);
            if (dateLabel !== lastFragDate) {
                const sep = document.createElement("div");
                sep.className = "date-separator";
                sep.dataset.date = dateLabel;
                const span = document.createElement("span");
                span.textContent = dateLabel;
                sep.appendChild(span);
                frag.appendChild(sep);
                lastFragDate = dateLabel;
            }
            renderMessage(msg, false, frag); // render into fragment
        });

        // Remove first existing separator if it matches the last date in the new batch
        // (prevents duplicate date headers at the seam)
        const firstExistingSep = messagesDiv.querySelector(".date-separator");
        if (firstExistingSep && firstExistingSep.dataset.date === lastFragDate) {
            firstExistingSep.remove();
        }

        // Record scroll height before insert so user stays at same visual position
        const oldScrollHeight = messagesDiv.scrollHeight;

        // Insert fragment right after the spinner (before first existing message)
        const spinnerEl = document.getElementById("load-more-spinner");
        const insertBefore = spinnerEl ? spinnerEl.nextSibling : messagesDiv.firstChild;
        if (insertBefore) messagesDiv.insertBefore(frag, insertBefore);
        else messagesDiv.appendChild(frag);

        messagesDiv.scrollTop = messagesDiv.scrollHeight - oldScrollHeight;
        state.hasMoreMessages = data.length === CONFIG.pagination.pageSize;
        updateLoadMoreButton();
        updateMessageCountNote();
    } catch (error) {
        console.error("Load older failed:", error);
        showAlert("Failed to load older messages");
    } finally {
        state.isLoadingOlderMessages = false;
        if (spinner) spinner.style.display = "none";
    }
};

// loadAllMessages removed — replaced by jumpToDateFromMenu for performance.
// With 90k+ messages, loading everything at once freezes the browser.
// Use "Jump to Date" in the header menu instead.

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

// loadAllFromMenu removed — use jumpToDateFromMenu instead.

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

    let ticking = false;
    messagesDiv.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const atBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 50;
            state.isAtBottom = atBottom;
            if (jumpBtn) jumpBtn.style.display = atBottom ? "none" : "flex";
            if (atBottom) markVisibleMessagesAsRead();
            updateFloatingDate();
            ticking = false;
        });
    }, { passive: true });
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
            elephantOnMessageReceived();
            if (state.isAtBottom) await markMessageAsRead(message.id);

            const preview =
                message.message_type === "image" ? "📷 Photo" :
                    message.message_type === "video" ? "🎥 Video" :
                        message.message_type === "voice" ? "🎤 Voice message" :
                            (message.text || "Message");

            announceForScreenReader(`${USER_NAMES[message.sender] || "New message"}: ${preview}`);

            // Web Push handles this notification — no need to also call showNotification
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
            if (c) renderExpiredMediaState(c, "📷", "Photo opened 💕", "She saw it 🌸");
        }
    });

    state.channel.on("broadcast", { event: "video-viewed" }, (p) => {
        const { messageId, viewerId } = p.payload;
        updateMessageViewedState(messageId, viewerId);
        const el = document.querySelector(`[data-message-id="${messageId}"]`);
        if (el) {
            const c = el.querySelector(".message-video-container");
            if (c) renderExpiredMediaState(c, "🎥", "Video opened 💕", "She watched it 🌸");
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

    notifyPartner(`searched for "${query}" 🔍`);

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

    notifyPartner(`↩️ replying to: "${replyPreviewText}"`);

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

        notifyPartner(text.length > 100 ? text.substring(0, 100) + "…" : text);

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

