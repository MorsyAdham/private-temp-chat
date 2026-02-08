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
  selectedImageFile: null,
  selectedImageDataUrl: null,
  searchResults: [],
  currentSearchIndex: -1,
  allMessages: [], // Store all loaded messages for search
  renderedDates: new Set(),
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeApp() {
  state.supabaseClient = window.supabase.createClient(
    CONFIG.supabase.url,
    CONFIG.supabase.key
  );
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

window.login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Please enter both email and password");
    return;
  }

  try {
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!ALLOWED_EMAILS.includes(data.user.email)) {
      await state.supabaseClient.auth.signOut();
      showAlert("Access denied. You are not authorized to use this chat.");
      return;
    }

    state.currentUserEmail = data.user.email;

    await requestNotificationPermission();
    showChatScreen();
    await updatePresence(true);

    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      await sendTelegramNotification("My Love just logged in! 💕");
    }

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
// CHAT INITIALIZATION
// ============================================================================

function getDateLabel(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

async function loadAllMessagesFromDB() {
  const PAGE_SIZE = 1000;
  let allMessages = [];
  let from = 0;
  let to = PAGE_SIZE - 1;

  while (true) {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) throw error;

    if (!data || data.length === 0) break;

    allMessages = allMessages.concat(data);

    // Stop if less than page size → no more data
    if (data.length < PAGE_SIZE) break;

    from += PAGE_SIZE;
    to += PAGE_SIZE;
  }

  return allMessages;
}

async function initializeChat() {
  updateConnectionStatus("🔄 Loading messages...");

  try {
    await loadInitialMessages();
    await setupRealtimeSubscription();
    setupReadReceiptListener();
    setupScrollHandler();
    updateConnectionStatus("🟢 Connected");

  } catch (error) {
    console.error("Chat initialization error:", error);
    updateConnectionStatus("🔴 Connection failed");
    showAlert("Failed to connect to chat. Please refresh the page.");
  }
}

// ✅ FIX #1: Properly order messages by timestamp
async function loadInitialMessages() {
  try {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(CONFIG.pagination.initialLoad);

    if (error) throw error;

    if (!data || data.length === 0) return;

    // Reverse to chronological order
    const messages = sortMessagesByTime(data);

    state.oldestMessageTimestamp = messages[0].created_at;
    state.allMessages = messages.slice();

    messages.forEach(msg => renderMessage(msg));

    scrollToBottom(false);
    await markVisibleMessagesAsRead();

  } catch (error) {
    console.error("Initial load failed:", error);
    throw error;
  }
}

// ✅ FIX #2: Reload chat function
window.reloadChat = async function () {
  updateConnectionStatus("🔄 Reloading...");

  try {
    // Unsubscribe from current channel
    if (state.channel) {
      await state.channel.unsubscribe();
      state.channel = null;
    }

    // Clear current messages
    const messagesDiv = document.getElementById("messages");
    const loadButton = document.getElementById("load-more-btn");
    messagesDiv.innerHTML = "";
    messagesDiv.appendChild(loadButton);

    // Reset state
    state.oldestMessageTimestamp = null;
    state.hasMoreMessages = true;
    state.unreadMessages.clear();
    state.allMessages = [];

    // Reload everything
    await loadInitialMessages();
    await setupRealtimeSubscription();

    updateConnectionStatus("🟢 Connected");
    showAlert("Chat reloaded successfully!");

  } catch (error) {
    console.error("Reload error:", error);
    updateConnectionStatus("🔴 Reload failed");
    showAlert("Failed to reload chat. Please try again.");
  }
};

