const API_URL = ""; // Use relative URLs since frontend is served by backend

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        alert(message);
    }
}
