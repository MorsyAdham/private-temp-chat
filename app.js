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
    pageSize: 50,
    initialLoad: 100
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
  unreadMessages: new Set(), // Track unread message IDs
  isAtBottom: true, // Track if user is at bottom of messages
  selectedImageFile: null, // Currently selected image for sending
  selectedImageDataUrl: null // Base64 preview of selected image
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Supabase client on page load
 */
function initializeApp() {
  state.supabaseClient = window.supabase.createClient(
    CONFIG.supabase.url,
    CONFIG.supabase.key
  );
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Handle user login with email/password
 */
window.login = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("Please enter both email and password");
    return;
  }

  try {
    // Authenticate with Supabase
    const { data, error } = await state.supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // RLS policies will handle authorization, but we double-check client-side
    if (!ALLOWED_EMAILS.includes(data.user.email)) {
      await state.supabaseClient.auth.signOut();
      showAlert("Access denied. You are not authorized to use this chat.");
      return;
    }

    state.currentUserEmail = data.user.email;

    // Request notification permissions
    await requestNotificationPermission();

    // Update UI to show chat
    showChatScreen();

    // Set user as online
    await updatePresence(true);

    // Send Telegram notification for Aya login
    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      await sendTelegramNotification("My Love just logged in! 💕");
    }

    // Initialize chat
    await initializeChat();

  } catch (error) {
    console.error("Login error:", error);
    showAlert("Login failed: " + error.message);
  }
};

/**
 * Request browser notification permission
 */
async function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}

/**
 * Update user presence status in database
 */
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

/**
 * Initialize chat: load messages and setup realtime subscription
 */
async function initializeChat() {
  updateConnectionStatus("🔄 Loading messages...");

  try {
    // Load initial batch of messages
    await loadInitialMessages();

    // Setup realtime subscription for new messages
    await setupRealtimeSubscription();

    // Setup read receipt listener
    setupReadReceiptListener();

    // Setup scroll handler for load more button visibility
    setupScrollHandler();

    updateConnectionStatus("🟢 Connected");

  } catch (error) {
    console.error("Chat initialization error:", error);
    updateConnectionStatus("🔴 Connection failed");
    showAlert("Failed to connect to chat. Please refresh the page.");
  }
}

/**
 * Load initial batch of messages (most recent)
 */
async function loadInitialMessages() {
  try {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(CONFIG.pagination.initialLoad);

    if (error) throw error;

    if (data && data.length > 0) {
      // Reverse to show oldest first
      const messages = data.reverse();
      
      // Track oldest message for pagination
      state.oldestMessageTimestamp = messages[0].created_at;
      
      // Check if there are more messages to load
      state.hasMoreMessages = data.length === CONFIG.pagination.initialLoad;

      // Render messages
      messages.forEach(msg => renderMessage(msg, false));

      // Scroll to bottom
      scrollToBottom(true);

      // Mark received messages as read
      await markVisibleMessagesAsRead();
    }

  } catch (error) {
    console.error("Error loading messages:", error);
    throw error;
  }
}

/**
 * Load older messages (pagination)
 */
window.loadOlderMessages = async function() {
  if (state.isLoadingOlderMessages || !state.hasMoreMessages) {
    return;
  }

  state.isLoadingOlderMessages = true;
  const loadButton = document.getElementById("load-more-btn");
  if (loadButton) loadButton.textContent = "Loading...";

  try {
    const { data, error } = await state.supabaseClient
      .from("chat_messages")
      .select("*")
      .lt("created_at", state.oldestMessageTimestamp)
      .order("created_at", { ascending: false })
      .limit(CONFIG.pagination.pageSize);

    if (error) throw error;

    if (data && data.length > 0) {
      // Save current scroll position
      const messagesDiv = document.getElementById("messages");
      const oldScrollHeight = messagesDiv.scrollHeight;

      // Reverse and prepend messages (after the load button)
      const messages = data.reverse();
      state.oldestMessageTimestamp = messages[0].created_at;

      messages.forEach(msg => renderMessage(msg, true));

      // Restore scroll position (keep user at same visual position)
      messagesDiv.scrollTop = messagesDiv.scrollHeight - oldScrollHeight;

      // Check if more messages exist
      state.hasMoreMessages = data.length === CONFIG.pagination.pageSize;
    } else {
      state.hasMoreMessages = false;
    }

    // Update button text
    updateLoadMoreButton();

  } catch (error) {
    console.error("Error loading older messages:", error);
    showAlert("Failed to load older messages");
  } finally {
    state.isLoadingOlderMessages = false;
  }
};

