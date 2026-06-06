import { login } from './api.js';
import { showError } from './utils.js';

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
        showError(loginForm, err.message);
    }
});