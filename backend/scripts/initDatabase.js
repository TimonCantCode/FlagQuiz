const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, '../database/flagquiz.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error creating database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database for initialization');
});

// Initialize all tables
function initializeDatabase() {
    const tables = [
        {
            name: 'users',
            sql: `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME,
                    is_active BOOLEAN DEFAULT 1
                )
            `
        },
        {
            name: 'user_stats',
            sql: `
                CREATE TABLE IF NOT EXISTS user_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    quiz_attempts INTEGER DEFAULT 0,
                    best_score INTEGER DEFAULT 0,
                    total_score INTEGER DEFAULT 0,
                    countries_learned TEXT DEFAULT '[]',
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `
        },
        {
            name: 'quiz_results',
            sql: `
                CREATE TABLE IF NOT EXISTS quiz_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    region TEXT NOT NULL,
                    quiz_type TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    date_taken DATETIME DEFAULT CURRENT_TIMESTAMP,
                    time_taken INTEGER,
                    countries_in_quiz TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `
        },
        {
            name: 'achievements',
            sql: `
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    achievement_type TEXT NOT NULL,
                    unlocked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, achievement_type),
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            `
        }
    ];

    let completed = 0;
    const total = tables.length;

    tables.forEach(table => {
        db.run(table.sql, (err) => {
            if (err) {
                console.error(`Error creating table ${table.name}:`, err.message);
                process.exit(1);
            }
            console.log(`✓ Table '${table.name}' created successfully`);
            completed++;
            
            if (completed === total) {
                console.log(`\n🎉 Database initialized successfully with ${total} tables!`);
                console.log('Database location:', dbPath);
                db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                    }
                    console.log('Database connection closed.');
                    process.exit(0);
                });
            }
        });
    });
}

// Run initialization
console.log('Initializing Flag Quiz database...');
initializeDatabase();
