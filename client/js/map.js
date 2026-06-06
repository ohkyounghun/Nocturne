import { getAllSpots } from './api.js';
import { updateAuthNav, logout } from './utils.js';

// Initialize map
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 8
    };
    return new kakao.maps.Map(container, options);
}

// Render spot cards below map
function renderCards(spots) {
    const list = document.getElementById('spot-list');
    list.innerHTML = '';

    spots.forEach(spot => {
        const li = document.createElement('li');
        li.className = 'spot-card';
        li.textContent = spot.title;
        li.addEventListener('click', () => {
            window.location.href = `detail.html?id=${spot.id}`;
        });
        list.appendChild(li);
    });
}

let allSpots = [];
let markers = [];

// Render spot pins on map
function renderPins(map, spots) {
    markers.forEach(m => m.setMap(null));
    markers = [];

    spots.forEach(spot => {
        const position = new kakao.maps.LatLng(spot.latitude, spot.longitude);
        const marker = new kakao.maps.Marker({ map, position });

        kakao.maps.event.addListener(marker, 'click', () => {
            window.location.href = `detail.html?id=${spot.id}`;
        });

        markers.push(marker);
    });
}

function applyFilter(map, season) {
    const filtered = season === 'all'
        ? allSpots
        : allSpots.filter(s => s.season_tag === season || s.season_tag === 'all');
    renderPins(map, filtered);
    renderCards(filtered.slice(0, 10));
}

// Entry point
updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);

// Show "Post Spot" button in filter bar only when logged in
if (localStorage.getItem('token')) {
    document.getElementById('btn-post-spot')?.classList.remove('hidden');
}

const map = initMap();

getAllSpots().then(spots => {
    allSpots = spots;
    renderPins(map, allSpots);
    renderCards(allSpots.slice(0, 10));

    document.querySelectorAll('.filter-btn[data-season]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn[data-season]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(map, btn.dataset.season);
        });
    });
});
