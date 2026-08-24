// Message rendering, typing indicator, elephant companion, message context menu
// Split out of the original single app.js — see AGENTS.md for the module map.

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
const ELEPHANT_FUN_STATES = ["surprised", "playful", "shy", "winking", "dancing", "love", "playful", "surprised"];
let elephantFunIndex = 0;
let elephantTapCount = 0;
let elephantTapResetTimer = null;
let elephantInteractionTimer = null;
let elephantIdleSpeechTimer = null;

const ELEPHANT_SPEECH_LINES = [
    `Hi! I'm ${ELEPHANT_NAME} 🐘💕`,
    "Tap me again! 🥰",
    "You're so cute 💕",
    "Miss you already 🌸",
    "Send a message! 💌",
    "I'm always here 🐘",
    "You look beautiful today 🌷",
    "Feeling playful today 🎉",
    `${ELEPHANT_NAME} loves you! 💕`,
    "Don't forget the checklist 🌸",
];
let elephantSpeechLineIndex = 0;

function showElephantBubble(text, duration = 2800) {
    const bubble = document.getElementById("elephant-bubble");
    const textEl = document.getElementById("elephant-bubble-text");
    const el = document.getElementById("chat-elephant");
    if (!bubble || !textEl || !el) return;

    textEl.textContent = text;
    bubble.style.display = "block";

    const rect = el.getBoundingClientRect();
    bubble.style.left = (rect.left + rect.width / 2) + "px";
    bubble.style.bottom = (window.innerHeight - rect.top + 6) + "px";

    bubble.classList.remove("eb-fade-in");
    void bubble.offsetWidth;
    bubble.classList.add("eb-fade-in");
    clearTimeout(bubble._hideTimer);
    bubble._hideTimer = setTimeout(() => {
        bubble.style.display = "none";
        bubble.classList.remove("eb-fade-in");
    }, duration);
}

function scheduleElephantIdleSpeech() {
    clearTimeout(elephantIdleSpeechTimer);
    elephantIdleSpeechTimer = setTimeout(() => {
        if (elephantCurrentState === "idle") {
            showElephantBubble(ELEPHANT_SPEECH_LINES[elephantSpeechLineIndex % ELEPHANT_SPEECH_LINES.length]);
            elephantSpeechLineIndex++;
        }
        scheduleElephantIdleSpeech();
    }, 18000 + Math.random() * 12000);
}

