const app = require('./app');
const { initDb } = require('./db/database');

const PORT = process.env.PORT || 3000;

async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start();
