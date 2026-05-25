import { getSpots } from './api.js';

// Initialize map
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 8
    };
    return new kakao.maps.Map(container, options);
}

// Render spot pins on map
async function renderPins(map) {
    const spots = await getSpots();

    spots.forEach(spot => {
        const position = new kakao.maps.LatLng(spot.latitude, spot.longitude);

        const marker = new kakao.maps.Marker({ map, position });

        // click marker → go to detail page
        kakao.maps.event.addListener(marker, 'click', () => {
            window.location.href = `detail.html?id=${spot.id}`;
        });
    });
}

// Entry point
const map = initMap();
renderPins(map);