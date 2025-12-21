// 🔧 SUPABASE CONFIG
const SUPABASE_URL = "https://twvwusthqhxnmghcnbjk.supabase.co";
const SUPABASE_KEY = "sb_publishable_fWFa53X18qWhCQaNeHTA5w_skal_MdK";

const supabase = window.supabase.createClient(
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

// 🔐 LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  if (!ALLOWED_EMAILS.includes(data.user.email)) {
    alert("Access denied. Waiting for admin approval.");
    await supabase.auth.signOut();
    return;
  }

  document.getElementById("login").hidden = true;
  document.getElementById("chat").hidden = false;

  joinChat(data.user.email);
}

// 💬 JOIN CHAT
function joinChat(email) {
  document.getElementById("status").innerText = "Connected";

  channel = supabase.channel("private-room", {
    config: {
      presence: { key: email }
    }
  });

  channel
    .on("broadcast", { event: "message" }, payload => {
      addMessage(payload.payload.text);
    })
    .on("broadcast", { event: "clear" }, () => {
      clearMessages();
    })
    .subscribe();
}

// ✉ SEND MESSAGE
function send() {
  const input = document.getElementById("msg");
  if (!input.value) return;

  channel.send({
    type: "broadcast",
    event: "message",
    payload: { text: input.value }
  });

  input.value = "";
}

// 🚨 PANIC BUTTON
function panic() {
  if (!confirm("Erase all chat messages?")) return;

  channel.send({
    type: "broadcast",
    event: "clear",
    payload: {}
  });
}

// 🧹 CLEAR MESSAGES
function clearMessages() {
  document.getElementById("messages").innerHTML = "";
}

// ➕ ADD MESSAGE
function addMessage(text) {
  const p = document.createElement("p");
  p.innerText = text;
  document.getElementById("messages").appendChild(p);
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
