# Flag Quiz Backend Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your preferred settings
# Make sure to change JWT_SECRET to a secure random string!
```

### 3. Initialize Database
```bash
npm run init-db
```

### 4. Start the Server
```bash
# Development mode (with nodemon for auto-restart)
npm run dev

# Or production mode
npm start
```

### 5. Access Your App
Open your browser to: `http://localhost:3000`

## 🌐 Deployment Options

### Option 1: Railway (Recommended - Free Tier Available)
1. Push your code to GitHub
2. Connect Railway to your repository
3. Set environment variables in Railway dashboard
4. Deploy automatically!

### Option 2: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-flag-quiz-app`
3. Set environment variables: `heroku config:set JWT_SECRET=your-secret`
4. Deploy: `git push heroku main`

### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables in Vercel dashboard

### Option 4: VPS/Cloud Server
1. Upload files to your server
2. Install Node.js and npm
3. Run: `npm install && npm run init-db && npm start`
4. Use PM2 for process management: `pm2 start server.js`

## 📋 Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
FRONTEND_URL=https://your-domain.com
DB_PATH=./database/flagquiz.db
BCRYPT_ROUNDS=12
JWT_EXPIRY=24h
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5
```

## 🗄️ Database

- **SQLite Database**: Stored in `backend/database/flagquiz.db`
- **Automatic Backups**: Consider setting up regular backups of this file
- **Migration**: To move data, simply copy the `.db` file to your new server

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token authentication  
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ SQL injection protection (parameterized queries)
- ✅ Helmet.js security headers
- ✅ Input validation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Profile  
- `GET /api/user/profile` - Get user profile and stats
- `GET /api/user/quiz-results` - Get recent quiz results
- `POST /api/user/quiz-result` - Save new quiz result
- `GET /api/user/achievements` - Get user achievements

## 🛠️ Troubleshooting

### Database Issues
```bash
# Recreate database
rm backend/database/flagquiz.db
npm run init-db
```

### Permission Issues
```bash
# Make sure database directory is writable
chmod 755 backend/database
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change PORT in .env file
```

## ✅ Features

- 🌐 **Multi-device sync** - Login from any device
- 💾 **Persistent data** - SQLite database with backups
- 🔐 **Secure authentication** - JWT tokens with bcrypt hashing
- 📊 **Detailed statistics** - Track progress across devices
- 🏆 **Achievement system** - Unlock achievements as you progress
- ⚡ **Fast performance** - SQLite is lightning fast for read operations
- 🚀 **Easy deployment** - Works on any hosting service that supports Node.js

Your Flag Quiz app is now ready for production with a real database backend!
