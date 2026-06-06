import { register } from './api.js';
import { showError } from './utils.js';

// Handle register form submit
const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    // check password match
    if (password !== passwordConfirm) {
        showError(registerForm, 'Passwords do not match');
        return;
    }

    try {
        await register(email, password, username);

        // redirect to login page after successful register
        window.location.href = 'login.html';

    } catch (err) {
        showError(registerForm, err.message);
    }
});