window.loadOlderMessages = async function () {
  if (state.isLoadingOlderMessages || !state.hasMoreMessages) return;

  state.isLoadingOlderMessages = true;
  const loadButton = document.getElementById("load-more-btn");
  loadButton.textContent = "Loading...";

  try {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .select("*")
      .lt("created_at", state.oldestMessageTimestamp)
      .order("created_at", { ascending: false })
      .limit(CONFIG.pagination.pageSize);

    if (error) throw error;

    if (!data || data.length === 0) {
      state.hasMoreMessages = false;
      updateLoadMoreButton();
      return;
    }

    const messagesDiv = document.getElementById("messages");
    const oldScrollHeight = messagesDiv.scrollHeight;

    // Normalize order (old → new)
    const newMessages = sortMessagesByTime(data);

    // Filter out duplicates (CRITICAL)
    const trulyNewMessages = newMessages.filter(
      msg => !state.allMessages.some(m => m.id === msg.id)
    );

    if (trulyNewMessages.length === 0) {
      updateLoadMoreButton();
      return;
    }

    // Update cursor BEFORE render
    state.oldestMessageTimestamp = trulyNewMessages[0].created_at;

    // Merge ONCE and sort ONCE
    state.allMessages = sortMessagesByTime([
      ...trulyNewMessages,
      ...state.allMessages
    ]);

    // Render ONLY new messages (prepend)
    // Remove ALL message bubbles (not the button)
    const loadButton = document.getElementById("load-more-btn");

    messagesDiv.querySelectorAll(".message-bubble").forEach(b => b.remove());

    // Re-render EVERYTHING from state (guaranteed order)
    state.allMessages.forEach(msg => renderMessage(msg, false));

    // Restore scroll position
    messagesDiv.scrollTop =
      messagesDiv.scrollHeight - oldScrollHeight;


    // Maintain scroll position
    messagesDiv.scrollTop =
      messagesDiv.scrollHeight - oldScrollHeight;

    state.hasMoreMessages = data.length === CONFIG.pagination.pageSize;
    updateLoadMoreButton();

  } catch (error) {
    console.error("Load older messages failed:", error);
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
  loadAllBtn.textContent = "Loading all...";
  loadAllBtn.disabled = true;

  try {
    updateConnectionStatus("🔄 Loading all messages...");

    // 1️⃣ Fetch everything
    const allMessages = await loadAllMessagesFromDB();

    if (!allMessages || allMessages.length === 0) return;

    // 2️⃣ Sort once
    const sortedMessages = sortMessagesByTime(allMessages);

    // 3️⃣ Reset state
    state.allMessages = sortedMessages;
    state.oldestMessageTimestamp = sortedMessages[0].created_at;
    state.hasMoreMessages = false;

    // 4️⃣ Clear UI (keep buttons)
    const messagesDiv = document.getElementById("messages");
    messagesDiv
      .querySelectorAll(".message-bubble")
      .forEach(b => b.remove());

    // 5️⃣ Render everything
    sortedMessages.forEach(msg => renderMessage(msg, false));

    scrollToBottom(false);

    // 6️⃣ Disable pagination buttons
    loadMoreBtn.textContent = "All messages loaded";
    loadMoreBtn.disabled = true;
    loadAllBtn.textContent = "All messages loaded";

    updateConnectionStatus("🟢 All messages loaded");

  } catch (error) {
    console.error("Load all messages failed:", error);
    showAlert("Failed to load all messages");
    loadAllBtn.textContent = "Load all messages";
    loadAllBtn.disabled = false;
  } finally {
    state.isLoadingOlderMessages = false;
  }
};

function updateLoadMoreButton() {
  const loadButton = document.getElementById("load-more-btn");
  const loadAllBtn = document.getElementById("load-all-btn");
  if (!loadButton) return;

  if (state.hasMoreMessages) {
    loadButton.textContent = "Load older messages";
    loadButton.disabled = false;
    if (loadAllBtn) loadAllBtn.disabled = false;
  } else {
    loadButton.textContent = "No more messages";
    loadButton.disabled = true;
    if (loadAllBtn) loadAllBtn.disabled = true;
  }
}


function setupScrollHandler() {
  const messagesDiv = document.getElementById("messages");
  const jumpBtn = document.getElementById("jump-bottom-btn");

  messagesDiv.addEventListener("scroll", () => {
    const atBottom =
      messagesDiv.scrollHeight - messagesDiv.scrollTop <=
      messagesDiv.clientHeight + 50;

    state.isAtBottom = atBottom;

    if (jumpBtn) {
      jumpBtn.style.display = atBottom ? "none" : "flex";
    }

    if (atBottom) {
      markVisibleMessagesAsRead();
    }
  });

  const loadBtn = document.getElementById("load-more-btn");

  messagesDiv.addEventListener("scroll", () => {
    const atTop = messagesDiv.scrollTop <= 30;
    const atBottom =
      messagesDiv.scrollHeight - messagesDiv.scrollTop <=
      messagesDiv.clientHeight + 50;

    state.isAtBottom = atBottom;

    // Jump button
    jumpBtn.style.display = atBottom ? "none" : "flex";

    // Load more button
    loadBtn.style.display =
      atTop && state.hasMoreMessages ? "block" : "none";

    if (atBottom) {
      markVisibleMessagesAsRead();
    }
    updateFloatingDate();

  });
}

// ============================================================================
// REALTIME SUBSCRIPTION  
// ============================================================================

async function setupRealtimeSubscription() {
  state.channel = state.supabaseClient.channel("private-room", {
    config: { broadcast: { self: false } }
  });

  state.channel.on("broadcast", { event: "new-message" }, async (payload) => {
    const message = payload.payload;
    if (!message || !message.id) return;

    // Check if we need a date separator
    const lastMsg = state.allMessages[state.allMessages.length - 1];
    if (lastMsg) {
      const lastDate = new Date(lastMsg.created_at).toDateString();
      const newDate = new Date(message.created_at).toDateString();
    }

    // Ignore duplicates
    if (state.allMessages.some(m => m.id === message.id)) return;

    // Insert → sort
    state.allMessages.push(message);
    sortMessagesByTime(state.allMessages);

    // Render only if it belongs at the end
    const lastRendered =
      document.querySelector(".message-bubble:last-of-type");

    const lastTimestamp = lastRendered
      ? new Date(lastRendered.dataset.timestamp)
      : null;

    if (!lastTimestamp || new Date(message.created_at) >= lastTimestamp) {
      renderMessage(message, false);

      if (state.isAtBottom) {
        scrollToBottom(true);
      }
    }

    if (state.isAtBottom) {
      scrollToBottom(true);
    }

    if (message.sender !== state.currentUserEmail) {
      if (state.isAtBottom) {
        await markMessageAsRead(message.id);
      }

      showNotification(USER_NAMES[message.sender] || message.sender, message.text || "Sent a photo");

      if (message.sender === "ayaessam487@gmail.com") {
        const messageContent = message.message_type === 'image' ? 'a photo' : message.text;
        await sendTelegramNotification(`My Love sent ${messageContent}`);
      }
    }
  });

  state.channel.on("broadcast", { event: "image-viewed" }, async (payload) => {
    const { messageId } = payload.payload;

    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      const imageContainer = messageElement.querySelector('.message-image-container');
      if (imageContainer) {
        imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Opened</div>';
      }
    }
  });

  state.channel.on("postgres_changes", {
    event: "INSERT",
    schema: "public",
    table: "chat_messages"
  }, async (payload) => {
    const message = payload.new;
    if (message.sender === state.currentUserEmail) return;

    const lastMsg = state.allMessages[state.allMessages.length - 1];
    if (lastMsg) {
      const lastDate = new Date(lastMsg.created_at).toDateString();
      const newDate = new Date(message.created_at).toDateString();
    }

    // Ignore duplicates
    if (state.allMessages.some(m => m.id === message.id)) return;

    // Insert → sort
    state.allMessages.push(message);
    sortMessagesByTime(state.allMessages);

    // Render only if it belongs at the end
    const lastRendered =
      document.querySelector(".message-bubble:last-of-type");

    const lastTimestamp = lastRendered
      ? new Date(lastRendered.dataset.timestamp)
      : null;

    if (!lastTimestamp || new Date(message.created_at) >= lastTimestamp) {
      renderMessage(message, false);

      if (state.isAtBottom) {
        scrollToBottom(true);
      }
    }

    if (state.isAtBottom) {
      scrollToBottom(true);
      await markMessageAsRead(message.id);
    }

    showNotification(USER_NAMES[message.sender] || message.sender, message.text || "Sent a photo");

    if (message.sender === "ayaessam487@gmail.com") {
      const messageContent = message.message_type === 'image' ? 'a photo' : message.text;
      await sendTelegramNotification(`My Love sent ${messageContent}`);
    }
  });

  await state.channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      updateConnectionStatus("🟢 Connected");
    } else if (status === "CLOSED") {
      updateConnectionStatus("🔴 Disconnected");
    } else if (status === "CHANNEL_ERROR") {
      updateConnectionStatus("🔴 Connection error");
    }
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
    }, (payload) => {
      if (payload.new.read) {
        updateMessageReadReceipt(payload.new.id, true);
      }
    })
    .subscribe();
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

