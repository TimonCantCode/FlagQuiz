// Profile.js - Handle authentication and profile management
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.initializeEventListeners();
        this.checkLoginStatus();
    }

    initializeEventListeners() {
        // Auth tab switching
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');

        loginTab.addEventListener('click', () => {
            this.switchTab('login', loginTab, signupTab, loginForm, signupForm);
        });

        signupTab.addEventListener('click', () => {
            this.switchTab('signup', signupTab, loginTab, signupForm, loginForm);
        });

        // Form submissions
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        document.getElementById('signupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup(e);
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    switchTab(activeTab, activeBtn, inactiveBtn, activeForm, inactiveForm) {
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
        activeForm.classList.add('active');
        inactiveForm.classList.remove('active');
        
        // Clear messages
        document.getElementById('login-message').textContent = '';
        document.getElementById('signup-message').textContent = '';
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const messageEl = document.getElementById('login-message');

        try {
            const user = this.authenticateUser(email, password);
            if (user) {
                this.currentUser = user;
                this.saveLoginStatus(user);
                this.showDashboard();
                messageEl.textContent = '';
            } else {
                messageEl.textContent = 'Invalid email or password';
                messageEl.className = 'auth-message error';
            }
        } catch (error) {
            messageEl.textContent = 'Login failed. Please try again.';
            messageEl.className = 'auth-message error';
        }
    }

    async handleSignup(event) {
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const messageEl = document.getElementById('signup-message');

        // Validation
        if (password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match';
            messageEl.className = 'auth-message error';
            return;
        }

        if (password.length < 6) {
            messageEl.textContent = 'Password must be at least 6 characters';
            messageEl.className = 'auth-message error';
            return;
        }

        try {
            if (this.userExists(email)) {
                messageEl.textContent = 'User with this email already exists';
                messageEl.className = 'auth-message error';
                return;
            }

            const newUser = this.createUser(username, email, password);
            this.currentUser = newUser;
            this.saveLoginStatus(newUser);
            this.showDashboard();
            messageEl.textContent = '';
        } catch (error) {
            messageEl.textContent = 'Signup failed. Please try again.';
            messageEl.className = 'auth-message error';
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('flagQuizUser');
        this.showAuthSection();
    }

    authenticateUser(email, password) {
        const users = this.getStoredUsers();
        return users.find(user => user.email === email && user.password === this.hashPassword(password));
    }

    userExists(email) {
        const users = this.getStoredUsers();
        return users.some(user => user.email === email);
    }

    createUser(username, email, password) {
        const users = this.getStoredUsers();
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: this.hashPassword(password),
            joinDate: new Date().toISOString(),
            stats: {
                quizAttempts: 0,
                bestScore: 0,
                totalScore: 0,
                countriesLearned: new Set()
            },
            quizResults: [],
            achievements: []
        };

        users.push(newUser);
        localStorage.setItem('flagQuizUsers', JSON.stringify(users));
        return newUser;
    }

    getStoredUsers() {
        const stored = localStorage.getItem('flagQuizUsers');
        return stored ? JSON.parse(stored) : [];
    }

    hashPassword(password) {
        // Simple hash function (in production, use proper hashing)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    saveLoginStatus(user) {
        localStorage.setItem('flagQuizUser', JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            joinDate: user.joinDate
        }));
    }

    checkLoginStatus() {
        const stored = localStorage.getItem('flagQuizUser');
        if (stored) {
            const userData = JSON.parse(stored);
            const users = this.getStoredUsers();
            this.currentUser = users.find(user => user.id === userData.id);
            if (this.currentUser) {
                this.showDashboard();
            } else {
                this.showAuthSection();
            }
        } else {
            this.showAuthSection();
        }
    }

    showAuthSection() {
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('profile-dashboard').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('profile-dashboard').classList.remove('hidden');
        this.updateDashboard();
    }

    updateDashboard() {
        if (!this.currentUser) return;

        // Update profile info
        document.getElementById('user-name').textContent = this.currentUser.username;
        document.getElementById('user-email').textContent = this.currentUser.email;
        document.getElementById('member-date').textContent = new Date(this.currentUser.joinDate).toLocaleDateString();

        // Update stats
        const stats = this.currentUser.stats;
        document.getElementById('total-attempts').textContent = stats.quizAttempts;
        document.getElementById('best-score').textContent = stats.bestScore + '%';
        
        const avgScore = stats.quizAttempts > 0 ? Math.round(stats.totalScore / stats.quizAttempts) : 0;
        document.getElementById('avg-score').textContent = avgScore + '%';
        document.getElementById('countries-learned').textContent = stats.countriesLearned.size || 0;

        // Update recent results
        this.updateRecentResults();
        
        // Update achievements
        this.updateAchievements();
    }

    updateRecentResults() {
        const resultsContainer = document.getElementById('recent-results');
        const results = this.currentUser.quizResults.slice(-5).reverse(); // Last 5 results

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-data">No quiz results yet. Take your first quiz!</p>';
            return;
        }

        resultsContainer.innerHTML = results.map(result => `
            <div class="result-item">
                <div class="result-info">
                    <div class="result-quiz">${result.region} - ${result.type}</div>
                    <div class="result-date">${new Date(result.date).toLocaleDateString()}</div>
                </div>
                <div class="result-score">${result.score}%</div>
            </div>
        `).join('');
    }

    updateAchievements() {
        const stats = this.currentUser.stats;
        const achievements = document.querySelectorAll('.achievement');

        // Quiz Master - Complete 10 quizzes
        if (stats.quizAttempts >= 10) {
            achievements[0].classList.remove('locked');
            achievements[0].classList.add('unlocked');
        }

        // Perfect Score - Get 100% on any quiz
        if (stats.bestScore === 100) {
            achievements[1].classList.remove('locked');
            achievements[1].classList.add('unlocked');
        }

        // Globe Trotter - Learn about 50 countries
        if (stats.countriesLearned.size >= 50) {
            achievements[2].classList.remove('locked');
            achievements[2].classList.add('unlocked');
        }
    }

    // Method to be called from quiz pages to update stats
    updateQuizStats(quizData) {
        if (!this.currentUser) return;

        const users = this.getStoredUsers();
        const userIndex = users.findIndex(user => user.id === this.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].stats.quizAttempts++;
            users[userIndex].stats.totalScore += quizData.score;
            if (quizData.score > users[userIndex].stats.bestScore) {
                users[userIndex].stats.bestScore = quizData.score;
            }

            // Add countries learned
            if (quizData.countries) {
                quizData.countries.forEach(country => {
                    users[userIndex].stats.countriesLearned.add(country);
                });
            }

            // Add quiz result
            users[userIndex].quizResults.push({
                date: new Date().toISOString(),
                region: quizData.region,
                type: quizData.type,
                score: quizData.score,
                questions: quizData.questions
            });

            // Save updated data
            localStorage.setItem('flagQuizUsers', JSON.stringify(users));
            this.currentUser = users[userIndex];
        }
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}
