const token = localStorage.getItem("token");
const currentUsername = localStorage.getItem("username");

if (!token) {
    location.href = "login.html";
}

document.getElementById("currentUser").textContent = `Logged in as: ${currentUsername}`;

let ws;
const messagesDiv = document.getElementById("messages");

function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.hostname}:3000?token=${token}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        document.getElementById("status").textContent = "● Connected";
        document.getElementById("status").style.color = "#10b981";
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "history" && Array.isArray(data.payload)) {
            messagesDiv.innerHTML = '';
            data.payload.forEach(msg => appendMessage(msg));
        }

        if (data.type === "chat") {
            appendMessage(data.payload);
        }
    };

    ws.onclose = () => {
        document.getElementById("status").textContent = "○ Disconnected";
        document.getElementById("status").style.color = "#ef4444";
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

function appendMessage(msg) {
    const isOwn = msg.username === currentUsername;
    const div = document.createElement("div");
    div.className = `message ${isOwn ? 'own' : ''}`;
    div.innerHTML = `
        <span class="username">${msg.username}</span>
        <div class="text">${msg.text}</div>
        <span class="timestamp">${msg.timestamp || ""}</span>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "chat",
            payload: { text }
        }));
        input.value = "";
    } else {
        console.error("WebSocket is not connected.");
    }
}

function logout() {
    localStorage.clear();
    location.href = "login.html";
}

document.getElementById("messageInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

connectWebSocket();
