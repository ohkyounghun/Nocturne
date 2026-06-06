import { createSpot, uploadPhoto } from './api.js';
import { showError } from './utils.js';

if (!localStorage.getItem('token')) {
    window.location.replace = 'login.html';
}

const form = document.getElementById('post-form');
const locationDisplay = document.getElementById('location-display');
const btnMyLocation = document.getElementById('btn-my-location');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photo-preview');
const fileNameEl = document.getElementById('file-name');

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

// ── Photo preview ─────────────────────────────────────────────
photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    fileNameEl.textContent = file.name;
    photoPreview.src = URL.createObjectURL(file);
    photoPreview.classList.remove('hidden');
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

        const file = photoInput.files[0];
        if (file) {
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