function elephantHandleTap() {
    clearTimeout(elephantTapResetTimer);
    clearTimeout(elephantInteractionTimer);
    elephantTapCount++;

    elephantTapResetTimer = setTimeout(() => {
        const prevChatState = ["typing","thinking","waiting","happy"].includes(elephantCurrentState)
            ? elephantCurrentState : "idle";

        if (elephantTapCount >= 5) {
            setElephantState("angry");
            showElephantBubble("Hey!! That hurts! 😤");
            elephantInteractionTimer = setTimeout(() => setElephantState("idle"), 2000);
        } else if (elephantTapCount === 2) {
            setElephantState("dancing");
            showElephantBubble("Woo hoo! 🎉");
            elephantInteractionTimer = setTimeout(() => {
                setElephantState(["typing","thinking","waiting"].includes(prevChatState) ? prevChatState : "idle");
            }, 2400);
        } else {
            const next = ELEPHANT_FUN_STATES[elephantFunIndex % ELEPHANT_FUN_STATES.length];
            elephantFunIndex++;
            setElephantState(next);
            const speeches = {
                surprised: "Oh! 😮",
                playful: "Wheee! 🎊",
                shy: "Heehee… 🙈",
                winking: "😉 psst!",
                dancing: "Let's dance! 💃",
                love: "Love you! 💕"
            };
            if (speeches[next]) showElephantBubble(speeches[next]);
            const duration = next === "winking" ? 2200 : next === "shy" ? 2000 : 1800;
            elephantInteractionTimer = setTimeout(() => {
                if (["surprised","playful","shy","winking","angry","tickled","dancing","love"].includes(elephantCurrentState)) {
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
    showElephantBubble("Hahaha!! 🤣 Stop it!!");
    elephantInteractionTimer = setTimeout(() => {
        setElephantState("happy");
        showElephantBubble("That was fun! 💕");
        elephantHappyTimer = setTimeout(() => setElephantState("idle"), 1800);
    }, 1100);
}

function elephantOnMessageReceived() {
    if (["typing","thinking","happy"].includes(elephantCurrentState)) return;
    setElephantState("love");
    elephantInteractionTimer = setTimeout(() => setElephantState("idle"), 2000);
}

function setupElephantInteraction() {
    const el = document.getElementById("chat-elephant");
    if (!el) return;

    el.setAttribute("title", `${ELEPHANT_NAME} 🐘`);

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

    el.addEventListener("mouseenter", () => {
        if (elephantCurrentState === "idle") showElephantBubble(`I'm ${ELEPHANT_NAME}! 🐘`, 2000);
    });

    scheduleElephantIdleSpeech();
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
        notifyPartner(`${actionText} ${emoji} to: "${getReactionMessagePreview(message)}"`);
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

// containerEl: when set, render into that element (fragment) — skips date sep + dupe check
function renderMessage(message, prepend = false, containerEl = null) {
    const messagesDiv = containerEl || document.getElementById("messages");
    const isSender = message.sender === state.currentUserEmail;
    const messageType = message.message_type || "text";
    const isSystem = isSystemMessage(message);

    // Skip duplicates only when rendering into live DOM
    if (!containerEl && document.querySelector(`[data-message-id="${message.id}"]`)) return;

    // Date separator — only when rendering into live DOM (caller handles it for fragments)
    if (!containerEl) {
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

    // Insert into DOM / container
    if (!containerEl && prepend) {
        const first = messagesDiv.querySelector(".message-bubble");
        if (first) messagesDiv.insertBefore(bubble, first);
        else messagesDiv.appendChild(bubble);
    } else {
        messagesDiv.appendChild(bubble);
    }

    renderMessageReactionBar(bubble, message);

    if (!containerEl && !isSender && !message.read) state.unreadMessages.add(message.id);
}

function isSingleEmoji(text) {
    if (!text || typeof text !== "string") return false;
    const stripped = text.trim();
    if (!stripped) return false;
    try {
        const segments = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(stripped)];
        if (segments.length !== 1) return false;
        const char = segments[0].segment;
        return /\p{Emoji}/u.test(char) && !/^[0-9#*]$/.test(char);
    } catch {
        return false;
    }
}

// --- Text with link detection + URL preview card ---
function renderTextContent(bubble, message) {
    const text = message.text || "";

    if (isSingleEmoji(text)) {
        bubble.classList.add("solo-emoji");
        const emojiDiv = document.createElement("div");
        emojiDiv.className = "solo-emoji-text";
        emojiDiv.textContent = text.trim();
        bubble.appendChild(emojiDiv);
        return;
    }

    const textDiv = document.createElement("div");
    textDiv.className = `message-text ${isArabic(text) ? "rtl" : "ltr"}`;
    renderTextWithLinks(textDiv, text);
    bubble.appendChild(textDiv);

    // Link preview card for first URL
    const url = extractFirstLink(text);
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

    if (viewOnce && (hasViewed || (isSender && wasOpened))) {
        renderExpiredMediaState(container, "📷",
            isSender ? "Photo opened 💕" : "Viewed once 💕",
            isSender ? "She saw it 🌸" : "Just for your eyes 💕");
    } else if (viewOnce && isSender && !wasOpened) {
        renderExpiredMediaState(container, "💌", "Sent", "Waiting for her 🌸");
    } else {
        const img = document.createElement("img");
        img.className = "message-image";
        img.alt = "Image";
        img.loading = "lazy";
        img.style.cursor = "pointer";
        img.onload = () => img.classList.add("media-loaded");

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

function renderExpiredMediaState(container, emoji, label, sublabel) {
    container.removeAttribute("style");
    if (!container.classList.contains("vo-expired-card")) container.classList.add("vo-expired-card");
    container.innerHTML = `<div class="vo-expired-inner">
        <span class="vo-expired-icon">${emoji}</span>
        <span class="vo-expired-label">${label}</span>
        ${sublabel ? `<span class="vo-expired-sub">${sublabel}</span>` : ""}
    </div>`;
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
        renderExpiredMediaState(container, "🎥",
            isSender ? "Video opened 💕" : "Viewed once 💕",
            isSender ? "She watched it 🌸" : "Just for your eyes 💕");
    } else if (viewOnce && isSender && !wasOpened) {
        renderExpiredMediaState(container, "💌", "Sent", "Waiting for her 🌸");
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

