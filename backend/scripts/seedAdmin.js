const bcrypt = require("bcryptjs");
const { getDb } = require("../database");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from parent directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const seedAdmin = async () => {
    try {
        const db = await getDb();
        
        const email = process.argv[2] || "admin@example.com";
        const passwordPlain = process.argv[3] || "password123";

        // Hash the admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordPlain, salt);

        // Explicitly check for an existing admin with the same email
        const existingAdmin = await db.get(`SELECT * FROM admins WHERE email = ?`, [email]);

        if (existingAdmin) {
            console.log(`Admin ${email} already exists. Updating password...`);
            await db.run(
                `UPDATE admins SET password = ? WHERE email = ?`,
                [hashedPassword, email]
            );
        } else {
            console.log(`Creating new Admin: ${email}`);
            await db.run(
                `INSERT INTO admins (email, password) VALUES (?, ?)`,
                [email, hashedPassword]
            );
        }

        console.log(`Admin seeded successfully! Email: ${email}, Password: ${passwordPlain}`);
        process.exit(0);
    } catch (err) {
        console.error("Error seeding admin:", err);
        process.exit(1);
    }
};

seedAdmin();