/**
 * Update load more button text and visibility
 */
function updateLoadMoreButton() {
  const loadButton = document.getElementById("load-more-btn");
  if (!loadButton) return;

  if (state.hasMoreMessages) {
    loadButton.textContent = "Load older messages";
    loadButton.disabled = false;
  } else {
    loadButton.textContent = "No more messages";
    loadButton.disabled = true;
  }
}

/**
 * Setup scroll handler to show/hide load more button
 */
function setupScrollHandler() {
  const messagesDiv = document.getElementById("messages");
  const loadButton = document.getElementById("load-more-btn");
  
  if (!messagesDiv || !loadButton) return;

  messagesDiv.addEventListener("scroll", () => {
    // Show load button when scrolled to top (within 50px)
    if (messagesDiv.scrollTop < 50 && state.hasMoreMessages) {
      loadButton.style.display = "block";
    } else {
      loadButton.style.display = "none";
    }

    // Check if at bottom for read receipts
    const isAtBottom = 
      messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 50;

    state.isAtBottom = isAtBottom;

    if (isAtBottom) {
      markVisibleMessagesAsRead();
    }
  });
}

// ============================================================================
// REALTIME SUBSCRIPTION
// ============================================================================

/**
 * Setup Supabase realtime channel for new messages
 */
async function setupRealtimeSubscription() {
  // Method 1: Using broadcast (faster but requires Realtime to be properly configured)
  state.channel = state.supabaseClient.channel("private-room", {
    config: {
      broadcast: { self: false }
    }
  });

  // Listen for broadcast messages
  state.channel.on("broadcast", { event: "new-message" }, async (payload) => {
    const message = payload.payload;

    if (!message || !message.id) {
      return;
    }

    renderMessage(message, false);
    
    if (state.isAtBottom) {
      scrollToBottom(true);
    }

    if (message.sender !== state.currentUserEmail) {
      if (state.isAtBottom) {
        await markMessageAsRead(message.id);
      }
      
      showNotification(USER_NAMES[message.sender] || message.sender, message.text || "Sent a photo");

      // Only send Telegram notifications for Aya's activity
      if (message.sender === "ayaessam487@gmail.com") {
        const messageContent = message.message_type === 'image' ? 'a photo' : message.text;
        await sendTelegramNotification(`My Love sent ${messageContent}`);
      }
    }
  });

  // Listen for image-viewed broadcasts to update sender's UI
  state.channel.on("broadcast", { event: "image-viewed" }, async (payload) => {
    const { messageId, viewerId } = payload.payload;
    
    // Update the message to show "Opened" status for sender
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
      const imageContainer = messageElement.querySelector('.message-image-container');
      if (imageContainer) {
        imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Opened</div>';
      }
    }
  });

  // Method 2: BACKUP - Listen for database INSERT events (more reliable)
  state.channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "chat_messages"
    },
    async (payload) => {
      const message = payload.new;

      // Don't render if it's from current user (already rendered locally)
      if (message.sender === state.currentUserEmail) {
        return;
      }

      renderMessage(message, false);
      
      if (state.isAtBottom) {
        scrollToBottom(true);
      }

      if (state.isAtBottom) {
        await markMessageAsRead(message.id);
      }
      
      showNotification(USER_NAMES[message.sender] || message.sender, message.text || "Sent a photo");

      // Only send Telegram notifications for Aya's activity
      if (message.sender === "ayaessam487@gmail.com") {
        const messageContent = message.message_type === 'image' ? 'a photo' : message.text;
        await sendTelegramNotification(`My Love sent ${messageContent}`);
      }
    }
  );

  // Subscribe to channel
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

/**
 * Setup listener for read receipt updates
 */
function setupReadReceiptListener() {
  state.supabaseClient
    .channel("read-receipts")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "chat_messages",
        filter: `sender=eq.${state.currentUserEmail}`
      },
      (payload) => {
        // Update read receipt UI for sender's messages
        if (payload.new.read) {
          updateMessageReadReceipt(payload.new.id, true);
        }
      }
    )
    .subscribe();
}

// ============================================================================
// SEND MESSAGE
// ============================================================================

/**
 * Send a new message
 */
