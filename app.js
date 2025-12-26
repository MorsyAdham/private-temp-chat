// 🔧 SUPABASE CONFIG
const SUPABASE_URL = "https://twvwusthqhxnmghcnbjk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnd1c3RocWh4bm1naGNuYmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzUwMTAsImV4cCI6MjA4MTkxMTAxMH0.zPw0OH5TaWCM_SLGQYpUAp00mVZwamR13KPDs_HRb7s";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// 👤 ADMIN APPROVAL
const ALLOWED_EMAILS = [
    "adhammorsy2311@gmail.com",
    "ayaessam487@gmail.com",
    "joboffers540@gmail.com"
];

// Map emails to display names
const USER_NAMES = {
    "adhammorsy2311@gmail.com": "Nobody",
    "ayaessam487@gmail.com": "My Love",
    "joboffers540@gmail.com": "JobOffers"
};

let PAGE_SIZE = 1000;
// let oldestLoadedAt = null;

/* =========================
   LOGIN
========================= */
window.login = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) return alert(error.message);

    if (!ALLOWED_EMAILS.includes(data.user.email)) {
        alert("Access denied.");
        await supabaseClient.auth.signOut();
        return;
    }

    currentUserEmail = data.user.email;

    if (currentUserEmail === "ayaessam487@gmail.com") {
        sendTelegramNotification("Aya just logged in!");
    }

    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";

    // Notifications
    if (Notification.permission !== "granted") {
        await Notification.requestPermission();
    }

    // Presence online
    await supabaseClient.from("presence").upsert({
        email: currentUserEmail,
        online: true,
        last_seen: new Date()
    });

    joinChat(currentUserEmail);
};

let channel;
let currentUserEmail = "";
let partnerEmail = "";

/* =========================
   JOIN CHAT
========================= */
async function loadAllMessages() {
    const PAGE_SIZE = 500; // fetch in chunks
    let allMessages = [];
    let lastTimestamp = null;

    while (true) {
        let query = supabaseClient
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(PAGE_SIZE);

        if (lastTimestamp) {
            query = query.gt("created_at", lastTimestamp); // get newer messages
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
            break;
        }

        if (!data || data.length === 0) break;

        allMessages.push(...data);
        lastTimestamp = data[data.length - 1].created_at;

        if (data.length < PAGE_SIZE) break; // last batch
    }

    // Render messages
    allMessages.forEach(msg => {
        addMessage({
            text: msg.text,
            isSender: msg.sender === currentUserEmail,
            senderName: USER_NAMES[msg.sender],
            createdAt: msg.created_at,
            read: msg.read
        });
    });
}

async function joinChat(email) {
    currentUserEmail = email;
    partnerEmail = ALLOWED_EMAILS.find(e => e !== currentUserEmail);

    updateConnectionStatus("Connecting...");

    // 1️⃣ Load all messages
    await loadAllMessages();

    // 2️⃣ Realtime chat channel
    channel = supabaseClient.channel("private-room");

    channel.on("broadcast", { event: "message" }, async payload => {
        const { id, text, sender, created_at } = payload.payload;

        addMessage({
            text,
            isSender: sender === currentUserEmail,
            senderName: USER_NAMES[sender],
            createdAt: created_at,
            read: false,
            id
        });

        if (sender !== currentUserEmail) {
            await supabaseClient
                .from("chat_messages")
                .update({ read: true })
                .eq("id", id);

            notifyUser(USER_NAMES[sender] || sender, text);
        }
    });

    channel.subscribe(status => {
        if (status === "SUBSCRIBED") {
            updateConnectionStatus("🟢 Connected");
            console.log("✅ Realtime connected");
        } else {
            updateConnectionStatus("🔴 Disconnected");
        }
    });
}

/* =========================
   SEND MESSAGE
========================= */
window.send = async function () {
    const input = document.getElementById("msg");
    if (!input.value || !channel) return;

    const text = input.value;

    // Insert + get row
    const { data: inserted, error } = await supabaseClient
        .from("chat_messages")
        .insert([{ sender: currentUserEmail, text }])
        .select()
        .single();

    if (error) return console.error(error);

    // Local display
    addMessage({
        text,
        isSender: true,
        createdAt: inserted.created_at,
        read: false
    });

    // Broadcast
    channel.send({
        type: "broadcast",
        event: "message",
        payload: {
            id: inserted.id,
            text,
            sender: currentUserEmail,
            created_at: inserted.created_at
        }
    });

    input.value = "";
};

/* =========================
   UI HELPERS
========================= */
function notifyUser(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function addMessage({ text, isSender, senderName, createdAt, read, id }) {
    const messagesDiv = document.getElementById("messages");

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${isSender ? "sender" : "receiver"}`;
    bubble.style.alignSelf = isSender ? "flex-end" : "flex-start";

    if (!isSender && senderName) {
        const name = document.createElement("div");
        name.className = "sender-name";
        name.textContent = senderName;
        bubble.appendChild(name);
    }

    const content = document.createElement("div");
    content.className = "message-text";
    content.textContent = text;

    const meta = document.createElement("div");
    meta.className = "message-meta";
    meta.textContent = createdAt ? formatTime(createdAt) : "";

    if (isSender) {
        const receipt = document.createElement("span");
        receipt.textContent = read ? " ✓✓" : " ✓";
        receipt.className = read ? "read" : "sent";
        meta.appendChild(receipt);
    }

    bubble.append(content, meta);
    messagesDiv.appendChild(bubble);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // ✅ Mark as read if message is from the other user and not already read
    if (!isSender && !read && id) {
        await supabaseClient
            .from("chat_messages")
            .update({ read: true })
            .eq("id", id);
    }
}

function clearMessages() {
    document.getElementById("messages").innerHTML = "";
}

/* =========================
   UPDATE STATUS UI
========================= */
function updateConnectionStatus(text) {
    document.getElementById("connection-status").textContent = text;
}

// Panic button: clear all messages after confirmation
document.getElementById("panic-btn").addEventListener("click", () => {
    const confirmPanic = confirm("Are you sure you want to hide all messages?");
    if (confirmPanic) {
        clearMessages(); // this is your existing function
    }
});


async function sendTelegramNotification(message) {
    const chatId = "5637769598";       // Replace with your chat ID
    const botToken = "8551799267:AAF3DHlffeUhTCWYV5J5c0AoYRbDmfNkodo";   // Replace with your bot token

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    });
}
