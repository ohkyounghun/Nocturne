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