function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    if (errorDiv) errorDiv.textContent = '';

    if (!username || !password) {
        showError("Both fields are required");
        return;
    }

    fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");
            return data;
        })
        .then(data => {
            alert("Registered successfully! Login now.");
            location.href = "login.html";
        })
        .catch(err => showError(err.message));
}

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerUser();
});
