import { getSpot, likeSpot, unlikeSpot } from './api.js';
import { updateAuthNav, logout } from './utils.js';
import { initCommentThread } from './commentThread.js';

// Get spot ID from URL query string
// e.g. detail.html?id=1 → spotId = 1
const params = new URLSearchParams(window.location.search);
const spotId = params.get('id');

// like state
let isLiked = false;
let likeCount = 0;

async function renderSpot() {
    const spot = await getSpot(spotId);

    // filled by JS — never use innerHTML (XSS prevention)
    document.getElementById('spot-title').textContent = spot.title;
    document.getElementById('spot-description').textContent = spot.description ?? '';
    document.getElementById('spot-season').textContent = spot.season_tag ?? '-';
    document.getElementById('spot-weather').textContent = spot.weather_tag ?? '-';
    document.getElementById('spot-comments').textContent = `${spot.comment_count ?? 0} Comments`;

    // set initial like count
    likeCount = spot.like_count ?? 0;
    updateLikeButton();

    // image
    if (spot.image_url) {
        document.getElementById('spot-image').src = spot.image_url;
    }
}

function updateLikeButton() {
    const btn = document.getElementById('btn-like');
    btn.textContent = isLiked ? `♥ ${likeCount} Liked` : `♡ ${likeCount} Like`;
    btn.style.borderColor = isLiked ? '#c9a84c' : '';
    btn.style.color = isLiked ? '#c9a84c' : '';
}

document.getElementById('btn-like').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
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

// Entry point
updateAuthNav();
document.getElementById('nav-logout').addEventListener('click', logout);
renderSpot();
initCommentThread();