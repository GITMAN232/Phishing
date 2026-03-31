const mongoose = require("mongoose");

const LoginAttemptSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["success", "failed"],
        default: "success"
    }
}, { timestamps: true });

module.exports = mongoose.model("LoginAttempt", LoginAttemptSchema);
