import { getMyBookmarks } from './api.js';
import { updateAuthNav, logout } from './utils.js';

// Check if logged in — redirect to login if not
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

async function renderBookmarks() {
    const bookmarks = await getMyBookmarks();
    const list = document.getElementById('bookmark-list');
    const count = document.getElementById('bookmark-count');

    // filled by JS — never use innerHTML (XSS prevention)
    count.textContent = `${bookmarks.length} saved spots`;
    list.replaceChildren();

    if (bookmarks.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No bookmarks yet.';
        list.appendChild(li);
        return;
    }

    bookmarks.forEach(bookmark => {
        const li = document.createElement('li');
        li.className = 'spot-card';
        li.textContent = bookmark.title;
        li.addEventListener('click', () => {
            window.location.href = `detail.html?id=${bookmark.spot_id}`;
        });
        list.appendChild(li);
    });
}

// Entry point
updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);

renderBookmarks();
