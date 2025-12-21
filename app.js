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

    joinChat(currentUserEmail);
};


// 💬 JOIN CHAT
function joinChat(email) {
    document.getElementById("status").innerText = "Connecting...";

    channel = supabaseClient.channel("private-room", {
        config: { presence: { key: email } }
    });

    channel
        .on("broadcast", { event: "message" }, payload => {
            const text = payload.payload?.text ?? "[message]";
            const sender = payload.payload?.sender ?? "Other";
            const display = (sender === currentUserEmail) ? `You: ${text}` : `${sender}: ${text}`;
            addMessage(display);
        })
        .on("broadcast", { event: "clear" }, () => {
            clearMessages();
        })
        .subscribe(status => {
            if (status === "SUBSCRIBED") {
                document.getElementById("status").innerText = "Connected";
                console.log("✅ Realtime connected");
            }
        });
}

// ✉ SEND MESSAGE
window.send = function () {
    const input = document.getElementById("msg");
    if (!input.value || !channel) return;

    const text = input.value;

    // Immediately display for sender
    addMessage("You: " + text);

    // Broadcast to everyone
    channel.send({
        type: "broadcast",
        event: "message",
        payload: { text, sender: currentUserEmail }
    });

    input.value = "";
};

// 🚨 PANIC BUTTON
window.panic = function () {
    if (!channel) return;
    // if (!confirm("Erase all messages?")) return;

    // Broadcast clear event to everyone
    channel.send({ type: "broadcast", event: "clear", payload: {} });

    // Clear local messages immediately
    clearMessages();
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
window.addEventListener("beforeunload", () => {
    if (channel) {
        channel.send({ type: "broadcast", event: "clear", payload: {} });
    }
});
