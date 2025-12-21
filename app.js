// 🔧 SUPABASE CONFIG
const SUPABASE_URL = "https://twvwusthqhxnmghcnbjk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dnd1c3RocWh4bm1naGNuYmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzUwMTAsImV4cCI6MjA4MTkxMTAxMH0.zPw0OH5TaWCM_SLGQYpUAp00mVZwamR13KPDs_HRb7s";

// ✅ DO NOT NAME IT "supabase"
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// 👤 ADMIN APPROVAL (ONLY THESE EMAILS CAN ENTER)
const ALLOWED_EMAILS = [
  "adhammorsy2311@gmail.com",
  "ayaessam487@gmail.com",
  "joboffers540@gmail.com"
];

let channel;

// 🔐 LOGIN (GLOBAL FUNCTION)
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (!ALLOWED_EMAILS.includes(data.user.email)) {
    alert("Access denied.");
    await supabaseClient.auth.signOut();
    return;
  }

  document.getElementById("login").hidden = true;
  document.getElementById("chat").hidden = false;

  joinChat(data.user.email);
};

// 💬 JOIN CHAT
function joinChat(email) {
  document.getElementById("status").innerText = "Connecting...";

  channel = supabaseClient.channel("private-room", {
    config: {
      presence: { key: email }
    }
  });

  channel
    .on("broadcast", { event: "message" }, payload => {
      const text =
        payload.payload?.text ??
        payload.message?.text ??
        payload.text ??
        "[invalid message]";

        addMessage(text);
    })
    .on("broadcast", { event: "clear" }, clearMessages)
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

  console.log("📤 Sending:", input.value);

  channel.send({
    type: "broadcast",
    event: "message",
    payload: { text: input.value }
  });

  input.value = "";
};

// 🚨 PANIC BUTTON
window.panic = function () {
  if (!channel) return;
  if (!confirm("Erase all messages?")) return;

  channel.send({
    type: "broadcast",
    event: "clear",
    payload: {}
  });
};

// 🧹 CLEAR MESSAGES
function clearMessages() {
  document.getElementById("messages").innerHTML = "";
}

// ➕ ADD MESSAGE
function addMessage(text) {
  const messagesDiv = document.getElementById("messages");

  const p = document.createElement("p");
  p.textContent = text;

  messagesDiv.appendChild(p);

  // 👇 AUTO SCROLL
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
} 

// ❌ AUTO CLEAR WHEN USER LEAVES
window.addEventListener("beforeunload", () => {
  if (channel) {
    channel.send({
      type: "broadcast",
      event: "clear",
      payload: {}
    });
  }
});
