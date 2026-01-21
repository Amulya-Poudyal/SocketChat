const token = localStorage.getItem("token");

if (!token) {
    location.href = "login.html";
}

async function loadAdminData() {
    try {
        const res = await fetch("/channels/admin/all", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!res.ok) {
            const data = await res.json();
            alert(data.message || "Unauthorized");
            location.href = "chat.html";
            return;
        }

        const channels = await res.json();
        const tbody = document.getElementById("adminChannelList");
        tbody.innerHTML = "";

        channels.forEach(ch => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight: 600;"># ${ch.name}</td>
                <td>${ch.owner ? ch.owner.username : 'Unknown'}</td>
                <td>${ch.members.length}</td>
                <td><span class="badge ${ch.isPrivate ? 'badge-private' : 'badge-public'}">${ch.isPrivate ? 'Private' : 'Public'}</span></td>
                <td><code style="background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 3px;">${ch.inviteCode}</code></td>
                <td>${new Date(ch.createdAt).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Error loading admin data:", err);
    }
}

loadAdminData();
