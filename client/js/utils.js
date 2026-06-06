// Show error message below a form
export function showError(formEl, message) {
    let errorEl = document.getElementById('error-message');

    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'error-message';
        errorEl.style.color = '#ff6b6b';
        errorEl.style.fontSize = '0.85rem';
        errorEl.style.marginTop = '8px';
        formEl.appendChild(errorEl);
    }

    errorEl.textContent = message;
}

// Show success message below a form
export function showSuccess(formEl, message) {
    let successEl = document.getElementById('success-message');

    if (!successEl) {
        successEl = document.createElement('p');
        successEl.id = 'success-message';
        successEl.style.color = '#6bce8f';
        successEl.style.fontSize = '0.85rem';
        successEl.style.marginTop = '8px';
        formEl.appendChild(successEl);
    }

    successEl.textContent = message;
}

// Update nav based on login state
// call this on every page load
export function updateAuthNav() {
    const token = localStorage.getItem('token');

    const navLogin = document.getElementById('nav-login');
    const navRegister = document.getElementById('nav-register');
    const navBookmarks = document.getElementById('nav-bookmarks');
    const navSubmit = document.getElementById('nav-submit');
    const navLogout = document.getElementById('nav-logout');

    if (token) {
        // logged in
        if (navLogin) navLogin.classList.add('hidden');
        if (navRegister) navRegister.classList.add('hidden');
        if (navBookmarks) navBookmarks.classList.remove('hidden');
        if (navSubmit) navSubmit.classList.remove('hidden');
        if (navLogout) navLogout.classList.remove('hidden');
    } else {
        // logged out
        if (navLogin) navLogin.classList.remove('hidden');
        if (navRegister) navRegister.classList.add('hidden');
        if (navBookmarks) navBookmarks.classList.add('hidden');
        if (navSubmit) navSubmit.classList.add('hidden');
        if (navLogout) navLogout.classList.add('hidden');
    }
}

// Logout — clear token and redirect to index
export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}