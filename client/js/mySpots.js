import { getMySpots, updateSpot, deleteSpot, uploadPhoto } from './api.js';
import { updateAuthNav, logout } from './utils.js';

updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);

if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const list = document.getElementById('my-spot-list');
const countEl = document.getElementById('spot-count');

const SEASONS = ['all', 'spring', 'summer', 'autumn', 'winter'];
const WEATHERS = ['clear', 'cloudy', 'rainy', 'snowy'];

// Escape user-supplied values before inserting into innerHTML (XSS prevention)
function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function tagBtns(values, current, groupClass) {
    return values.map(v =>
        `<button type="button" class="tag-btn ${groupClass} ${v === current ? 'active' : ''}" data-value="${v}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`
    ).join('');
}

function renderCard(spot) {
    const li = document.createElement('li');
    li.className = 'my-spot-card';
    li.dataset.id = spot.id;
    li.innerHTML = `
        <div class="my-spot-view">
            ${spot.image_url ? `<div class="my-spot-img-wrap"><img class="spot-card-img" src="${encodeURI(spot.image_url)}" alt="${escapeHtml(spot.title)}"></div>` : ''}
            <div class="my-spot-info">
                <a href="detail.html?id=${Number(spot.id)}" class="my-spot-title">${escapeHtml(spot.title)}</a>
                <p class="my-spot-meta">
                    <span class="tag">${escapeHtml(spot.season_tag ?? '—')}</span>
                    <span class="tag">${escapeHtml(spot.weather_tag ?? '—')}</span>
                    <span class="my-spot-counts">♥ ${Number(spot.like_count ?? 0)} &nbsp; 💬 ${Number(spot.comment_count ?? 0)}</span>
                </p>
            </div>
            <div class="my-spot-actions">
                <button class="btn-edit" data-id="${spot.id}">Edit</button>
                <button class="btn-delete" data-id="${spot.id}">Delete</button>
            </div>
        </div>
        <form class="my-spot-edit hidden" data-id="${spot.id}">
            <div class="form-field">
                <label>Title</label>
                <input type="text" name="title" value="${escapeHtml(spot.title)}" required>
            </div>
            <div class="form-field">
                <label>Description</label>
                <textarea name="description" rows="3">${escapeHtml(spot.description ?? '')}</textarea>
            </div>
            <div class="form-field">
                <label>Season</label>
                <div class="tag-group edit-season-group">${tagBtns(SEASONS, spot.season_tag, 'season-opt')}</div>
            </div>
            <div class="form-field">
                <label>Weather</label>
                <div class="tag-group edit-weather-group">${tagBtns(WEATHERS, spot.weather_tag, 'weather-opt')}</div>
            </div>
            <div class="form-field">
                <label>Photo <span style="font-size:0.78rem;color:#666680;">Optional · replace current image</span></label>
                <label class="file-label" style="display:inline-block;">
                    <span class="edit-file-name">Choose image…</span>
                    <input type="file" name="photo" accept="image/*" style="display:none;">
                </label>
                <img class="edit-photo-preview hidden" style="margin-top:8px;max-height:120px;border-radius:6px;" alt="preview">
            </div>
            <div class="edit-actions">
                <button type="submit" class="btn-save">Save</button>
                <button type="button" class="btn-cancel">Cancel</button>
            </div>
            <p class="edit-error" style="color:#ff6b6b;font-size:0.85rem;margin-top:6px;"></p>
        </form>
    `;

    // Edit toggle
    li.querySelector('.btn-edit').addEventListener('click', () => {
        li.querySelector('.my-spot-view').classList.add('hidden');
        li.querySelector('.my-spot-edit').classList.remove('hidden');
    });

    // Cancel
    li.querySelector('.btn-cancel').addEventListener('click', () => {
        li.querySelector('.my-spot-view').classList.remove('hidden');
        li.querySelector('.my-spot-edit').classList.add('hidden');
    });

    // Photo preview in edit form
    const photoInput = li.querySelector('input[name="photo"]');
    const photoPreview = li.querySelector('.edit-photo-preview');
    const fileNameEl = li.querySelector('.edit-file-name');
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (!file) return;
        fileNameEl.textContent = file.name;
        photoPreview.src = URL.createObjectURL(file);
        photoPreview.classList.remove('hidden');
    });

    // Tag toggle in edit form
    li.querySelectorAll('.edit-season-group .season-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            li.querySelectorAll('.edit-season-group .season-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    li.querySelectorAll('.edit-weather-group .weather-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            li.querySelectorAll('.edit-weather-group .weather-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Save
    li.querySelector('.my-spot-edit').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const errorEl = form.querySelector('.edit-error');
        const saveBtn = form.querySelector('.btn-save');
        const title = form.querySelector('input[name="title"]').value.trim();
        const description = form.querySelector('textarea[name="description"]').value.trim();
        const seasonTag = form.querySelector('.season-opt.active')?.dataset.value || 'all';
        const weatherTag = form.querySelector('.weather-opt.active')?.dataset.value || 'clear';

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving…';
        try {
            const updated = await updateSpot(spot.id, { title, description, seasonTag, weatherTag });
            const file = form.querySelector('input[name="photo"]').files[0];
            if (file) {
                const fd = new FormData();
                fd.append('photo', file);
                await uploadPhoto(spot.id, fd);
                const fresh = await (await fetch(`/api/spots/${spot.id}`)).json();
                li.replaceWith(renderCard(fresh));
            } else {
                li.replaceWith(renderCard(updated));
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Failed to save.';
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    });

    // Delete
    li.querySelector('.btn-delete').addEventListener('click', async () => {
        if (!confirm(`Delete "${spot.title}"?`)) return;
        try {
            await deleteSpot(spot.id);
            li.remove();
            const remaining = list.querySelectorAll('li').length;
            countEl.textContent = `${remaining} spot${remaining !== 1 ? 's' : ''}`;
        } catch (err) {
            alert(err.message || 'Failed to delete.');
        }
    });

    return li;
}

async function load() {
    try {
        const spots = await getMySpots();
        countEl.textContent = `${spots.length} spot${spots.length !== 1 ? 's' : ''}`;
        if (spots.length === 0) {
            list.innerHTML = '<li style="color:#666680;padding:16px 0;">No spots posted yet.</li>';
            return;
        }
        spots.forEach(s => list.appendChild(renderCard(s)));
    } catch (err) {
        list.innerHTML = `<li style="color:#ff6b6b;">${err.message}</li>`;
    }
}

load();
