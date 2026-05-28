const express = require("express");
const router = express.Router();

const DailyStat = require("../models/DailyStat");
router.post("/reset", async (req, res) => {
    await DailyStat.deleteMany({});
    
    await DailyStat.insertMany([
        {
        date: "2026-05-18",
        units: [
            {
            unitName: "Napostella",
            meals: [
                { type: "puuro", count: 6},
                { type: "lounas", count: 4},
            ],
            },
        ],
        },
        {
        date: "2025-05-18",
        units: [
            {
            unitName: "Napostella",
            meals: [
                { type: "puuro", count: 10},
                { type: "lounas", count: 8},
            ],
            },
        ],
        },
        
    ],{ ordered: true });
    await DailyStat.syncIndexes();
    const count = await DailyStat.countDocuments();
    res.status(204).end();
});

module.exports = router;