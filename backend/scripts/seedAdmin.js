const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("../models/Admin");

const seedAdmin = async () => {
    try {
        console.log("Connecting to MongoDB:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        
        const email = process.argv[2] || "admin@example.com";
        const passwordPlain = process.argv[3] || "password123";

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log(`Admin with email ${email} already exists.`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(passwordPlain, salt);

        const admin = new Admin({
            email,
            password: passwordHash
        });

        await admin.save();
        console.log(`Admin seeded successfully! Email: ${email}, Password: ${passwordPlain}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err);
        process.exit(1);
    }
};

seedAdmin();