window.toggleSearch = function () {
  const searchBar = document.getElementById("search-bar");
  const searchInput = document.getElementById("search-input");

  if (searchBar.style.display === "none") {
    searchBar.style.display = "flex";
    searchInput.focus();
  } else {
    closeSearch();
  }
};

window.closeSearch = function () {
  const searchBar = document.getElementById("search-bar");
  const searchInput = document.getElementById("search-input");

  searchBar.style.display = "none";
  searchInput.value = "";

  // Remove all highlights
  document.querySelectorAll(".message-bubble.highlight").forEach(el => {
    el.classList.remove("highlight");
  });

  state.searchResults = [];
  state.currentSearchIndex = -1;
};

window.searchMessages = function () {
  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim().toLowerCase();

  // Remove previous highlights
  document.querySelectorAll(".message-bubble.highlight").forEach(el => {
    el.classList.remove("highlight");
  });

  if (!query) {
    state.searchResults = [];
    state.currentSearchIndex = -1;
    return;
  }

  // Search in all messages
  state.searchResults = state.allMessages.filter(msg => {
    if (msg.message_type === 'image') return false;
    return msg.text && msg.text.toLowerCase().includes(query);
  });

  if (state.searchResults.length > 0) {
    state.currentSearchIndex = 0;
    highlightAndScrollToResult(state.searchResults[0].id);
  }
};

