const USER_NAMES = {
    "adhammorsy2311@gmail.com": "Nobody",
    "ayaessam487@gmail.com": "My Love"
};

const THEMES = {
    "midnight-cute": { emoji: "💕", label: "Midnight Cute" },
    cute: { emoji: "🌷", label: "Cute" },
    classic: { emoji: "🖤", label: "Classic" }
};

const TODO_CATEGORY_ORDER = ["daily", "weekly", "extra"];
const TODO_CATEGORY_CONFIG = {
    daily: { label: "Daily" },
    weekly: { label: "Weekly" },
    extra: { label: "Extra Love Points" }
};

const INITIAL_VISIBLE_MESSAGES = 10;
const DEMO_THEME_STORAGE_KEY = "private-chat-demo-theme-v1";
const DEMO_APP_VIEW_STORAGE_KEY = "private-chat-demo-app-view-v1";

const state = {
    currentUserEmail: "adhammorsy2311@gmail.com",
    activeTheme: "midnight-cute",
    appViewEnabled: false,
    allMessages: [],
    visibleCount: INITIAL_VISIBLE_MESSAGES,
    searchResults: [],
    currentSearchIndex: -1,
    replyToMessage: null,
    selectedImages: [],
    selectedVideo: null,
    voiceRecorder: null,
    voiceChunks: [],
    voiceRecordingStartTime: null,
    voiceRecordingInterval: null,
    voiceBlob: null,
    voicePreviewUrl: "",
    voicePreviewAudio: null,
    voicePreviewDurationSeconds: 0,
    headerToolsOpen: false,
    activeTodoCategory: "daily",
    todoTemplate: createDemoTodoTemplate()
};

function createDemoTodoTemplate() {
    return {
        streak: 4,
        items: [
            { id: "morning-check-in", text: "Send a cute morning check-in", emoji: "☀️", category: "daily", points: 10, done: true },
            { id: "voice-note-test", text: "Test a voice note safely", emoji: "🎤", category: "daily", points: 10, done: false },
            { id: "photo-share", text: "Try sending a sweet photo", emoji: "📷", category: "daily", points: 10, done: false },
            { id: "search-test", text: "Use search to jump around messages", emoji: "🔎", category: "daily", points: 10, done: true },
            { id: "theme-swap", text: "Switch the theme once", emoji: "🎨", category: "weekly", points: 25, done: false },
            { id: "app-view", text: "Toggle app view and back", emoji: "📱", category: "weekly", points: 25, done: false },
            { id: "long-chat", text: "Spam a few messages for fun", emoji: "💌", category: "extra", points: 15, done: false }
        ]
    };
}

