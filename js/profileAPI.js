// Profile.js - Updated to work with SQLite backend API
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.apiUrl = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
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
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showDashboard();
                messageEl.textContent = '';
            } else {
                messageEl.textContent = data.error || 'Login failed';
                messageEl.className = 'auth-message error';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageEl.textContent = 'Network error. Please try again.';
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
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.showDashboard();
                messageEl.textContent = '';
            } else {
                messageEl.textContent = data.error || 'Signup failed';
                messageEl.className = 'auth-message error';
            }
        } catch (error) {
            console.error('Signup error:', error);
            messageEl.textContent = 'Network error. Please try again.';
            messageEl.className = 'auth-message error';
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.showAuthSection();
    }

    async checkLoginStatus() {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('currentUser');

        if (storedToken && storedUser) {
            this.token = storedToken;
            try {
                // Verify token is still valid by fetching profile
                const response = await fetch(`${this.apiUrl}/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.userStats = data.stats;
                    this.showDashboard();
                } else {
                    // Token invalid, clear storage
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Token verification failed:', error);
                this.handleLogout();
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

    async updateDashboard() {
        if (!this.currentUser || !this.token) return;

        try {
            // Fetch updated profile data
            const profileResponse = await fetch(`${this.apiUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (profileResponse.ok) {
                const profileData = await profileResponse.json();
                
                // Update profile info
                document.getElementById('user-name').textContent = profileData.user.username;
                document.getElementById('user-email').textContent = profileData.user.email;
                document.getElementById('member-date').textContent = new Date(profileData.user.joinDate).toLocaleDateString();

                // Update stats
                const stats = profileData.stats;
                document.getElementById('total-attempts').textContent = stats.quizAttempts;
                document.getElementById('best-score').textContent = stats.bestScore + '%';
                document.getElementById('avg-score').textContent = stats.avgScore + '%';
                document.getElementById('countries-learned').textContent = stats.countriesLearned.length;

                // Update recent results
                await this.updateRecentResults();
                
                // Update achievements
                await this.updateAchievements();
            }
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    async updateRecentResults() {
        try {
            const response = await fetch(`${this.apiUrl}/user/quiz-results?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const resultsContainer = document.getElementById('recent-results');
                const results = data.results;

                if (results.length === 0) {
                    resultsContainer.innerHTML = '<p class="no-data">No quiz results yet. Take your first quiz!</p>';
                    return;
                }

                resultsContainer.innerHTML = results.map(result => `
                    <div class="result-item">
                        <div class="result-info">
                            <div class="result-quiz">${result.region} - ${result.quiz_type}</div>
                            <div class="result-date">${new Date(result.date_taken).toLocaleDateString()}</div>
                        </div>
                        <div class="result-score">${result.score}%</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching quiz results:', error);
        }
    }

    async updateAchievements() {
        try {
            const response = await fetch(`${this.apiUrl}/user/achievements`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const unlockedAchievements = data.achievements.map(a => a.achievement_type);
                const achievements = document.querySelectorAll('.achievement');

                // Quiz Master - Complete 10 quizzes
                if (unlockedAchievements.includes('quiz_master')) {
                    achievements[0].classList.remove('locked');
                    achievements[0].classList.add('unlocked');
                }

                // Perfect Score - Get 100% on any quiz
                if (unlockedAchievements.includes('perfect_score')) {
                    achievements[1].classList.remove('locked');
                    achievements[1].classList.add('unlocked');
                }

                // Globe Trotter - Learn about 50 countries
                if (unlockedAchievements.includes('globe_trotter')) {
                    achievements[2].classList.remove('locked');
                    achievements[2].classList.add('unlocked');
                }
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        }
    }

    // Method to be called from quiz pages to update stats
    async updateQuizStats(quizData) {
        if (!this.token) {
            console.warn('No auth token, cannot save quiz result');
            return;
        }

        try {
            const response = await fetch(`${this.apiUrl}/user/quiz-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    region: quizData.region,
                    quizType: quizData.type,
                    score: quizData.score,
                    totalQuestions: quizData.totalQuestions,
                    timeTaken: quizData.timeTaken,
                    countries: quizData.countries
                })
            });

            if (response.ok) {
                console.log('Quiz result saved successfully');
                // Refresh dashboard if we're on the profile page
                if (window.location.pathname.includes('profile.html')) {
                    this.updateDashboard();
                }
            } else {
                console.error('Failed to save quiz result');
            }
        } catch (error) {
            console.error('Error saving quiz result:', error);
        }
    }

    // Utility method to get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Utility method to check if user is logged in
    isLoggedIn() {
        return this.token !== null && this.currentUser !== null;
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
