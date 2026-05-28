import { login } from './api.js';

// Handle login form submit
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const data = await login(email, password);

        // store JWT token in localStorage
        localStorage.setItem('token', data.token);

        // redirect to main page
        window.location.href = 'index.html';

    } catch (err) {
        // show error message
        showError(err.message);
    }
});

// Show error message
function showError(message) {
    let errorEl = document.getElementById('error-message');

    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'error-message';
        errorEl.style.color = '#ff6b6b';
        errorEl.style.fontSize = '0.85rem';
        errorEl.style.marginTop = '8px';
        loginForm.appendChild(errorEl);
    }

    errorEl.textContent = message;
}