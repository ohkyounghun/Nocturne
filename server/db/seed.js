const { initDb } = require('./database');

async function seed() {
    const db = await initDb();

    await db.run(
        `INSERT OR IGNORE INTO users (email, password_hash, username) VALUES (?, ?, ?)`,
        ['seed@nocturne.com', 'seed_hash', 'nocturne_admin']
    );
    const { id: userId } = await db.get(`SELECT id FROM users WHERE email = ?`, ['seed@nocturne.com']);

    await db.run(`DELETE FROM comments  WHERE spot_id IN (SELECT id FROM spots WHERE user_id = ?)`, [userId]);
    await db.run(`DELETE FROM likes     WHERE spot_id IN (SELECT id FROM spots WHERE user_id = ?)`, [userId]);
    await db.run(`DELETE FROM bookmarks WHERE spot_id IN (SELECT id FROM spots WHERE user_id = ?)`, [userId]);
    await db.run(`DELETE FROM photos    WHERE spot_id IN (SELECT id FROM spots WHERE user_id = ?)`, [userId]);
    await db.run(`DELETE FROM spots WHERE user_id = ?`, [userId]);

    const spotsData = [
        [userId, 'N Seoul Tower',                  'Iconic tower offering panoramic night views over Seoul',           37.5512, 126.9882, 'all',    'clear'],
        [userId, 'Namsan Park',                    'Scenic hillside park with stunning city light views',             37.5498, 126.9907, 'spring', 'clear'],
        [userId, 'Hangang Park Yeouido',           'Riverside park perfect for night picnics with city skyline',      37.5285, 126.9326, 'summer', 'clear'],
        [userId, 'Inwangsan Jahamun Tunnel',       'Famous hillside spot overlooking Seoul\'s glittering nightscape', 37.5894, 126.9568, 'all',    'clear'],
        [userId, 'Naksan Park',                    'Hilltop park along the old Seoul fortress wall with city views',  37.5796, 127.0056, 'autumn', 'clear'],
        [userId, 'Busan Diamond Bridge',           'Iconic suspension bridge illuminated brilliantly at night',       35.0690, 128.9780, 'all',    'clear'],
        [userId, 'Gwangan Bridge Viewpoint',       'Best spot to view the iconic Gwangan Bridge light show',          35.1530, 129.1185, 'summer', 'clear'],
        [userId, 'Incheon Songdo Central Park',    'Modern waterfront park with dazzling smart city night lights',    37.3927, 126.6428, 'all',    'clear'],
        [userId, 'Jeonju Hanok Village',           'Traditional hanok village glowing warmly under lantern lights',   35.8151, 127.1530, 'winter', 'clear'],
        [userId, 'Cheonggyecheon Stream',          'Urban stream lined with colorful light installations at night',   37.5697, 126.9794, 'all',    'clear'],
    ];

    const seedImages = [
        'https://picsum.photos/seed/nseoul/800/600',
        'https://picsum.photos/seed/namsan/800/600',
        'https://picsum.photos/seed/hangang/800/600',
        'https://picsum.photos/seed/inwang/800/600',
        'https://picsum.photos/seed/naksan/800/600',
        'https://picsum.photos/seed/diamond/800/600',
        'https://picsum.photos/seed/gwangan/800/600',
        'https://picsum.photos/seed/songdo/800/600',
        'https://picsum.photos/seed/jeonju/800/600',
        'https://picsum.photos/seed/cheong/800/600',
    ];

    for (let i = 0; i < spotsData.length; i++) {
        const result = await db.run(
            `INSERT INTO spots (user_id, title, description, latitude, longitude, season_tag, weather_tag) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            spotsData[i]
        );
        await db.run(
            `INSERT INTO photos (spot_id, user_id, url) VALUES (?, ?, ?)`,
            [result.lastID, userId, seedImages[i]]
        );
    }

    console.log('✅ Seed complete!');
}

seed();
