// 🔧 SUPABASE CONFIG
const SUPABASE_URL = "https://twvwusthqhxnmghcnbjk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnd1c3RocWh4bm1naGNuYmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzUwMTAsImV4cCI6MjA4MTkxMTAxMH0.zPw0OH5TaWCM_SLGQYpUAp00mVZwamR13KPDs_HRb7s";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 👤 ADMIN APPROVAL
const ALLOWED_EMAILS = [
    "adhammorsy2311@gmail.com",
    "ayaessam487@gmail.com",
    "joboffers540@gmail.com"
];

// Map emails to display names
const USER_NAMES = {
    "adhammorsy2311@gmail.com": "annoyoumous",
    "ayaessam487@gmail.com": "Cuitie",
    "joboffers540@gmail.com": "JobOffers"
};

let channel;
let currentUserEmail = "";

// LOGIN FUNCTION
window.login = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    if (!ALLOWED_EMAILS.includes(data.user.email)) {
        alert("Access denied.");
        await supabaseClient.auth.signOut();
        return;
    }

    currentUserEmail = data.user.email;

    // ✅ Hide login, show chat
    document.getElementById("login").style.display = "none";
    document.getElementById("chat").style.display = "flex";

    // 🔔 Request notification permission here
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            console.log("Notification permission:", permission);
        });
    }

    joinChat(currentUserEmail);
};

// Ask the user for permission to send notifications
if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
        console.log("Notification permission:", permission);
    });
}

function notifyUser(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "https://cdn-icons-png.flaticon.com/512/2462/2462719.png" // optional icon
        });
    }
}

// 💬 JOIN CHAT
async function joinChat(email) {
    document.getElementById("status").innerText = "Connecting...";

    // 1️⃣ Load previous messages from database
    const { data: messages, error } = await supabaseClient
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        console.error("Error loading messages:", error.message);
    } else if (messages) {
        messages.forEach(msg => {
            const senderName = USER_NAMES[msg.sender] || msg.sender;
            const display = (msg.sender === currentUserEmail)
                ? `You (${senderName}): ${msg.text}`
                : `${senderName}: ${msg.text}`;
            addMessage(display);
        });
    }

    // 2️⃣ Connect to Realtime channel
    channel = supabaseClient.channel("private-room", {
        config: { presence: { key: email } }
    });

    channel
        .on("broadcast", { event: "message" }, payload => {
            const text = payload.payload?.text ?? "[message]";
            const senderEmail = payload.payload?.sender ?? "Other";
            const senderName = USER_NAMES[senderEmail] || senderEmail;
            const display = (senderEmail === currentUserEmail)
                ? `You (${senderName}): ${text}`
                : `${senderName}: ${text}`;
            addMessage(display);

            // Only notify if the message is from someone else
            if (senderEmail !== currentUserEmail) {
                notifyUser(senderName, text);
            }
        })
        .on("broadcast", { event: "clear" }, async () => {
            clearMessages();

            // Delete messages from database
            await supabaseClient.from("chat_messages").delete().neq("id", 0);
        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
                document.getElementById("status").innerText = "Connected";
                console.log("✅ Realtime connected");
            }
        });
}

// ✉ SEND MESSAGE
window.send = async function () {
    const input = document.getElementById("msg");
    if (!input.value || !channel) return;

    const text = input.value;
    const senderName = USER_NAMES[currentUserEmail] || currentUserEmail;

    // Store in database
    await supabaseClient
        .from("chat_messages")
        .insert([{ sender: currentUserEmail, text }]);

    // Immediately display locally
    addMessage(`You (${senderName}): ${text}`);

    // Broadcast to everyone
    channel.send({
        type: "broadcast",
        event: "message",
        payload: { text, sender: currentUserEmail }
    });

    input.value = "";
};

// 🚨 PANIC BUTTON
window.panic = async function () {
    if (!channel) return;
    //   if (!confirm("Erase all messages?")) return;

    // Broadcast clear event to everyone
    channel.send({ type: "broadcast", event: "clear", payload: {} });

    // Clear local messages immediately
    clearMessages();

    // Delete messages from Supabase
    await supabaseClient.from("chat_messages").delete().neq("id", 0);
};

// 🧹 ADD MESSAGE TO CHAT BOX
function addMessage(text) {
    const messagesDiv = document.getElementById("messages");
    const p = document.createElement("p");
    p.textContent = text;
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 🧹 CLEAR MESSAGES
function clearMessages() {
    document.getElementById("messages").innerHTML = "";
}

// ❌ AUTO-CLEAR WHEN USER LEAVES
// window.addEventListener("beforeunload", () => {
//     if (channel) {
//         channel.send({ type: "broadcast", event: "clear", payload: {} });
//     }
// });
