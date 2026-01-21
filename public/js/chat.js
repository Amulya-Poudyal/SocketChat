const token = localStorage.getItem("token");
const currentUsername = localStorage.getItem("username");

if (!token) {
    location.href = "login.html";
}

document.getElementById("currentUser").textContent = `Logged in as: ${currentUsername}`;

let ws;
let currentChannelId = null;
const messagesDiv = document.getElementById("messages");

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
        await joinChannel(inviteCode);
        // Clear param without reload
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    await loadChannels();
    connectWebSocket();
}

function connectWebSocket() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}?token=${token}`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        document.getElementById("status").textContent = "● Connected";
        document.getElementById("status").style.color = "#10b981";
        if (currentChannelId) {
            joinWSChannel(currentChannelId);
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "history" && Array.isArray(data.payload)) {
            messagesDiv.innerHTML = '';
            data.payload.forEach(msg => appendMessage(msg));
        }

        if (data.type === "chat") {
            if (data.payload.channelId === currentChannelId) {
                appendMessage(data.payload);
            }
        }

        if (data.type === "typing") {
            const indicator = document.getElementById("typingIndicator");
            if (data.payload.isTyping && data.payload.channelId === currentChannelId) {
                indicator.textContent = `${data.payload.username} is typing...`;
            } else {
                indicator.textContent = "";
            }
        }

        if (data.type === "system") {
            if (data.payload.channelId === currentChannelId) {
                appendSystemMessage(data.payload.text);
            }
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

let typingTimeout;
function handleTyping() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        // Send typing status
        ws.send(JSON.stringify({
            type: "typing",
            payload: { isTyping: true }
        }));

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            ws.send(JSON.stringify({
                type: "typing",
                payload: { isTyping: false }
            }));
        }, 3000);
    }
}

document.getElementById("messageInput").addEventListener("input", handleTyping);

function joinWSChannel(channelId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: "join",
            payload: { channelId }
        }));
    }
}

async function loadChannels() {
    try {
        const res = await fetch("/channels/list", {
            headers: { "Authorization": "Bearer " + token }
        });
        const channels = await res.json();
        const list = document.getElementById("channelList");
        list.innerHTML = "";

        channels.forEach(ch => {
            const div = document.createElement("div");
            div.style.cssText = `
                color: white; 
                padding: 10px; 
                border-radius: 8px; 
                font-weight: 500; 
                cursor: pointer;
                transition: background 0.2s;
            `;
            if (ch._id === currentChannelId) {
                div.style.background = "rgba(139, 92, 246, 0.2)";
                div.style.border = "1px solid var(--primary-color)";
            } else {
                div.style.background = "transparent";
            }

            div.textContent = `# ${ch.name}`;
            div.onclick = () => switchChannel(ch._id, ch.name, ch.inviteCode);
            list.appendChild(div);
        });

        if (!currentChannelId && channels.length > 0) {
            switchChannel(channels[0]._id, channels[0].name, channels[0].inviteCode);
        }
    } catch (err) {
        console.error("Error loading channels:", err);
    }
}

async function switchChannel(id, name, inviteCode) {
    currentChannelId = id;
    document.querySelector("h2").textContent = `# ${name}`;
    document.getElementById("messageInput").placeholder = `Message # ${name}`;

    // Show/Hide leave button (don't allow leaving general if it's the only one, or just show it for others)
    document.getElementById("leaveBtn").style.display = (name.toLowerCase() === 'general') ? "none" : "block";
    document.getElementById("typingIndicator").textContent = "";

    // Show invite link in header if possible
    let inviteSpan = document.getElementById("inviteInfo");
    if (!inviteSpan) {
        inviteSpan = document.createElement("span");
        inviteSpan.id = "inviteInfo";
        inviteSpan.style.cssText = "font-size: 0.7rem; color: var(--text-dim); margin-left: 10px; cursor: pointer;";
        document.querySelector(".header h2").appendChild(inviteSpan);
    }
    const fullInviteLink = `${window.location.origin}/chat.html?invite=${inviteCode}`;
    inviteSpan.textContent = `Invite Link (Click to Copy)`;
    inviteSpan.title = fullInviteLink;
    inviteSpan.onclick = () => {
        copyToClipboard(fullInviteLink);
        alert("Invite link copied to clipboard!");
    };

    loadChannels(); // Refresh active state
    joinWSChannel(id);
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }
}

async function showChannelInfo() {
    if (!currentChannelId) return;
    try {
        const res = await fetch(`/channels/info/${currentChannelId}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        const info = await res.json();

        document.getElementById("infoTitle").textContent = `# ${info.name}`;
        document.getElementById("infoDetails").innerHTML = `
            <p><strong>Owner:</strong> ${info.owner}</p>
            <p><strong>Members:</strong> ${info.memberCount}</p>
            <p><strong>Created:</strong> ${new Date(info.createdAt).toLocaleDateString()}</p>
        `;

        const ownerSection = document.getElementById("ownerOnlyInfo");
        const memberList = document.getElementById("memberList");

        if (info.isOwner) {
            ownerSection.style.display = "block";
            memberList.innerHTML = info.members.map(m => `
                <div style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <strong>${m.username}</strong> 
                    <span style="font-size: 0.7rem; color: var(--text-dim);">Joined ${new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
            `).join('');
        } else {
            ownerSection.style.display = "none";
        }

        document.getElementById("infoModal").style.display = "flex";
    } catch (err) {
        console.error("Error fetching info:", err);
    }
}

function hideInfoModal() { document.getElementById("infoModal").style.display = "none"; }

async function leaveCurrentChannel() {
    if (!currentChannelId) return;
    if (!confirm("Are you sure you want to leave this channel?")) return;

    try {
        await fetch("/channels/leave", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ channelId: currentChannelId })
        });
        currentChannelId = null;
        await loadChannels();
    } catch (err) {
        console.error("Error leaving channel:", err);
    }
}

function showChannelModal() { document.getElementById("channelModal").style.display = "flex"; }
function hideChannelModal() { document.getElementById("channelModal").style.display = "none"; }

async function createChannel() {
    const name = document.getElementById("newChannelName").value;
    const isPrivate = document.getElementById("isPrivate").checked;
    if (!name) return;

    const res = await fetch("/channels/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ name, isPrivate })
    });
    if (res.ok) {
        const ch = await res.json();
        hideChannelModal();
        await loadChannels();
        switchChannel(ch._id, ch.name, ch.inviteCode);
    } else {
        const data = await res.json();
        alert(data.message);
    }
}

async function joinChannel(code) {
    const inviteCode = code || document.getElementById("joinInviteCode").value;
    if (!inviteCode) return;

    const res = await fetch("/channels/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ inviteCode })
    });
    if (res.ok) {
        hideChannelModal();
        await loadChannels();
    } else if (!code) { // Only alert if it was a manual entry
        const data = await res.json();
        alert(data.message);
    }
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

function appendSystemMessage(text) {
    const div = document.createElement("div");
    div.style.cssText = `
        text-align: center;
        color: var(--text-dim);
        font-size: 0.75rem;
        margin: 10px 0;
        padding: 4px 12px;
        background: rgba(255,255,255,0.03);
        border-radius: 20px;
        display: inline-block;
        align-self: center;
        width: auto;
    `;
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text || !currentChannelId) return;

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

init();
