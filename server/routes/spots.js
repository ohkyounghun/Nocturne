const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json([
        { id: 1, title: 'seoultech', latitude: 37.55, longitude: 126.98 },
        { id: 2, title: 'boongabang', latitude: 34.55, longitude: 132.98 }
    ])
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const numId = parseInt(id);
    if (numId > 3) {
        return res.status(404).json({ code: 'NOT_FOUND', message: 'Spot not found' });
    }
    // Simulate fetching a spot by ID
    res.json({ id: numId, title: 'spot name', latitude: 37.55, longitude: 126.98 });
});


module.exports = router;