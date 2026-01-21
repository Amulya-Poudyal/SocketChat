const API_URL = `${window.location.protocol}//${window.location.hostname}:3000`;

function showError(message) {
    const errorDiv = document.getElementById('error');
    if (errorDiv) {
        errorDiv.textContent = message;
    } else {
        alert(message);
    }
}
