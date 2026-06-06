import { createSpot } from './api.js';
import { showError, showSuccess } from './utils.js';

// Redirect to login if not authenticated
if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const submitForm = document.getElementById('submit-form');

submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;

    // tags: "night, view" → ['night', 'view']
    const tags = document.getElementById('tags').value
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

    try {
        const spot = await createSpot({
            title,
            description,
            latitude: Number(latitude),
            longitude: Number(longitude),
            tags
        });

        showSuccess(submitForm, 'Spot submitted successfully!');

        // redirect to the new spot's detail page after a short delay
        setTimeout(() => {
            window.location.href = `detail.html?id=${spot.id}`;
        }, 800);

    } catch (err) {
        showError(submitForm, err.message);
    }
});
