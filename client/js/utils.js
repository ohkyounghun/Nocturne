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