function highlightAndScrollToResult(messageId) {
  // Remove previous highlight
  document
    .querySelectorAll(".message-bubble.highlight")
    .forEach(el => el.classList.remove("highlight"));

  const messageElement =
    document.querySelector(`[data-message-id="${messageId}"]`);

  if (messageElement) {
    messageElement.classList.add("highlight");

    messageElement.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

window.searchNext = function () {
  if (!state.searchResults.length) return;

  state.currentSearchIndex =
    (state.currentSearchIndex + 1) % state.searchResults.length;

  const message = state.searchResults[state.currentSearchIndex];
  highlightAndScrollToResult(message.id);
};

window.searchPrevious = function () {
  if (!state.searchResults.length) return;

  state.currentSearchIndex =
    (state.currentSearchIndex - 1 + state.searchResults.length) %
    state.searchResults.length;

  const message = state.searchResults[state.currentSearchIndex];
  highlightAndScrollToResult(message.id);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sortMessagesByTime(messages) {
  return messages.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
}

function isArabic(text) {
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  return totalChars > 0 && (arabicChars / totalChars) > 0.3;
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// ============================================================================
// SEND MESSAGE
// ============================================================================

window.send = async function () {
  const textarea = document.getElementById("msg");
  const text = textarea.value.trim();

  if (!text || !state.channel) {
    return;
  }

  try {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .insert([{
        sender: state.currentUserEmail,
        text: text,
        read: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Check if we need date separator
    const lastMsg = state.allMessages[state.allMessages.length - 1];
    if (lastMsg) {
      const lastDate = new Date(lastMsg.created_at).toDateString();
      const newDate = new Date(data.created_at).toDateString();
    }

    if (!state.allMessages.some(m => m.id === data.id)) {
      state.allMessages.push(data);
      sortMessagesByTime(state.allMessages);
      renderMessage(data, false);
    }

    scrollToBottom(true);

    await state.channel.send({
      type: "broadcast",
      event: "new-message",
      payload: data
    });

    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      await sendTelegramNotification(`My Love sent: ${text}`);
    }

    textarea.value = "";
    textarea.style.height = '40px';
    textarea.style.direction = 'ltr';
    textarea.style.textAlign = 'left';

  } catch (error) {
    console.error("Error sending message:", error);
    showAlert("Failed to send message. Please try again.");
  }
};

// ============================================================================
// MESSAGE RENDERING
// ============================================================================

function renderMessage(message, prepend = false) {
  const messagesDiv = document.getElementById("messages");
  const isSender = message.sender === state.currentUserEmail;
  const messageType = message.message_type || 'text';

  const existingMessage = document.querySelector(`[data-message-id="${message.id}"]`);
  if (existingMessage) {
    return;
  }

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isSender ? "sender" : "receiver"}`;
  if (messageType === 'image') {
    bubble.classList.add('image-message');
  }
  bubble.dataset.messageId = message.id;
  bubble.dataset.timestamp = message.created_at; // Store timestamp for date comparison

  if (!isSender) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "sender-name";
    nameDiv.textContent = USER_NAMES[message.sender] || "Unknown";
    bubble.appendChild(nameDiv);
  }

  if (messageType === 'image') {
    const imageContainer = document.createElement("div");
    imageContainer.className = "message-image-container";

    const viewOnce = message.view_once || false;
    const viewedBy = message.viewed_by || [];
    const hasViewed = viewedBy.includes(state.currentUserEmail);
    const wasOpened = viewedBy.length > 0;

    if (viewOnce && (hasViewed || (isSender && wasOpened))) {
      const statusText = isSender ? '📷 Opened' : '📷 Photo viewed';
      imageContainer.innerHTML = `<div class="image-viewed-overlay">${statusText}</div>`;
      imageContainer.style.width = '200px';
      imageContainer.style.height = '200px';
      imageContainer.style.background = '#1e293b';
    } else if (viewOnce && isSender && !wasOpened) {
      imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Sent</div>';
      imageContainer.style.width = '200px';
      imageContainer.style.height = '200px';
      imageContainer.style.background = '#1e293b';
    } else if (viewOnce && !isSender && !hasViewed) {
      const img = document.createElement("img");
      img.className = "message-image";
      img.alt = "Sent image";
      img.loading = "lazy";

      (async () => {
        try {
          let imagePath = message.image_url;
          if (imagePath.includes('http')) {
            const urlParts = imagePath.split('/chat-images/');
            imagePath = urlParts[1] || imagePath;
          }

          const { data: signedUrlData, error: signedUrlError } = await state.supabaseClient.storage
            .from('chat-images')
            .createSignedUrl(imagePath, 3600);

          if (signedUrlError) throw signedUrlError;

          img.src = signedUrlData.signedUrl;
        } catch (error) {
          console.error('Error generating signed URL:', error);
          img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
        }
      })();

      img.onclick = () => openImageViewer(message.id, message.image_url, viewOnce, viewedBy, message.sender);
      img.style.cursor = 'pointer';

      imageContainer.appendChild(img);

      const overlay = document.createElement("div");
      overlay.className = "view-once-overlay";
      overlay.innerHTML = '🔒 View once';
      imageContainer.appendChild(overlay);
    } else if (!viewOnce) {
      const img = document.createElement("img");
      img.className = "message-image";
      img.alt = "Sent image";
      img.loading = "lazy";

      (async () => {
        try {
          let imagePath = message.image_url;
          if (imagePath.includes('http')) {
            const urlParts = imagePath.split('/chat-images/');
            imagePath = urlParts[1] || imagePath;
          }

          const { data: signedUrlData, error: signedUrlError } = await state.supabaseClient.storage
            .from('chat-images')
            .createSignedUrl(imagePath, 3600);

          if (signedUrlError) throw signedUrlError;

          img.src = signedUrlData.signedUrl;
        } catch (error) {
          console.error('Error generating signed URL:', error);
          img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
        }
      })();

      img.onclick = () => openImageViewer(message.id, message.image_url, viewOnce, viewedBy, message.sender);
      img.style.cursor = 'pointer';

      imageContainer.appendChild(img);
    }

    bubble.appendChild(imageContainer);

  } else {
    const textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textDiv.textContent = message.text;

    if (isArabic(message.text)) {
      textDiv.classList.add('rtl');
    } else {
      textDiv.classList.add('ltr');
    }

    bubble.appendChild(textDiv);
  }

  const metaDiv = document.createElement("div");
  metaDiv.className = "message-meta";
  metaDiv.textContent = formatTime(message.created_at);

  if (isSender) {
    const receipt = document.createElement("span");
    receipt.className = `receipt ${message.read ? "read" : "sent"}`;
    receipt.textContent = message.read ? " ✓✓" : " ✓";
    metaDiv.appendChild(receipt);
  }

  bubble.appendChild(metaDiv);

  if (prepend) {
    const firstMessage = messagesDiv.querySelector(".message-bubble");
    if (firstMessage) {
      messagesDiv.insertBefore(bubble, firstMessage);
    } else {
      messagesDiv.appendChild(bubble);
    }
  } else {
    messagesDiv.appendChild(bubble);
  }

  if (!isSender && !message.read) {
    state.unreadMessages.add(message.id);
  }
}

function updateMessageReadReceipt(messageId, isRead) {
  const bubble = document.querySelector(`[data-message-id="${messageId}"]`);
  if (!bubble) return;

  const receipt = bubble.querySelector(".receipt");
  if (receipt) {
    receipt.textContent = isRead ? " ✓✓" : " ✓";
    receipt.className = `receipt ${isRead ? "read" : "sent"}`;
  }
}

// ============================================================================
// READ RECEIPTS
// ============================================================================

async function markMessageAsRead(messageId) {
  try {
    await state.supabaseClient
      .from("chat_messages")
      .update({ read: true })
      .eq("id", messageId);

    state.unreadMessages.delete(messageId);
  } catch (error) {
    console.error("Error marking message as read:", error);
  }
}

async function markVisibleMessagesAsRead() {
  if (state.unreadMessages.size === 0) return;

  try {
    const unreadIds = Array.from(state.unreadMessages);

    await state.supabaseClient
      .from("chat_messages")
      .update({ read: true })
      .in("id", unreadIds)
      .neq("sender", state.currentUserEmail);

    state.unreadMessages.clear();
  } catch (error) {
    console.error("Error marking messages as read:", error);
  }
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
    });
  }
}

async function sendTelegramNotification(message) {
  try {
    await fetch(
      `https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CONFIG.telegram.chatId,
          text: message
        })
      }
    );
  } catch (error) {
    console.error("Telegram notification failed:", error);
  }
}