function createSeedMessages() {
    const now = Date.now();
    const minutesAgo = (minutes) => new Date(now - minutes * 60000).toISOString();

    return [
        createMessage({
            id: "demo-001",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "This page is a safe demo, habibi. Nothing here goes to Supabase or Telegram.",
            created_at: minutesAgo(1800)
        }),
        createMessage({
            id: "demo-002",
            sender: "adhammorsy2311@gmail.com",
            message_type: "system",
            text: "Demo mode is local only. Refresh resets the fake chat.",
            created_at: minutesAgo(1798)
        }),
        createMessage({
            id: "demo-002b",
            sender: "adhammorsy2311@gmail.com",
            message_type: "system",
            text: "Nobody opened the safe demo room 💕",
            created_at: minutesAgo(1792)
        }),
        createMessage({
            id: "demo-003",
            sender: "adhammorsy2311@gmail.com",
            message_type: "text",
            text: "Perfect. I can test layouts, search, reply, media previews, and the checklist here.",
            created_at: minutesAgo(1760)
        }),
        createMessage({
            id: "demo-004",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "Try replying to this one so you can check the reply card too 💕",
            created_at: minutesAgo(1705)
        }),
        createMessage({
            id: "demo-005",
            sender: "adhammorsy2311@gmail.com",
            message_type: "image",
            image_url: "pic-2.jpg",
            text: "Demo photo",
            created_at: minutesAgo(1600)
        }),
        createMessage({
            id: "demo-006",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "Search for words like demo, reply, or checklist to test jumping between results.",
            created_at: minutesAgo(1450)
        }),
        createMessage({
            id: "demo-007",
            sender: "adhammorsy2311@gmail.com",
            message_type: "text",
            text: "I also want to test longer text wrapping so I know the bubble spacing still looks right on mobile and desktop widths.",
            created_at: minutesAgo(1320)
        }),
        createMessage({
            id: "demo-008",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "Then scroll up and use load older messages. That part stays fake too.",
            created_at: minutesAgo(1200)
        }),
        createMessage({
            id: "demo-009",
            sender: "adhammorsy2311@gmail.com",
            message_type: "text",
            text: "The reload button resets the demo conversation if I want a clean slate.",
            created_at: minutesAgo(950)
        }),
        createMessage({
            id: "demo-009b",
            sender: "adhammorsy2311@gmail.com",
            message_type: "system",
            text: "My Love completed 2 checklist tasks 🌸",
            created_at: minutesAgo(940)
        }),
        createMessage({
            id: "demo-010",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "You can attach local images or videos here and they will only live in this browser session.",
            created_at: minutesAgo(720)
        }),
        createMessage({
            id: "demo-010b",
            sender: "adhammorsy2311@gmail.com",
            message_type: "system",
            text: "Nobody is replying with extra love points 💌",
            created_at: minutesAgo(710)
        }),
        createMessage({
            id: "demo-011",
            sender: "adhammorsy2311@gmail.com",
            message_type: "text",
            text: "Nice. That means no accidental test clutter in the real room.",
            created_at: minutesAgo(360)
        }),
        createMessage({
            id: "demo-012",
            sender: "ayaessam487@gmail.com",
            message_type: "text",
            text: "Exactly. This one is just for you to test safely.",
            created_at: minutesAgo(120)
        })
    ];
}

