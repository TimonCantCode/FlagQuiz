const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Ensure database directory exists
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Created database directory');
}

// Database setup
const dbPath = path.join(__dirname, 'database', 'flagquiz.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeTables();
    }
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json());

// Serve static files (exclude backend folder to prevent loops)
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/html', express.static(path.join(__dirname, '../html')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 auth requests per windowMs
});

// Initialize database tables
function initializeTables() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            join_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1
        )
    `;

    const createUserStatsTable = `
        CREATE TABLE IF NOT EXISTS user_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            quiz_attempts INTEGER DEFAULT 0,
            best_score INTEGER DEFAULT 0,
            total_score INTEGER DEFAULT 0,
            countries_learned TEXT DEFAULT '[]',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;

    const createQuizResultsTable = `
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
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;

    const createAchievementsTable = `
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            achievement_type TEXT NOT NULL,
            unlocked_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `;

    db.run(createUsersTable);
    db.run(createUserStatsTable);
    db.run(createQuizResultsTable);
    db.run(createAchievementsTable);
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// API Routes

// User Registration
app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (row) {
                return res.status(400).json({ error: 'User already exists with this email or username' });
            }

            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Insert new user
            db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', 
                [username, email, passwordHash], 
                function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ error: 'Failed to create user' });
                    }

                    const userId = this.lastID;

                    // Create initial user stats
                    db.run('INSERT INTO user_stats (user_id) VALUES (?)', [userId], (err) => {
                        if (err) {
                            console.error('Error creating user stats:', err);
                        }
                    });

                    // Generate JWT token
                    const token = jwt.sign(
                        { userId: userId, username: username, email: email },
                        JWT_SECRET,
                        { expiresIn: '24h' }
                    );

                    res.status(201).json({
                        message: 'User created successfully',
                        token: token,
                        user: {
                            id: userId,
                            username: username,
                            email: email,
                            joinDate: new Date().toISOString()
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Update last login
            db.run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    joinDate: user.join_date
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    const query = `
        SELECT 
            u.id, u.username, u.email, u.join_date,
            s.quiz_attempts, s.best_score, s.total_score, s.countries_learned
        FROM users u
        LEFT JOIN user_stats s ON u.id = s.user_id
        WHERE u.id = ? AND u.is_active = 1
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!row) {
            return res.status(404).json({ error: 'User not found' });
        }

        const avgScore = row.quiz_attempts > 0 ? Math.round(row.total_score / row.quiz_attempts) : 0;

        res.json({
            user: {
                id: row.id,
                username: row.username,
                email: row.email,
                joinDate: row.join_date
            },
            stats: {
                quizAttempts: row.quiz_attempts || 0,
                bestScore: row.best_score || 0,
                avgScore: avgScore,
                totalScore: row.total_score || 0,
                countriesLearned: JSON.parse(row.countries_learned || '[]')
            }
        });
    });
});

// Get Quiz Results
app.get('/api/user/quiz-results', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 10;

    db.all(
        'SELECT * FROM quiz_results WHERE user_id = ? ORDER BY date_taken DESC LIMIT ?',
        [userId, limit],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ results: rows });
        }
    );
});

// Save Quiz Result
app.post('/api/user/quiz-result', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { region, quizType, score, totalQuestions, timeTaken, countries } = req.body;

    // Insert quiz result
    db.run(
        'INSERT INTO quiz_results (user_id, region, quiz_type, score, total_questions, time_taken, countries_in_quiz) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, region, quizType, score, totalQuestions, timeTaken, JSON.stringify(countries || [])],
        function(err) {
            if (err) {
                console.error('Error saving quiz result:', err);
                return res.status(500).json({ error: 'Failed to save quiz result' });
            }

            // Update user stats
            db.get('SELECT * FROM user_stats WHERE user_id = ?', [userId], (err, stats) => {
                if (err) {
                    console.error('Error fetching stats:', err);
                    return res.status(500).json({ error: 'Failed to update stats' });
                }

                const newAttempts = (stats?.quiz_attempts || 0) + 1;
                const newTotalScore = (stats?.total_score || 0) + score;
                const newBestScore = Math.max(stats?.best_score || 0, score);
                
                const existingCountries = JSON.parse(stats?.countries_learned || '[]');
                const allCountries = [...new Set([...existingCountries, ...(countries || [])])];

                db.run(
                    'UPDATE user_stats SET quiz_attempts = ?, total_score = ?, best_score = ?, countries_learned = ? WHERE user_id = ?',
                    [newAttempts, newTotalScore, newBestScore, JSON.stringify(allCountries), userId],
                    (err) => {
                        if (err) {
                            console.error('Error updating stats:', err);
                            return res.status(500).json({ error: 'Failed to update stats' });
                        }

                        res.json({ message: 'Quiz result saved successfully', id: this.lastID });
                    }
                );
            });
        }
    );
});

// Get Achievements
app.get('/api/user/achievements', authenticateToken, (req, res) => {
    const userId = req.user.userId;

    db.all(
        'SELECT achievement_type, unlocked_date FROM achievements WHERE user_id = ?',
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json({ achievements: rows });
        }
    );
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Catch-all handler for frontend routes
app.get('*', (req, res) => {
    // Don't interfere with API routes
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // For all other routes, serve the main page
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing database connection...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Database connection closed.');
        process.exit(0);
    });
});
