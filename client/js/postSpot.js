import { createSpot, uploadPhoto } from './api.js';
import { updateAuthNav, logout } from './utils.js';
import { showError } from './utils.js';

if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);

// ── Map ────────────────────────────────────────────────────────────────
const map = new kakao.maps.Map(document.getElementById('pick-map'), {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 7
});

let selectedLat = null;
let selectedLng = null;
let marker = null;

function pinLocation(lat, lng) {
    selectedLat = lat;
    selectedLng = lng;
    const pos = new kakao.maps.LatLng(lat, lng);
    if (marker) marker.setMap(null);
    marker = new kakao.maps.Marker({ map, position: pos });
    map.panTo(pos);
    document.getElementById('location-display').textContent =
        `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

kakao.maps.event.addListener(map, 'click', (e) => {
    pinLocation(e.latLng.getLat(), e.latLng.getLng());
});

document.getElementById('btn-my-location').addEventListener('click', () => {
    if (!navigator.geolocation) return;
    const btn = document.getElementById('btn-my-location');
    btn.textContent = 'Locating…';
    btn.disabled = true;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            pinLocation(pos.coords.latitude, pos.coords.longitude);
            btn.textContent = 'Use My Location';
            btn.disabled = false;
        },
        () => {
            btn.textContent = 'Use My Location';
            btn.disabled = false;
        }
    );
});

// ── Tag buttons ────────────────────────────────────────────────────────
function initTagGroup(groupId) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

initTagGroup('season-group');
initTagGroup('weather-group');

function getSelectedTag(groupId) {
    return document.querySelector(`#${groupId} .tag-btn.active`)?.dataset.value ?? null;
}

// ── Photo preview ──────────────────────────────────────────────────────
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
const fileName = document.getElementById('file-name');

photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    fileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        photoPreview.src = e.target.result;
        photoPreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
});

// ── Form submit ────────────────────────────────────────────────────────
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (selectedLat === null || selectedLng === null) {
        showError(e.target, 'Please click the map to select a location.');
        return;
    }

    const title       = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const seasonTag   = getSelectedTag('season-group');
    const weatherTag  = getSelectedTag('weather-group');

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Posting…';

    try {
        const spot = await createSpot({
            title,
            description,
            latitude: selectedLat,
            longitude: selectedLng,
            seasonTag,
            weatherTag
        });

        const file = photoInput.files[0];
        if (file) {
            const fd = new FormData();
            fd.append('photo', file);
            await uploadPhoto(spot.id, fd);
        }

        window.location.href = `detail.html?id=${spot.id}`;
    } catch (err) {
        showError(e.target, err.message);
        btn.disabled = false;
        btn.textContent = 'Post Spot';
    }
});
