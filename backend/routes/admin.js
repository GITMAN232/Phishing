const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { getDb } = require("../database");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const parts = token.split(" ");
        const decoded = jwt.verify(
            parts.length === 2 ? parts[1] : parts[0], 
            process.env.JWT_SECRET || "fallback_secret_key"
        );
        req.admin = decoded.admin;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// @route GET /api/admin/logs
// @desc Get all captured login attempts
router.get("/logs", authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const logs = await db.all(`SELECT * FROM login_attempts ORDER BY createdAt DESC`);
        res.json(logs);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route GET /api/admin/stats
// @desc Get login attempt stats for dashboard charts
router.get("/stats", authMiddleware, async (req, res) => {
    try {
        const db = await getDb();
        const { totalAttempts } = await db.get(`SELECT COUNT(*) as totalAttempts FROM login_attempts`);
        
        const dailyStats = await db.all(`
            SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as attempts 
            FROM login_attempts 
            GROUP BY date 
            ORDER BY date ASC
        `);

        res.json({
            totalAttempts: totalAttempts || 0,
            dailyStats: dailyStats.map(stat => ({
                date: stat.date,
                attempts: stat.attempts
            }))
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
