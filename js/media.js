// Attachment menu, image handling, video handling, voice recording
// Split out of the original single app.js — see AGENTS.md for the module map.

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
        sendWebPushToRecipient(
            "My Love 💕",
            `checked off "${templateItem?.text || "a task"}" ✅`
        );
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

    updateConnectionStatus("uploading-photo");

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

            notifyPartner(viewOnce ? "🔒 View-once photo" : "📷 Sent a photo");
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
                    if (c) renderExpiredMediaState(c, "📷", "Viewed once 💕", "Just for your eyes 💕");
                }
            }, 100);

            if (state.channel) {
                state.channel.send({ type: "broadcast", event: "image-viewed", payload: { messageId, viewerId: state.currentUserEmail } });
            }

            notifyPartner("opened your view-once photo 👀");
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
    updateConnectionStatus("uploading-video");

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

        notifyPartner(viewOnce ? "🔒 View-once video" : "🎥 Sent a video");

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
                    if (c) renderExpiredMediaState(c, "🎥", "Viewed once 💕", "Just for your eyes 💕");
                }
            }, 100);

            if (state.channel) {
                state.channel.send({ type: "broadcast", event: "video-viewed", payload: { messageId, viewerId: state.currentUserEmail } });
            }

            notifyPartner("opened your view-once video 👀");
            return;
        }

        notifyPartner("opened a video 🎬");
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
        notifyPartner("started recording a voice message 🎙️");

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

    updateConnectionStatus("sending-voice");

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

        notifyPartner(`🎤 Voice message (${durationLabel})`);

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

