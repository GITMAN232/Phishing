const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbInstance = null;

async function getDb() {
    if (dbInstance) {
        return dbInstance;
    }

    dbInstance = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    // Performance optimizations
    await dbInstance.exec('PRAGMA journal_mode = WAL;');
    await dbInstance.exec('PRAGMA foreign_keys = ON;');

    // Schema Initialization
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            ipAddress TEXT,
            userAgent TEXT,
            status TEXT CHECK(status IN ('SUCCESS', 'FAILED')),
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_createdAt ON login_attempts(createdAt DESC);
        CREATE INDEX IF NOT EXISTS idx_status ON login_attempts(status);
    `);

    return dbInstance;
}

module.exports = { getDb };
