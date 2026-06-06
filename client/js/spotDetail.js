import {
    bookmarkSpot,
    deleteSpot,
    getMyBookmarks,
    getMyLikes,
    getSpot,
    likeSpot,
    unlikeSpot,
    unbookmarkSpot
} from './api.js';
import { updateAuthNav, logout } from './utils.js';
import { initCommentThread } from './commentThread.js';
import { KAKAO_MAP_KEY } from './config.js';

function loadKakaoSDK() {
    return new Promise((resolve, reject) => {
        if (window.kakao?.maps?.services) { resolve(); return; }
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
        script.onload = () => kakao.maps.load(resolve);
        script.onerror = () => reject(new Error('Kakao Maps SDK failed to load'));
        document.head.appendChild(script);
    });
}

async function reverseGeocode(lat, lng) {
    await loadKakaoSDK();
    return new Promise((resolve) => {
        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(lng, lat, (result, status) => {
            if (status !== kakao.maps.services.Status.OK) { resolve(''); return; }
            resolve(result[0].road_address?.address_name || result[0].address?.address_name || '');
        });
    });
}

async function renderLocation(lat, lng) {
    const latitude = Number(lat);
    const longitude = Number(lng);
    const addressElement = document.getElementById('spot-address');

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        addressElement.textContent = 'Location unavailable';
        return;
    }

    // 주소 API가 실패해도 저장된 좌표는 항상 사용자에게 보여준다.
    // Always show stored coordinates even if reverse geocoding fails.
    addressElement.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

    try {
        await loadKakaoSDK();

        const position = new kakao.maps.LatLng(latitude, longitude);
        const map = new kakao.maps.Map(
            document.getElementById('spot-map'),
            { center: position, level: 4 }
        );
        new kakao.maps.Marker({ map, position });

        const address = await reverseGeocode(latitude, longitude);
        if (address) {
            addressElement.textContent = address;
        }
    } catch (error) {
        console.error('Location rendering failed:', error.message);
    }
}

const params = new URLSearchParams(window.location.search);
const spotId = params.get('id');

if (!spotId) {
    window.location.href = 'index.html';
}

let isLiked = false;
let likeCount = 0;
let isBookmarked = false;

function getCurrentUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=');
        return Number(JSON.parse(atob(padded)).sub);
    } catch {
        return null;
    }
}

async function renderSpot() {
    const spot = await getSpot(spotId);

    document.getElementById('spot-title').textContent = spot.title;
    document.getElementById('spot-description').textContent = spot.description ?? '';
    document.getElementById('spot-season').textContent = spot.season_tag ?? '-';
    document.getElementById('spot-weather').textContent = spot.weather_tag ?? '-';
    document.getElementById('spot-comments').textContent = `${spot.comment_count ?? 0} Comments`;

    likeCount = spot.like_count ?? 0;
    updateLikeButton();

    if (spot.image_url) {
        document.getElementById('spot-image').src = spot.image_url;
    }

    await renderLocation(spot.latitude, spot.longitude);

    // show delete button only to the spot owner
    if (getCurrentUserId() === spot.user_id) {
        document.getElementById('btn-delete-spot').classList.remove('hidden');
    }
}

function updateLikeButton() {
    const btn = document.getElementById('btn-like');
    btn.textContent = isLiked ? `♥ ${likeCount} Liked` : `♡ ${likeCount} Like`;
    btn.style.borderColor = isLiked ? '#c9a84c' : '';
    btn.style.color = isLiked ? '#c9a84c' : '';
}

function updateBookmarkButton() {
    const btn = document.getElementById('btn-bookmark');
    btn.textContent = isBookmarked ? 'Bookmarked' : 'Bookmark';
    btn.style.borderColor = isBookmarked ? '#c9a84c' : '';
    btn.style.color = isBookmarked ? '#c9a84c' : '';
}

async function loadLikeState() {
    if (!localStorage.getItem('token')) return;
    const likes = await getMyLikes();
    isLiked = likes.some((like) => Number(like.spot_id) === Number(spotId));
    updateLikeButton();
}

async function loadBookmarkState() {
    if (!localStorage.getItem('token')) {
        updateBookmarkButton();
        return;
    }
    const bookmarks = await getMyBookmarks();
    isBookmarked = bookmarks.some(
        (bookmark) => Number(bookmark.spot_id) === Number(spotId)
    );
    updateBookmarkButton();
}

document.getElementById('btn-like').addEventListener('click', async () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }
    try {
        if (isLiked) {
            await unlikeSpot(spotId);
            likeCount--;
            isLiked = false;
        } else {
            await likeSpot(spotId);
            likeCount++;
            isLiked = true;
        }
        updateLikeButton();
    } catch (err) {
        console.error('Like toggle failed:', err.message);
    }
});

document.getElementById('btn-bookmark').addEventListener('click', async () => {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
        return;
    }

    try {
        if (isBookmarked) {
            await unbookmarkSpot(spotId);
            isBookmarked = false;
        } else {
            await bookmarkSpot(spotId);
            isBookmarked = true;
        }
        updateBookmarkButton();
    } catch (err) {
        console.error('Bookmark toggle failed:', err.message);
    }
});

document.getElementById('btn-delete-spot').addEventListener('click', async () => {
    if (!confirm('Delete this spot?')) return;
    try {
        await deleteSpot(spotId);
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Delete failed:', err.message);
    }
});

updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);
renderSpot();
loadLikeState().catch((err) => console.error('Like state failed:', err.message));
loadBookmarkState().catch((err) => console.error('Bookmark state failed:', err.message));
initCommentThread();
