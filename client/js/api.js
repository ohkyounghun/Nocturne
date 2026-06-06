import { MOCK_SPOTS, MOCK_SPOT_DETAIL, MOCK_BOOKMARKS } from './mock.js';

const BASE_URL = 'http://localhost:3000';
const USE_MOCK = false;
// USE_MOCK = true  →  mock data (no backend needed)
// USE_MOCK = false →  real backend (http://localhost:3000)

// Auth header — auto-inject JWT token if logged in
function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Core fetch wrapper
async function request(method, path, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...authHeader()
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(BASE_URL + path, options);
    // Do not parse 204 responses because they intentionally have no body.
    const data = response.status === 204 ? null : await response.json();

    if (!response.ok) throw new Error(data?.message || 'Request failed');
    return data;
}

// Spots
export function getSpots() {
    if (USE_MOCK) return Promise.resolve(MOCK_SPOTS);
    return request('GET', '/api/spots');
}

export function getSpot(id) {
    if (USE_MOCK) return Promise.resolve(MOCK_SPOT_DETAIL);
    return request('GET', `/api/spots/${id}`);
}

export function createSpot({ title, description, latitude, longitude, seasonTag, weatherTag }) {
    return request('POST', '/api/spots', { title, description, latitude, longitude, seasonTag, weatherTag });
}

export function deleteSpot(id) {
    return request('DELETE', `/api/spots/${id}`);
}

export async function uploadPhoto(spotId, formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/api/spots/${spotId}/photos`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Photo upload failed');
    return data;
}

// Comments
export function getComments(id) {
    return request('GET', `/api/spots/${id}/comments`);
}

export function postComment(id, content) {
    return request('POST', `/api/spots/${id}/comments`, { content });
}

export function deleteComment(spotId, commentId) {
    return request('DELETE', `/api/spots/${spotId}/comments/${commentId}`);
}

// Likes
export function likeSpot(id) {
    return request('POST', `/api/spots/${id}/likes`);
}

export function unlikeSpot(id) {
    return request('DELETE', `/api/spots/${id}/likes`);
}

export function getMyLikes() {
    return request('GET', '/api/users/me/likes');
}

// Bookmarks
export function bookmarkSpot(id) {
    return request('POST', `/api/spots/${id}/bookmarks`);
}

export function unbookmarkSpot(id) {
    return request('DELETE', `/api/spots/${id}/bookmarks`);
}

export function getMyBookmarks() {
    if (USE_MOCK) return Promise.resolve(MOCK_BOOKMARKS);
    return request('GET', '/api/users/me/bookmarks');
}

// Auth
export function login(email, password) {
    return request('POST', '/api/auth/login', { email, password });
}

export function register(email, password, username) {
    return request('POST', '/api/auth/register', { email, password, username });
}
