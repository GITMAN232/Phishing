const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const LoginAttempt = require("../models/LoginAttempt");

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Bearer <token>
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
        const logs = await LoginAttempt.find().sort({ createdAt: -1 });
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
        const totalAttempts = await LoginAttempt.countDocuments();
        
        // Group by day for simple trend chart
        const dailyStats = await LoginAttempt.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date ascending
        ]);

        res.json({
            totalAttempts,
            dailyStats: dailyStats.map(stat => ({
                date: stat._id,
                attempts: stat.count
            }))
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
