import { createSpot, uploadPhoto } from './api.js';
import { showError } from './utils.js';

if (!localStorage.getItem('token')) {
    window.location.replace('login.html');
}

const form = document.getElementById('post-form');
const locationDisplay = document.getElementById('location-display');
const btnMyLocation = document.getElementById('btn-my-location');
const photoInput = document.getElementById('photo');
const photoPreviewGrid = document.getElementById('photo-preview-grid');
const photoCount = document.getElementById('photo-count');

let selectedFiles = [];

let selectedLat = null;
let selectedLng = null;
let marker = null;

// ── Map ──────────────────────────────────────────────────────
const map = new kakao.maps.Map(document.getElementById('pick-map'), {
    center: new kakao.maps.LatLng(37.5665, 126.9780),
    level: 5,
});

kakao.maps.event.addListener(map, 'click', (e) => {
    const latlng = e.latLng;
    selectedLat = latlng.getLat();
    selectedLng = latlng.getLng();
    placeMarker(latlng);
    locationDisplay.textContent = `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`;
});

function placeMarker(latlng) {
    if (marker) marker.setMap(null);
    marker = new kakao.maps.Marker({ position: latlng, map });
}

// ── My Location ──────────────────────────────────────────────
btnMyLocation.addEventListener('click', () => {
    if (!navigator.geolocation) return;
    btnMyLocation.disabled = true;
    navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
            const latlng = new kakao.maps.LatLng(coords.latitude, coords.longitude);
            map.setCenter(latlng);
            selectedLat = coords.latitude;
            selectedLng = coords.longitude;
            placeMarker(latlng);
            locationDisplay.textContent = `${selectedLat.toFixed(5)}, ${selectedLng.toFixed(5)}`;
            btnMyLocation.disabled = false;
        },
        () => { btnMyLocation.disabled = false; }
    );
});

// ── Tag buttons ───────────────────────────────────────────────
function setupTagGroup(groupId) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}
setupTagGroup('season-group');
setupTagGroup('weather-group');

function updatePhotoCount() {
    photoCount.textContent = selectedFiles.length > 0 ? `${selectedFiles.length} photo(s) selected` : '';
}

function addPreviewItem(file) {
    const wrap = document.createElement('div');
    wrap.className = 'photo-preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'photo-preview-remove';
    remove.textContent = '×';
    remove.addEventListener('click', () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        wrap.remove();
        updatePhotoCount();
    });

    wrap.appendChild(img);
    wrap.appendChild(remove);
    photoPreviewGrid.appendChild(wrap);
}

// ── Photo preview ─────────────────────────────────────────────
photoInput.addEventListener('change', () => {
    const newFiles = Array.from(photoInput.files);
    photoInput.value = '';

    const oversized = newFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
        showError(form, `${oversized.map(f => f.name).join(', ')}: each photo must be under 5 MB.`);
        return;
    }
    if (selectedFiles.length + newFiles.length > 10) {
        showError(form, `Maximum 10 photos. You have ${selectedFiles.length} selected.`);
        return;
    }

    newFiles.forEach(file => {
        selectedFiles.push(file);
        addPreviewItem(file);
    });
    updatePhotoCount();
});

// ── Form submit ───────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    if (selectedLat === null || selectedLng === null) {
        showError(form, 'Please click on the map to select a location.');
        return;
    }

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const seasonTag = document.querySelector('#season-group .tag-btn.active')?.dataset.value || 'spring';
    const weatherTag = document.querySelector('#weather-group .tag-btn.active')?.dataset.value || 'clear';

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
            weatherTag,
        });

        for (const file of selectedFiles) {
            const fd = new FormData();
            fd.append('photo', file);
            await uploadPhoto(spot.id, fd);
        }

        window.location.href = `detail.html?id=${spot.id}`;
    } catch (err) {
        showError(form, err.message || 'An error occurred while posting.');
        btn.disabled = false;
        btn.textContent = 'Post Spot';
    }
});
