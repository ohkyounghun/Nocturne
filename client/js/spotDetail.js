import {
    bookmarkSpot,
    deleteSpot,
    getMyBookmarks,
    getSpot,
    likeSpot,
    unlikeSpot,
    unbookmarkSpot
} from './api.js';
import { updateAuthNav, logout } from './utils.js';
import { initCommentThread } from './commentThread.js';
import { KAKAO_MAP_KEY } from './config.js';

function loadKakaoSDK() {
    return new Promise((resolve) => {
        if (window.kakao?.maps?.services) { resolve(); return; }
        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false&libraries=services`;
        script.onload = () => kakao.maps.load(resolve);
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

const params = new URLSearchParams(window.location.search);
const spotId = params.get('id');

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

    reverseGeocode(spot.latitude, spot.longitude).then((address) => {
        if (address) document.getElementById('spot-address').textContent = '📍 ' + address;
    });

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
loadBookmarkState().catch((err) => {
    console.error('Bookmark state failed:', err.message);
});
initCommentThread();