// ============================================================================
// UI HELPERS
// ============================================================================
function updateFloatingDate() {
  const messagesDiv = document.getElementById("messages");
  const floatingDate = document.getElementById("floating-date");

  const bubbles = messagesDiv.querySelectorAll(".message-bubble");
  if (!bubbles.length) return;

  for (let bubble of bubbles) {
    const rect = bubble.getBoundingClientRect();
    const containerRect = messagesDiv.getBoundingClientRect();

    // First visible message
    if (rect.bottom > containerRect.top + 40) {
      const timestamp = bubble.dataset.timestamp;
      floatingDate.textContent = getDateLabel(timestamp);
      break;
    }
  }
}

function showChatScreen() {
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";
}

function updateConnectionStatus(text) {
  const statusDiv = document.getElementById("connection-status");
  if (statusDiv) statusDiv.textContent = text;
}

function showAlert(message) {
  alert(message);
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function scrollToBottom(smooth = false) {
  const messagesDiv = document.getElementById("messages");
  if (smooth) {
    messagesDiv.scrollTo({
      top: messagesDiv.scrollHeight,
      behavior: "smooth"
    });
  } else {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  state.isAtBottom = true;
}

function clearMessagesUI() {
  const messagesDiv = document.getElementById("messages");
  const loadButton = document.getElementById("load-more-btn");

  const messageBubbles = messagesDiv.querySelectorAll(".message-bubble");
  const dateSeparators = messagesDiv.querySelectorAll(".date-separator");

  messageBubbles.forEach(bubble => bubble.remove());
  dateSeparators.forEach(sep => sep.remove());

  if (loadButton) {
    loadButton.style.display = "none";
  }

  state.hasMoreMessages = false;
}

// ============================================================================
// PANIC BUTTON
// ============================================================================

window.panic = function () {
  const confirmed = confirm(
    "⚠️ This will hide all messages from your screen.\n\n" +
    "Messages will still exist in the database.\n\n" +
    "Continue?"
  );

  if (confirmed) {
    clearMessagesUI();
    showAlert("Messages hidden. Refresh the page to reload them.");
  }
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();

  const msgTextarea = document.getElementById("msg");

  if (msgTextarea) {
    msgTextarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    msgTextarea.addEventListener("input", (e) => {
      const textarea = e.target;
      autoResizeTextarea(textarea);

      const text = textarea.value;
      if (text.trim().length > 0) {
        if (isArabic(text)) {
          textarea.style.direction = 'rtl';
          textarea.style.textAlign = 'right';
        } else {
          textarea.style.direction = 'ltr';
          textarea.style.textAlign = 'left';
        }
      } else {
        textarea.style.direction = 'ltr';
        textarea.style.textAlign = 'left';
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const imageViewer = document.getElementById("image-viewer-modal");
      if (imageViewer && imageViewer.style.display === "flex") {
        closeImageViewer();
      }

      const imagePreview = document.getElementById("image-preview-modal");
      if (imagePreview && imagePreview.style.display === "flex") {
        cancelImageSend();
      }

      const imagePicker = document.getElementById("image-picker-modal");
      if (imagePicker && imagePicker.style.display === "flex") {
        closeImagePicker();
      }

      const searchBar = document.getElementById("search-bar");
      if (searchBar && searchBar.style.display === "flex") {
        closeSearch();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    const searchBar = document.getElementById("search-bar");
    if (!searchBar || searchBar.style.display !== "flex") return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      searchNext();
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      searchPrevious();
    }
  });
});

window.addEventListener("beforeunload", async () => {
  if (state.currentUserEmail) {
    await updatePresence(false);
  }

  if (state.channel) {
    state.channel.unsubscribe();
  }
});

// ============================================================================
// IMAGE FUNCTIONALITY
// ============================================================================

window.openImagePicker = function () {
  document.getElementById("image-picker-modal").style.display = "flex";
};

window.closeImagePicker = function () {
  document.getElementById("image-picker-modal").style.display = "none";
};

window.openCamera = function () {
  closeImagePicker();
  document.getElementById("camera-input").click();
};

window.openGallery = function () {
  closeImagePicker();
  document.getElementById("image-input").click();
};

window.handleImageSelect = function (event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showAlert('Please select an image file');
    return;
  }

  state.selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    state.selectedImageDataUrl = e.target.result;
    document.getElementById('preview-image').src = e.target.result;
    document.getElementById('image-preview-modal').style.display = 'flex';
  };
  reader.readAsDataURL(file);

  event.target.value = '';
};

window.cancelImageSend = function () {
  state.selectedImageFile = null;
  state.selectedImageDataUrl = null;
  document.getElementById('image-preview-modal').style.display = 'none';
  document.getElementById('view-once-checkbox').checked = false;
};

window.confirmImageSend = async function () {
  if (!state.selectedImageFile) return;

  const viewOnce = document.getElementById('view-once-checkbox').checked;

  document.getElementById('image-preview-modal').style.display = 'none';
  updateConnectionStatus('📤 Uploading image...');

  try {
    const fileExt = state.selectedImageFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${state.currentUserEmail}/${fileName}`;

    const { data: uploadData, error: uploadError } = await state.supabaseClient.storage
      .from('chat-images')
      .upload(filePath, state.selectedImageFile);

    if (uploadError) throw uploadError;

    const imageUrl = filePath;

    const { data: messageData, error: messageError } = await state.supabaseClient
      .from('chat_messages')
      .insert([{
        sender: state.currentUserEmail,
        text: null,
        message_type: 'image',
        image_url: imageUrl,
        view_once: viewOnce,
        viewed_by: [],
        read: false
      }])
      .select()
      .single();

    if (messageError) throw messageError;

    const lastMsg = state.allMessages[state.allMessages.length - 1];
    if (lastMsg) {
      const lastDate = new Date(lastMsg.created_at).toDateString();
      const newDate = new Date(messageData.created_at).toDateString();
    }

    renderMessage(messageData, false);
    state.allMessages.push(messageData);
    scrollToBottom(true);

    await state.channel.send({
      type: 'broadcast',
      event: 'new-message',
      payload: messageData
    });

    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      const messageType = viewOnce ? "a view-once photo 🔒" : "a photo";
      await sendTelegramNotification(`My Love sent ${messageType}`);
    }

    updateConnectionStatus('🟢 Connected');

  } catch (error) {
    console.error('Error sending image:', error);
    showAlert('Failed to send image. Please try again.');
    updateConnectionStatus('🟢 Connected');
  } finally {
    state.selectedImageFile = null;
    state.selectedImageDataUrl = null;
    document.getElementById('view-once-checkbox').checked = false;
  }
};

window.openImageViewer = async function (messageId, imagePathOrUrl, viewOnce, viewedBy, senderEmail) {
  const currentUser = state.currentUserEmail;
  const hasViewed = viewedBy && viewedBy.includes(currentUser);

  if (viewOnce && hasViewed) {
    return;
  }

  try {
    let imagePath = imagePathOrUrl;
    if (imagePath.includes('http')) {
      const urlParts = imagePath.split('/chat-images/');
      imagePath = urlParts[1] || imagePath;
    }

    const { data: signedUrlData, error: signedUrlError } = await state.supabaseClient.storage
      .from('chat-images')
      .createSignedUrl(imagePath, 3600);

    if (signedUrlError) throw signedUrlError;

    document.getElementById('viewer-image').src = signedUrlData.signedUrl;

    const infoDiv = document.getElementById('viewer-info');
    if (viewOnce && !hasViewed) {
      infoDiv.textContent = '🔒 This is a view-once photo';
    } else {
      infoDiv.textContent = '';
    }

    document.getElementById('image-viewer-modal').style.display = 'flex';

    if (viewOnce && !hasViewed) {
      try {
        const { error } = await state.supabaseClient
          .from('chat_messages')
          .update({
            viewed_by: [...(viewedBy || []), currentUser]
          })
          .eq('id', messageId);

        if (error) throw error;

        if (currentUser === "ayaessam487@gmail.com") {
          const senderName = USER_NAMES[senderEmail] || senderEmail;
          await sendTelegramNotification(`My Love opened ${senderName}'s photo 👀`);
        }

        setTimeout(() => {
          const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
          if (messageElement) {
            const imageContainer = messageElement.querySelector('.message-image-container');
            if (imageContainer) {
              imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Photo viewed</div>';
            }
          }
        }, 100);

        if (state.channel) {
          state.channel.send({
            type: 'broadcast',
            event: 'image-viewed',
            payload: { messageId, viewerId: currentUser }
          });
        }

      } catch (error) {
        console.error('Error marking image as viewed:', error);
      }
    }
  } catch (error) {
    console.error('Error opening image viewer:', error);
    showAlert('Failed to load image');
  }
};

window.closeImageViewer = function () {
  document.getElementById('image-viewer-modal').style.display = 'none';
};

window.closeImageViewerOnOutsideClick = function (event) {
  if (event.target.id === 'image-viewer-modal') {
    closeImageViewer();
  }
};