window.send = async function() {
  const input = document.getElementById("msg");
  const text = input.value.trim();

  if (!text || !state.channel) {
    return;
  }

  try {
    // Insert message into database
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

    // Render message locally for sender
    renderMessage(data, false);
    scrollToBottom(true);

    // Broadcast to other users via realtime
    await state.channel.send({
      type: "broadcast",
      event: "new-message",
      payload: data
    });

    // Telegram notification if current user is Aya
    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      await sendTelegramNotification(`Aya sent: ${text}`);
    }

    // Clear input
    input.value = "";

  } catch (error) {
    console.error("Error sending message:", error);
    showAlert("Failed to send message. Please try again.");
  }
};

// ============================================================================
// MESSAGE RENDERING
// ============================================================================

/**
 * Render a single message in the chat UI
 * @param {Object} message - Message object from database
 * @param {boolean} prepend - If true, add after load button; if false, add to bottom
 */
function renderMessage(message, prepend = false) {
  const messagesDiv = document.getElementById("messages");
  const isSender = message.sender === state.currentUserEmail;
  const messageType = message.message_type || 'text';

  // Check if message already exists (prevent duplicates)
  const existingMessage = document.querySelector(`[data-message-id="${message.id}"]`);
  if (existingMessage) {
    return;
  }

  // Create message bubble
  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isSender ? "sender" : "receiver"}`;
  if (messageType === 'image') {
    bubble.classList.add('image-message');
  }
  bubble.dataset.messageId = message.id;

  // Add sender name for received messages
  if (!isSender) {
    const nameDiv = document.createElement("div");
    nameDiv.className = "sender-name";
    nameDiv.textContent = USER_NAMES[message.sender] || "Unknown";
    bubble.appendChild(nameDiv);
  }

  // Render based on message type
  if (messageType === 'image') {
    // Image message
    const imageContainer = document.createElement("div");
    imageContainer.className = "message-image-container";
    
    const viewOnce = message.view_once || false;
    const viewedBy = message.viewed_by || [];
    const hasViewed = viewedBy.includes(state.currentUserEmail);
    const wasOpened = viewedBy.length > 0; // Check if anyone opened it
    
    // Check if should show image or status overlay
    if (viewOnce && (hasViewed || (isSender && wasOpened))) {
      // Show "opened" overlay for sender after recipient opens, or "viewed" for receiver
      const statusText = isSender ? '📷 Opened' : '📷 Photo viewed';
      imageContainer.innerHTML = `<div class="image-viewed-overlay">${statusText}</div>`;
      imageContainer.style.width = '200px';
      imageContainer.style.height = '200px';
      imageContainer.style.background = '#1e293b';
    } else if (viewOnce && isSender && !wasOpened) {
      // Show "sent" status for sender before recipient opens
      imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Sent</div>';
      imageContainer.style.width = '200px';
      imageContainer.style.height = '200px';
      imageContainer.style.background = '#1e293b';
    } else if (viewOnce && !isSender && !hasViewed) {
      // Show actual image for receiver who hasn't viewed yet
      const img = document.createElement("img");
      img.className = "message-image";
      img.alt = "Sent image";
      img.loading = "lazy";
      
      // Generate signed URL for the image
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
      
      // Add view-once indicator
      const overlay = document.createElement("div");
      overlay.className = "view-once-overlay";
      overlay.innerHTML = '🔒 View once';
      imageContainer.appendChild(overlay);
    } else if (!viewOnce) {
      // Regular image (not view-once)
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
    // Text message
    const textDiv = document.createElement("div");
    textDiv.className = "message-text";
    textDiv.textContent = message.text;
    bubble.appendChild(textDiv);
  }

  // Message metadata (time + read receipt)
  const metaDiv = document.createElement("div");
  metaDiv.className = "message-meta";
  metaDiv.textContent = formatTime(message.created_at);

  // Add read receipt for sender's messages
  if (isSender) {
    const receipt = document.createElement("span");
    receipt.className = `receipt ${message.read ? "read" : "sent"}`;
    receipt.textContent = message.read ? " ✓✓" : " ✓";
    metaDiv.appendChild(receipt);
  }

  bubble.appendChild(metaDiv);

  // Add to DOM
  if (prepend) {
    // Find the first message bubble (not the load button)
    const firstMessage = messagesDiv.querySelector(".message-bubble");
    if (firstMessage) {
      messagesDiv.insertBefore(bubble, firstMessage);
    } else {
      // No messages yet, just append
      messagesDiv.appendChild(bubble);
    }
  } else {
    messagesDiv.appendChild(bubble);
  }

  // Track unread messages from others
  if (!isSender && !message.read) {
    state.unreadMessages.add(message.id);
  }
}

/**
 * Update read receipt UI for a specific message
 */
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

/**
 * Mark a specific message as read
 */
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

/**
 * Mark all visible unread messages as read
 */
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

/**
 * Show browser notification
 */
function showNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "/favicon.ico"
    });
  }
}

/**
 * Send notification via Telegram
 */
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

/**
 * Show chat screen and hide login screen
 */
function showChatScreen() {
  document.getElementById("login").style.display = "none";
  document.getElementById("chat").style.display = "flex";
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus(text) {
  const statusDiv = document.getElementById("connection-status");
  if (statusDiv) statusDiv.textContent = text;
}

/**
 * Show alert message to user
 */
function showAlert(message) {
  alert(message);
}

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Scroll messages container to bottom
 * @param {boolean} smooth - If true, scroll smoothly
 */
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

/**
 * Clear all messages from UI (panic button)
 */
function clearMessagesUI() {
  const messagesDiv = document.getElementById("messages");
  const loadButton = document.getElementById("load-more-btn");
  
  // Remove only message bubbles, keep the load button
  const messageBubbles = messagesDiv.querySelectorAll(".message-bubble");
  messageBubbles.forEach(bubble => bubble.remove());
  
  // Hide the load button to prevent loading messages after panic
  if (loadButton) {
    loadButton.style.display = "none";
  }
  
  // Disable loading older messages after panic
  state.hasMoreMessages = false;
}

// ============================================================================
// PANIC BUTTON
// ============================================================================

/**
 * Handle panic button - hides all messages from UI
 */
window.panic = function() {
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

/**
 * Setup event listeners when DOM is ready
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();

  // Enter key to send message
  const msgInput = document.getElementById("msg");
  if (msgInput) {
    msgInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        send();
      }
    });
  }

  // ESC key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Close image viewer if open
      const imageViewer = document.getElementById("image-viewer-modal");
      if (imageViewer && imageViewer.style.display === "flex") {
        closeImageViewer();
      }
      
      // Close image preview if open
      const imagePreview = document.getElementById("image-preview-modal");
      if (imagePreview && imagePreview.style.display === "flex") {
        cancelImageSend();
      }
      
      // Close image picker if open
      const imagePicker = document.getElementById("image-picker-modal");
      if (imagePicker && imagePicker.style.display === "flex") {
        closeImagePicker();
      }
    }
  });
});

// ============================================================================
// CLEANUP ON PAGE UNLOAD
// ============================================================================

/**
 * Cleanup when user leaves page
 */
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

/**
 * Open image picker modal (camera or gallery)
 */
window.openImagePicker = function() {
  document.getElementById("image-picker-modal").style.display = "flex";
};

/**
 * Close image picker modal
 */
window.closeImagePicker = function() {
  document.getElementById("image-picker-modal").style.display = "none";
};

/**
 * Open camera to take photo
 */
window.openCamera = function() {
  closeImagePicker();
  document.getElementById("camera-input").click();
};

/**
 * Open gallery to choose photo
 */
window.openGallery = function() {
  closeImagePicker();
  document.getElementById("image-input").click();
};

/**
 * Handle image selection from camera or gallery
 */
window.handleImageSelect = function(event) {
  const file = event.target.files[0];
  
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Please select an image file');
    return;
  }

  // Store file and create preview
  state.selectedImageFile = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    state.selectedImageDataUrl = e.target.result;
    document.getElementById('preview-image').src = e.target.result;
    document.getElementById('image-preview-modal').style.display = 'flex';
  };
  reader.readAsDataURL(file);
  
  // Reset input
  event.target.value = '';
};

/**
 * Cancel image send
 */
window.cancelImageSend = function() {
  state.selectedImageFile = null;
  state.selectedImageDataUrl = null;
  document.getElementById('image-preview-modal').style.display = 'none';
  document.getElementById('view-once-checkbox').checked = false;
};

/**
 * Confirm and send image
 */
window.confirmImageSend = async function() {
  if (!state.selectedImageFile) return;
  
  const viewOnce = document.getElementById('view-once-checkbox').checked;
  
  // Hide modal and show loading
  document.getElementById('image-preview-modal').style.display = 'none';
  updateConnectionStatus('📤 Uploading image...');
  
  try {
    // Upload image to Supabase Storage
    const fileExt = state.selectedImageFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${state.currentUserEmail}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await state.supabaseClient.storage
      .from('chat-images')
      .upload(filePath, state.selectedImageFile);
    
    if (uploadError) throw uploadError;
    
    // Store the file path instead of URL (we'll generate signed URLs when displaying)
    const imageUrl = filePath;
    
    // Insert message into database
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
    
    // Render message locally
    renderMessage(messageData, false);
    scrollToBottom(true);
    
    // Broadcast to other users
    await state.channel.send({
      type: 'broadcast',
      event: 'new-message',
      payload: messageData
    });
    
    // Telegram notification if sender is Aya
    if (state.currentUserEmail === "ayaessam487@gmail.com") {
      const viewOnceText = viewOnce ? " (view once)" : "";
      await sendTelegramNotification(`Aya sent a photo${viewOnceText}`);
    }
    
    updateConnectionStatus('🟢 Connected');
    
  } catch (error) {
    console.error('Error sending image:', error);
    showAlert('Failed to send image. Please try again.');
    updateConnectionStatus('🟢 Connected');
  } finally {
    // Clean up
    state.selectedImageFile = null;
    state.selectedImageDataUrl = null;
    document.getElementById('view-once-checkbox').checked = false;
  }
};

/**
 * Open image viewer
 */
window.openImageViewer = async function(messageId, imagePathOrUrl, viewOnce, viewedBy, senderEmail) {
  const currentUser = state.currentUserEmail;
  const hasViewed = viewedBy && viewedBy.includes(currentUser);
  
  // If view-once and already viewed, don't open
  if (viewOnce && hasViewed) {
    return;
  }
  
  try {
    // Extract file path from URL if it's a full URL (for old messages)
    let imagePath = imagePathOrUrl;
    if (imagePath.includes('http')) {
      // Old format: extract path from URL
      const urlParts = imagePath.split('/chat-images/');
      imagePath = urlParts[1] || imagePath;
    }
    
    // Generate signed URL for viewing
    const { data: signedUrlData, error: signedUrlError } = await state.supabaseClient.storage
      .from('chat-images')
      .createSignedUrl(imagePath, 3600); // 1 hour expiry
    
    if (signedUrlError) throw signedUrlError;
    
    // Display image
    document.getElementById('viewer-image').src = signedUrlData.signedUrl;
    
    // Set info text
    const infoDiv = document.getElementById('viewer-info');
    if (viewOnce && !hasViewed) {
      infoDiv.textContent = '🔒 This is a view-once photo';
    } else {
      infoDiv.textContent = '';
    }
    
    document.getElementById('image-viewer-modal').style.display = 'flex';
    
    // Mark as viewed if view-once and not already viewed
    if (viewOnce && !hasViewed) {
      try {
        // Update viewed_by array in database
        const { error } = await state.supabaseClient
          .from('chat_messages')
          .update({
            viewed_by: [...(viewedBy || []), currentUser]
          })
          .eq('id', messageId);
        
        if (error) throw error;
        
        // Send Telegram notification to sender that image was opened
        // Only send notification if Aya opened the photo
        if (currentUser === "ayaessam487@gmail.com") {
          const senderName = USER_NAMES[senderEmail] || senderEmail;
          await sendTelegramNotification(`My Love opened ${senderName}'s photo 👀`);
        }
        
        // Update UI - show "opened" status
        setTimeout(() => {
          const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
          if (messageElement) {
            const imageContainer = messageElement.querySelector('.message-image-container');
            if (imageContainer) {
              imageContainer.innerHTML = '<div class="image-viewed-overlay">📷 Photo viewed</div>';
            }
          }
        }, 100);
        
        // Broadcast the update to other users so sender sees "opened" status
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

/**
 * Close image viewer
 */
window.closeImageViewer = function() {
  document.getElementById('image-viewer-modal').style.display = 'none';
};

/**
 * Close image viewer when clicking outside the image
 */
window.closeImageViewerOnOutsideClick = function(event) {
  // Only close if clicking the modal background, not the image itself
  if (event.target.id === 'image-viewer-modal') {
    closeImageViewer();
  }
};