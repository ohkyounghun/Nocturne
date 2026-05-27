export const MOCK_SPOTS = [
    { id: 1, title: 'Namsan Tower', latitude: 37.5512, longitude: 126.9882, season_tag: 'spring', weather_tag: 'clear' },
    { id: 2, title: 'Hangang Park', latitude: 37.5285, longitude: 126.9733, season_tag: 'summer', weather_tag: 'clear' },
    { id: 3, title: 'Bugak Skyway', latitude: 37.6043, longitude: 126.9808, season_tag: 'autumn', weather_tag: 'clear' }
];

export const MOCK_SPOT_DETAIL = {
    id: 1, title: 'Namsan Tower', description: 'Best night view spot in Seoul',
    latitude: 37.5512, longitude: 126.9882,
    season_tag: 'spring', weather_tag: 'clear',
    like_count: 128, comment_count: 23
};

export const MOCK_COMMENTS = [
    { id: 1, username: 'user1', content: 'Amazing night view!', created_at: '2026-05-01' },
    { id: 2, username: 'user2', content: 'Cherry blossoms visible in spring', created_at: '2026-05-02' }
];

export const MOCK_BOOKMARKS = [
    { id: 1, title: 'Namsan Tower', season_tag: 'spring' },
    { id: 2, title: 'Hangang Park', season_tag: 'summer' }
];