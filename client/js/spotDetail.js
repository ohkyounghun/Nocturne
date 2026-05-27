import { getSpot, getComments } from './api.js';

// Get spot ID from URL query string
// e.g. detail.html?id=1 → spotId = 1
const params = new URLSearchParams(window.location.search);
const spotId = params.get('id');

// Render spot info
async function renderSpot() {
    const spot = await getSpot(spotId);

    // filled by JS — never use innerHTML (XSS prevention)
    document.getElementById('spot-title').textContent = spot.title;
    document.getElementById('spot-description').textContent = spot.description;
    document.getElementById('spot-season').textContent = spot.season_tag;
    document.getElementById('spot-weather').textContent = spot.weather_tag;
    document.getElementById('spot-likes').textContent = `${spot.like_count} Likes`;
    document.getElementById('spot-comments').textContent = `${spot.comment_count} Comments`;

    // image
    if (spot.image_url) {
        document.getElementById('spot-image').src = spot.image_url;
    }
}

// Render comments
async function renderComments() {
    const comments = await getComments(spotId);
    const list = document.getElementById('comment-list');
    list.innerHTML = '';

    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment-item';
        li.textContent = `${comment.username}: ${comment.content}`;
        list.appendChild(li);
    });
}

// Entry point
renderSpot();
renderComments();