function createMessage(overrides) {
    return {
        id: overrides.id || `demo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender: overrides.sender || state.currentUserEmail,
        message_type: overrides.message_type || "text",
        text: overrides.text || "",
        created_at: overrides.created_at || new Date().toISOString(),
        read: true,
        image_url: overrides.image_url || "",
        video_url: overrides.video_url || "",
        voice_url: overrides.voice_url || "",
        voice_duration: overrides.voice_duration || "",
        reply_to_id: overrides.reply_to_id || null,
        reply_to_sender: overrides.reply_to_sender || null,
        reply_to_text: overrides.reply_to_text || null
    };
}

function initializeDemo() {
    state.allMessages = createSeedMessages();
    state.activeTheme = localStorage.getItem(DEMO_THEME_STORAGE_KEY) || "midnight-cute";
    state.appViewEnabled = localStorage.getItem(DEMO_APP_VIEW_STORAGE_KEY) === "1";
    applyTheme(state.activeTheme);
    applyAppView(state.appViewEnabled);
    updateHeaderToolsLabels();
    renderTodo();
    renderMessages();
    bindEvents();
    scrollToBottom(false);
}

function bindEvents() {
    const msgInput = document.getElementById("msg");
    const messagesDiv = document.getElementById("messages");

    msgInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    });

    msgInput.addEventListener("input", autoResizeTextarea);
    messagesDiv.addEventListener("scroll", handleMessageScroll);

    document.addEventListener("click", (event) => {
        const tools = document.querySelector(".header-tools");
        if (state.headerToolsOpen && tools && !tools.contains(event.target)) {
            state.headerToolsOpen = false;
            document.getElementById("header-tools-menu").style.display = "none";
        }
    });
}

function autoResizeTextarea() {
    const input = document.getElementById("msg");
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
}

function renderMessages() {
    const messagesDiv = document.getElementById("messages");
    const loadMoreBtn = document.getElementById("load-more-btn");
    const loadAllBtn = document.getElementById("load-all-btn");
    messagesDiv.querySelectorAll(".message-bubble, .date-separator").forEach((node) => node.remove());

    const startIndex = Math.max(0, state.allMessages.length - state.visibleCount);
    const visibleMessages = state.allMessages.slice(startIndex);
    let lastDateLabel = "";

    visibleMessages.forEach((message) => {
        const dateLabel = getDateLabel(message.created_at);
        if (dateLabel !== lastDateLabel) {
            const separator = document.createElement("div");
            separator.className = "date-separator";
            separator.textContent = dateLabel;
            messagesDiv.appendChild(separator);
            lastDateLabel = dateLabel;
        }

        messagesDiv.appendChild(buildMessageBubble(message));
    });

    const remaining = Math.max(0, state.allMessages.length - state.visibleCount);
    loadMoreBtn.disabled = remaining === 0;
    loadMoreBtn.innerHTML = remaining === 0
        ? "All demo messages loaded"
        : `<span class="material-icons">expand_less</span> Load ${Math.min(8, remaining)} older demo messages`;
    loadAllBtn.disabled = state.visibleCount >= state.allMessages.length;
    loadAllBtn.innerHTML = state.visibleCount >= state.allMessages.length
        ? "Full demo chat loaded"
        : `<span class="material-icons">history</span> Load full demo chat`;

    updateFloatingDate();
}

function buildMessageBubble(message) {
    const bubble = document.createElement("div");
    const isSender = message.sender === state.currentUserEmail;
    const isSystem = message.message_type === "system";

    bubble.className = `message-bubble ${isSystem ? "system" : isSender ? "sender" : "receiver"}`;
    if (isSystem) bubble.classList.add("demo-system-preview");
    bubble.dataset.messageId = message.id;
    bubble.dataset.timestamp = message.created_at;

    if (!isSender && !isSystem) {
        const nameDiv = document.createElement("div");
        nameDiv.className = "message-name";
        nameDiv.textContent = USER_NAMES[message.sender] || message.sender;
        bubble.appendChild(nameDiv);
    }

    if (message.reply_to_id && !isSystem) {
        const replyBlock = document.createElement("div");
        replyBlock.className = "message-reply";
        replyBlock.onclick = () => scrollToMessage(message.reply_to_id);

        const strong = document.createElement("strong");
        strong.textContent = USER_NAMES[message.reply_to_sender] || message.reply_to_sender || "Unknown";
        const preview = document.createElement("p");
        preview.textContent = message.reply_to_text || "";

        replyBlock.appendChild(strong);
        replyBlock.appendChild(preview);
        bubble.appendChild(replyBlock);
    }

    if (isSystem) {
        const systemText = document.createElement("div");
        systemText.className = "system-message-text";
        systemText.textContent = message.text;
        bubble.appendChild(systemText);
    } else if (message.message_type === "image") {
        const container = document.createElement("div");
        container.className = "message-image-container";
        const image = document.createElement("img");
        image.className = "message-image";
        image.src = message.image_url;
        image.alt = message.text || "Image";
        image.onclick = () => openImageViewer(message.id, message.image_url);
        container.appendChild(image);
        bubble.appendChild(container);
    } else if (message.message_type === "video") {
        const container = document.createElement("div");
        container.className = "message-video-container";
        container.onclick = () => openVideoViewer(message.id, message.video_url);
        const video = document.createElement("video");
        video.className = "message-video";
        video.src = message.video_url;
        video.muted = true;
        video.playsInline = true;
        container.appendChild(video);
        bubble.appendChild(container);
    } else if (message.message_type === "voice") {
        const wrapper = document.createElement("div");
        wrapper.className = "voice-message";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = message.voice_url;
        const duration = document.createElement("span");
        duration.textContent = message.voice_duration || "0:00";
        wrapper.appendChild(audio);
        wrapper.appendChild(duration);
        bubble.appendChild(wrapper);
    } else {
        const textDiv = document.createElement("div");
        textDiv.className = `message-text ${isArabic(message.text || "") ? "rtl" : "ltr"}`;
        textDiv.textContent = message.text || "";
        bubble.appendChild(textDiv);
    }

    const metaDiv = document.createElement("div");
    metaDiv.className = "message-meta";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTime(message.created_at);
    metaDiv.appendChild(timeSpan);

    if (isSender && !isSystem) {
        const receipt = document.createElement("span");
        receipt.className = "receipt read";
        receipt.textContent = "✓✓";
        metaDiv.appendChild(receipt);
    }

    bubble.appendChild(metaDiv);

    if (!isSystem) {
        const replyBtn = document.createElement("button");
        replyBtn.className = "msg-reply-btn";
        replyBtn.innerHTML = '<span class="material-icons">reply</span>';
        replyBtn.onclick = (event) => {
            event.stopPropagation();
            setReply(message.id);
        };
        bubble.appendChild(replyBtn);
    }

    return bubble;
}

window.loadOlderMessages = function () {
    state.visibleCount = Math.min(state.allMessages.length, state.visibleCount + 8);
    renderMessages();
};

window.loadAllMessages = function () {
    state.visibleCount = state.allMessages.length;
    renderMessages();
};

window.reloadChat = function () {
    state.allMessages = createSeedMessages();
    state.visibleCount = INITIAL_VISIBLE_MESSAGES;
    clearSearchState();
    cancelReply();
    resetVoiceComposer();
    renderTodo();
    renderMessages();
    scrollToBottom(false);
};

window.send = function () {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (!text) return;

    state.allMessages.push(createMessage({
        sender: state.currentUserEmail,
        message_type: "text",
        text,
        reply_to_id: state.replyToMessage?.id || null,
        reply_to_sender: state.replyToMessage?.sender || null,
        reply_to_text: getReplyPreviewText(state.replyToMessage)
    }));

    input.value = "";
    autoResizeTextarea();
    state.visibleCount = state.allMessages.length;
    cancelReply();
    renderMessages();
    scrollToBottom(true);
};

window.setReply = function (messageId) {
    const message = state.allMessages.find((entry) => entry.id === messageId);
    if (!message) return;
    state.replyToMessage = message;
    document.getElementById("reply-name").textContent = USER_NAMES[message.sender] || message.sender;
    document.getElementById("reply-message").textContent = getReplyPreviewText(message);
    document.getElementById("reply-preview").style.display = "flex";
};

window.cancelReply = function () {
    state.replyToMessage = null;
    document.getElementById("reply-preview").style.display = "none";
};

function getReplyPreviewText(message) {
    if (!message) return "";
    if (message.message_type === "image") return "Photo";
    if (message.message_type === "video") return "Video";
    if (message.message_type === "voice") return "Voice message";
    return message.text || "";
}

window.scrollToBottom = function (smooth = false) {
    const messagesDiv = document.getElementById("messages");
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: smooth ? "smooth" : "auto"
    });
};

function scrollToMessage(messageId) {
    state.visibleCount = state.allMessages.length;
    renderMessages();

    const element = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!element) return;

    document.querySelectorAll(".message-bubble.highlight").forEach((node) => node.classList.remove("highlight"));
    element.classList.add("highlight");
    element.scrollIntoView({ behavior: "smooth", block: "center" });
}

window.toggleHeaderTools = function (event) {
    event.stopPropagation();
    state.headerToolsOpen = !state.headerToolsOpen;
    document.getElementById("header-tools-menu").style.display = state.headerToolsOpen ? "block" : "none";
};

window.toggleSearchFromMenu = function () {
    const searchBar = document.getElementById("search-bar");
    const open = searchBar.style.display === "none";
    searchBar.style.display = open ? "flex" : "none";
    if (open) {
        document.getElementById("search-input").focus();
    } else {
        closeSearch();
    }
    state.headerToolsOpen = false;
    document.getElementById("header-tools-menu").style.display = "none";
};

window.closeSearch = function () {
    document.getElementById("search-bar").style.display = "none";
    document.getElementById("search-input").value = "";
    clearSearchState();
};

window.searchMessages = function () {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    document.querySelectorAll(".message-bubble.highlight").forEach((node) => node.classList.remove("highlight"));

    if (!query) {
        clearSearchState();
        return;
    }

    state.visibleCount = state.allMessages.length;
    renderMessages();

    state.searchResults = state.allMessages
        .filter((message) => (message.text || "").toLowerCase().includes(query))
        .map((message) => message.id);
    state.currentSearchIndex = state.searchResults.length ? 0 : -1;

    if (state.currentSearchIndex >= 0) {
        scrollToMessage(state.searchResults[state.currentSearchIndex]);
    }
};

window.searchPrevious = function () {
    if (!state.searchResults.length) return;
    state.currentSearchIndex = (state.currentSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
    scrollToMessage(state.searchResults[state.currentSearchIndex]);
};

window.searchNext = function () {
    if (!state.searchResults.length) return;
    state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
    scrollToMessage(state.searchResults[state.currentSearchIndex]);
};

function clearSearchState() {
    state.searchResults = [];
    state.currentSearchIndex = -1;
    document.querySelectorAll(".message-bubble.highlight").forEach((node) => node.classList.remove("highlight"));
}

window.setThemeFromMenu = function (theme) {
    applyTheme(theme);
    localStorage.setItem(DEMO_THEME_STORAGE_KEY, theme);
};

function applyTheme(theme) {
    state.activeTheme = THEMES[theme] ? theme : "midnight-cute";
    document.body.setAttribute("data-theme", state.activeTheme);
    document.getElementById("theme-select").value = state.activeTheme;
    updateHeaderToolsLabels();
}

window.toggleAppViewFromMenu = function () {
    applyAppView(!state.appViewEnabled);
    localStorage.setItem(DEMO_APP_VIEW_STORAGE_KEY, state.appViewEnabled ? "1" : "0");
    state.headerToolsOpen = false;
    document.getElementById("header-tools-menu").style.display = "none";
};

function applyAppView(enabled) {
    state.appViewEnabled = enabled;
    document.body.classList.toggle("app-view-enabled", enabled);
    updateHeaderToolsLabels();
}

function updateHeaderToolsLabels() {
    const theme = THEMES[state.activeTheme] || THEMES["midnight-cute"];
    document.getElementById("theme-toggle-emoji").textContent = theme.emoji;
    document.getElementById("theme-toggle-label").textContent = theme.label;
    document.getElementById("app-view-label").textContent = state.appViewEnabled ? "Exit App View" : "App View";
    document.getElementById("app-view-icon").textContent = state.appViewEnabled ? "desktop_windows" : "smartphone";
    document.getElementById("header-streak-text").textContent = String(state.todoTemplate.streak);
}

window.openAttachmentMenu = function () {
    document.getElementById("attachment-menu").style.display = "flex";
};

window.closeAttachmentMenu = function () {
    document.getElementById("attachment-menu").style.display = "none";
};

window.openGallery = function () {
    closeAttachmentMenu();
    document.getElementById("image-input").click();
};

window.openCamera = function () {
    closeAttachmentMenu();
    document.getElementById("camera-input").click();
};

window.openVideoSelector = function () {
    closeAttachmentMenu();
    document.getElementById("video-input").click();
};

window.handleImageSelect = async function (event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    state.selectedImages = await Promise.all(files.map(readFileAsDataUrl));
    const previewContainer = document.getElementById("preview-images-container");
    previewContainer.innerHTML = "";

    state.selectedImages.forEach((src) => {
        const image = document.createElement("img");
        image.src = src;
        image.alt = "Preview";
        previewContainer.appendChild(image);
    });

    document.getElementById("image-preview-modal").style.display = "flex";
    event.target.value = "";
};

window.cancelImageSend = function () {
    state.selectedImages = [];
    document.getElementById("preview-images-container").innerHTML = "";
    document.getElementById("image-preview-modal").style.display = "none";
    document.getElementById("view-once-checkbox").checked = false;
};

window.confirmImageSend = function () {
    state.selectedImages.forEach((src) => {
        state.allMessages.push(createMessage({
            sender: state.currentUserEmail,
            message_type: "image",
            image_url: src,
            text: "Demo image"
        }));
    });

    state.visibleCount = state.allMessages.length;
    cancelImageSend();
    renderMessages();
    scrollToBottom(true);
};

window.handleVideoSelect = async function (event) {
    const file = event.target.files?.[0];
    if (!file) return;
    state.selectedVideo = await readFileAsDataUrl(file);
    document.getElementById("preview-video").src = state.selectedVideo;
    document.getElementById("video-preview-modal").style.display = "flex";
    event.target.value = "";
};

window.cancelVideoSend = function () {
    state.selectedVideo = null;
    const previewVideo = document.getElementById("preview-video");
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();
    document.getElementById("video-preview-modal").style.display = "none";
    document.getElementById("video-view-once-checkbox").checked = false;
};

window.confirmVideoSend = function () {
    if (!state.selectedVideo) return;
    state.allMessages.push(createMessage({
        sender: state.currentUserEmail,
        message_type: "video",
        video_url: state.selectedVideo,
        text: "Demo video"
    }));
    state.visibleCount = state.allMessages.length;
    cancelVideoSend();
    renderMessages();
    scrollToBottom(true);
};

window.openImageViewer = function (messageId, imagePath) {
    document.getElementById("viewer-image").src = imagePath;
    document.getElementById("viewer-info").textContent = `Demo image • ${messageId}`;
    document.getElementById("image-viewer-modal").style.display = "flex";
};

window.closeImageViewer = function () {
    document.getElementById("image-viewer-modal").style.display = "none";
    document.getElementById("viewer-image").removeAttribute("src");
};

window.closeImageViewerOnOutsideClick = function (event) {
    if (event.target.id === "image-viewer-modal") closeImageViewer();
};

window.openVideoViewer = function (_messageId, videoPath) {
    document.getElementById("viewer-video").src = videoPath;
    document.getElementById("video-viewer-modal").style.display = "flex";
};

window.closeVideoViewer = function () {
    const viewer = document.getElementById("viewer-video");
    viewer.pause();
    viewer.removeAttribute("src");
    viewer.load();
    document.getElementById("video-viewer-modal").style.display = "none";
};

window.closeVideoViewerOnOutsideClick = function (event) {
    if (event.target.id === "video-viewer-modal") closeVideoViewer();
};

window.toggleVoiceRecording = async function () {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        showAlert("Voice recording is not available in this browser for the demo page.");
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.voiceChunks = [];
        state.voiceRecordingStartTime = Date.now();
        state.voiceRecorder = new MediaRecorder(stream);
        state.voiceRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) state.voiceChunks.push(event.data);
        };
        state.voiceRecorder.onstop = () => {
            stream.getTracks().forEach((track) => track.stop());
            if (!state.voiceChunks.length) return;
            state.voiceBlob = new Blob(state.voiceChunks, { type: state.voiceRecorder.mimeType || "audio/webm" });
            if (state.voicePreviewUrl) URL.revokeObjectURL(state.voicePreviewUrl);
            state.voicePreviewUrl = URL.createObjectURL(state.voiceBlob);
            showVoicePreview();
        };

        state.voiceRecorder.start();
        document.getElementById("voice-recording").style.display = "flex";
        document.getElementById("voice-recording-indicator").style.display = "flex";
        document.getElementById("voice-preview-play").style.display = "none";
        document.getElementById("voice-preview-slider").style.display = "none";
        document.getElementById("voice-preview-times").style.display = "none";
        document.getElementById("voice-send-btn").style.display = "none";
        document.getElementById("voice-finish-btn").style.display = "inline-flex";
        updateRecordingTime();
        state.voiceRecordingInterval = window.setInterval(updateRecordingTime, 500);
    } catch (error) {
        showAlert(`Microphone access failed: ${error.message}`);
    }
};

window.finishVoiceRecording = function () {
    if (!state.voiceRecorder || state.voiceRecorder.state !== "recording") return;
    window.clearInterval(state.voiceRecordingInterval);
    state.voiceRecordingInterval = null;
    state.voiceRecorder.stop();
};

window.cancelVoiceRecording = function () {
    if (state.voiceRecorder && state.voiceRecorder.state === "recording") {
        window.clearInterval(state.voiceRecordingInterval);
        state.voiceRecordingInterval = null;
        state.voiceChunks = [];
        state.voiceRecorder.stop();
    }
    resetVoiceComposer();
};

window.sendVoiceRecording = function () {
    if (!state.voicePreviewUrl) return;
    state.allMessages.push(createMessage({
        sender: state.currentUserEmail,
        message_type: "voice",
        voice_url: state.voicePreviewUrl,
        voice_duration: formatDuration(Math.max(1, Math.round(state.voicePreviewDurationSeconds)))
    }));
    state.visibleCount = state.allMessages.length;
    resetVoiceComposer({ preservePreviewUrl: true });
    renderMessages();
    scrollToBottom(true);
};

window.toggleVoicePreviewPlayback = function () {
    if (!state.voicePreviewAudio) return;
    const icon = document.querySelector("#voice-preview-play .material-icons");
    if (state.voicePreviewAudio.paused) {
        state.voicePreviewAudio.play();
        icon.textContent = "pause";
    } else {
        state.voicePreviewAudio.pause();
        icon.textContent = "play_arrow";
    }
};

window.seekVoicePreview = function (event) {
    if (!state.voicePreviewAudio) return;
    state.voicePreviewAudio.currentTime = Number(event.target.value);
};

function showVoicePreview() {
    document.getElementById("voice-recording-indicator").style.display = "none";
    document.getElementById("voice-preview-play").style.display = "inline-flex";
    document.getElementById("voice-preview-slider").style.display = "block";
    document.getElementById("voice-preview-times").style.display = "flex";
    document.getElementById("voice-send-btn").style.display = "inline-flex";
    document.getElementById("voice-finish-btn").style.display = "none";

    state.voicePreviewAudio = new Audio(state.voicePreviewUrl);
    state.voicePreviewAudio.addEventListener("loadedmetadata", () => {
        state.voicePreviewDurationSeconds = state.voicePreviewAudio.duration || 0;
        document.getElementById("voice-preview-slider").max = String(state.voicePreviewDurationSeconds || 0);
        document.getElementById("voice-preview-total").textContent = formatDuration(Math.round(state.voicePreviewDurationSeconds || 0));
    });
    state.voicePreviewAudio.addEventListener("timeupdate", () => {
        document.getElementById("voice-preview-slider").value = String(state.voicePreviewAudio.currentTime || 0);
        document.getElementById("voice-preview-current").textContent = formatDuration(Math.round(state.voicePreviewAudio.currentTime || 0));
    });
    state.voicePreviewAudio.addEventListener("ended", () => {
        document.querySelector("#voice-preview-play .material-icons").textContent = "play_arrow";
    });
}

function resetVoiceComposer(options = {}) {
    if (state.voicePreviewAudio) {
        state.voicePreviewAudio.pause();
        state.voicePreviewAudio = null;
    }
    if (state.voicePreviewUrl && !options.preservePreviewUrl) {
        URL.revokeObjectURL(state.voicePreviewUrl);
        state.voicePreviewUrl = "";
    }
    state.voiceBlob = null;
    state.voiceChunks = [];
    state.voiceRecorder = null;
    state.voicePreviewDurationSeconds = 0;
    document.getElementById("voice-recording").style.display = "none";
    document.getElementById("recording-time").textContent = "0:00";
    document.getElementById("voice-preview-slider").value = "0";
    document.getElementById("voice-preview-slider").max = "0";
    document.getElementById("voice-preview-current").textContent = "0:00";
    document.getElementById("voice-preview-total").textContent = "0:00";
    document.querySelector("#voice-preview-play .material-icons").textContent = "play_arrow";
}

function updateRecordingTime() {
    const seconds = Math.max(0, Math.floor((Date.now() - state.voiceRecordingStartTime) / 1000));
    document.getElementById("recording-time").textContent = formatDuration(seconds);
}

window.openTodoModal = function () {
    renderTodo();
    document.getElementById("todo-modal").style.display = "flex";
};

window.closeTodoModal = function () {
    document.getElementById("todo-modal").style.display = "none";
};

window.closeTodoModalOnOutsideClick = function (event) {
    if (event.target.id === "todo-modal") closeTodoModal();
};

function renderTodo() {
    const nav = document.getElementById("todo-category-nav");
    const list = document.getElementById("todo-list");
    nav.innerHTML = "";
    list.innerHTML = "";

    TODO_CATEGORY_ORDER.forEach((category) => {
        const button = document.createElement("button");
        button.className = `todo-category-chip ${state.activeTodoCategory === category ? "active" : ""}`;
        button.textContent = TODO_CATEGORY_CONFIG[category].label;
        button.onclick = () => {
            state.activeTodoCategory = category;
            renderTodo();
        };
        nav.appendChild(button);
    });

    state.todoTemplate.items
        .filter((item) => item.category === state.activeTodoCategory)
        .forEach((item) => {
            const card = document.createElement("label");
            card.className = `todo-item-card ${item.done ? "done" : ""}`;
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.done;
            checkbox.onchange = () => {
                item.done = checkbox.checked;
                renderTodo();
            };
            const textWrap = document.createElement("div");
            textWrap.className = "todo-item-copy";
            const title = document.createElement("strong");
            title.textContent = `${item.emoji} ${item.text}`;
            const meta = document.createElement("span");
            meta.textContent = `${item.points} points`;
            textWrap.appendChild(title);
            textWrap.appendChild(meta);
            card.appendChild(checkbox);
            card.appendChild(textWrap);
            list.appendChild(card);
        });

    const completed = state.todoTemplate.items.filter((item) => item.done).length;
    const total = state.todoTemplate.items.length;
    const score = state.todoTemplate.items.filter((item) => item.done).reduce((sum, item) => sum + item.points, 0);

    document.getElementById("todo-progress-text").textContent = `${completed} / ${total} done`;
    document.getElementById("todo-score-text").textContent = `💕 ${score} points`;
    document.getElementById("header-streak-text").textContent = String(state.todoTemplate.streak);
}

function handleMessageScroll() {
    const messagesDiv = document.getElementById("messages");
    const jumpButton = document.getElementById("jump-bottom-btn");
    const distanceFromBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop - messagesDiv.clientHeight;
    jumpButton.style.display = distanceFromBottom > 140 ? "flex" : "none";
    updateFloatingDate();
}

function updateFloatingDate() {
    const messages = Array.from(document.querySelectorAll(".message-bubble"));
    const messagesDiv = document.getElementById("messages");
    const floatingDate = document.querySelector("#floating-date .floating-date-label");
    const containerRect = messagesDiv.getBoundingClientRect();

    const current = messages.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.bottom > containerRect.top + 60;
    });

    if (current) {
        floatingDate.textContent = getDateLabel(current.dataset.timestamp);
    }
}

function getDateLabel(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined
    });
}

function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });
}

function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function isArabic(text) {
    return /[\u0600-\u06FF]/.test(text);
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showAlert(message) {
    window.alert(message);
}

document.addEventListener("DOMContentLoaded", initializeDemo);
