const { initDb } = require('./database');

async function seed() {
    const db = await initDb();

    await db.exec(`
        INSERT OR IGNORE INTO users (email, password_hash, username)
        VALUES ('seed@nocturne.com', 'seed_hash', 'nocturne_admin');
    `);

    await db.exec(`
        INSERT INTO spots (user_id, title, description, latitude, longitude) VALUES
        (1, 'N Seoul Tower', 'Iconic tower offering panoramic night views over Seoul', 37.5512, 126.9882),
        (1, 'Namsan Park', 'Scenic hillside park with stunning city light views', 37.5498, 126.9907),
        (1, 'Hangang Park Yeouido', 'Riverside park perfect for night picnics with city skyline', 37.5285, 126.9326),
        (1, 'Inwangsan Jahamun Tunnel Viewpoint', 'Famous hillside spot overlooking Seoul''s glittering nightscape', 37.5894, 126.9568),
        (1, 'Naksan Park', 'Hilltop park along the old Seoul fortress wall with city views', 37.5796, 127.0056),
        (1, 'Busan Diamond Bridge', 'Iconic suspension bridge illuminated brilliantly at night', 35.0690, 128.9780),
        (1, 'Gwangan Bridge Viewpoint', 'Best spot to view the iconic Gwangan Bridge light show', 35.1530, 129.1185),
        (1, 'Incheon Songdo Central Park', 'Modern waterfront park with dazzling smart city night lights', 37.3927, 126.6428),
        (1, 'Jeonju Hanok Village', 'Traditional hanok village glowing warmly under lantern lights', 35.8151, 127.1530),
        (1, 'Cheonggyecheon Stream', 'Urban stream lined with colorful light installations at night', 37.5697, 126.9794)
    `);

    console.log('✅ Seed complete!');
}

seed();