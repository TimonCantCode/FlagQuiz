document.addEventListener('DOMContentLoaded', function() {
    const learnLink = document.querySelector('.header-links:first-child');
    const quizLink = document.querySelector('.header-links:nth-child(2)');
    const settings = document.querySelector('.settings');
    const settingsOverlay = document.getElementById('settings-overlay');
    const startButton = document.querySelector('.start-quiz');
    
    let currentMode = null; // 'learn' or 'quiz'
    
    // Initialize country information display
    initializeCountryInfo();
    
    // Learn link click handler
    learnLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentMode = 'learn';
        showSettings('learn');
        updateStartButton();
    });
    
    // Quiz link click handler
    quizLink.addEventListener('click', function(e) {
        e.preventDefault();
        currentMode = 'quiz';
        showSettings('quiz');
        updateStartButton();
    });
    
    // Start button click handler
    startButton.addEventListener('click', function() {
        if (currentMode === 'learn') {
            startLearning();
        } else if (currentMode === 'quiz') {
            startQuiz();
        }
    });

    // Overlay click handler
    if (settingsOverlay) {
        settingsOverlay.addEventListener('click', function() {
            hideSettings();
        });
    }
    
    function showSettings(mode) {
        settings.classList.remove('learn-mode');
        settings.classList.add('show');
        if (settingsOverlay) {
            settingsOverlay.classList.add('show');
        }
        
        // Show/hide appropriate quiz type dropdowns
        const learnDropdown = document.getElementById('quiz-type-learn');
        const quizDropdown = document.getElementById('quiz-type-quiz');
        const settingLabel = document.querySelector('.quiz-type-setting p');
        
        if (mode === 'learn') {
            settings.classList.add('learn-mode');
            learnDropdown.style.display = 'block';
            quizDropdown.style.display = 'none';
            settingLabel.textContent = 'Learning Type';
        } else {
            learnDropdown.style.display = 'none';
            quizDropdown.style.display = 'block';
            settingLabel.textContent = 'Quiz Type';
        }
    }

    function hideSettings() {
        settings.classList.remove('show');
        if (settingsOverlay) {
            settingsOverlay.classList.remove('show');
        }
        currentMode = null;
        startButton.textContent = 'Start';
    }
    
    function updateStartButton() {
        if (currentMode === 'learn') {
            startButton.textContent = 'Start Learning';
        } else if (currentMode === 'quiz') {
            startButton.textContent = 'Start Quiz';
        }
    }
    
    function startLearning() {
        // Get selected settings including enhanced features
        const region = document.getElementById('region').value;
        const quizType = document.getElementById('quiz-type-learn').value;
        const difficulty = document.getElementById('difficulty').value;
        const questionCount = document.getElementById('question-count').value;
        const includeTerritory = document.getElementById('territory').checked;
        const includeCapital = document.getElementById('capital').checked;
        const includeCurrency = document.getElementById('currency').checked;
        
        // Enhanced features
        const spacedRepetition = document.getElementById('spaced-repetition') ? document.getElementById('spaced-repetition').checked : false;
        const flagDetails = document.getElementById('flag-details') ? document.getElementById('flag-details').checked : false;
        const pronunciation = document.getElementById('pronunciation') ? document.getElementById('pronunciation').checked : false;
        const similarFlags = document.getElementById('similar-flags') ? document.getElementById('similar-flags').checked : false;
        
        const settings = {
            region,
            quizType,
            difficulty,
            questionCount,
            includeTerritory,
            includeCapital,
            includeCurrency,
            spacedRepetition,
            flagDetails,
            pronunciation,
            similarFlags
        };
        
        // Handle different learning modes
        if (quizType === 'flashcard') {
            showLoadingState('Preparing flashcards...');
            setTimeout(() => {
                startFlashcardMode(settings);
                hideLoadingState();
            }, 100);
        } else {
            // Store settings in sessionStorage to pass to learn page
            try {
                const validatedSettings = validateSettings(settings);
                sessionStorage.setItem('learningSettings', JSON.stringify(validatedSettings));
                window.location.href = 'html/learn.html';
            } catch (error) {
                showErrorMessage('Failed to save learning settings. Please try again.');
            }
        }
    }
    
    function startQuiz() {
        // Get selected settings including new features
        const region = document.getElementById('region').value;
        const quizType = document.getElementById('quiz-type-quiz').value;
        const difficulty = document.getElementById('difficulty').value;
        const questionCount = document.getElementById('question-count').value;
        const includeTerritory = document.getElementById('territory').checked;
        const includeCapital = document.getElementById('capital').checked;
        const includeCurrency = document.getElementById('currency').checked;
        
        const settings = {
            region,
            quizType,
            difficulty,
            questionCount,
            includeTerritory,
            includeCapital,
            includeCurrency
        };
        
        // Handle different quiz modes with distinct functionality
        switch(quizType) {
            case 'speed-round':
                showLoadingState('Setting up speed round...');
                setTimeout(() => {
                    startSpeedRound(settings);
                    hideLoadingState();
                }, 100);
                break;
            case 'partial-flag':
                showLoadingState('Preparing partial flag challenge...');
                setTimeout(() => {
                    startPartialFlagChallenge(settings);
                    hideLoadingState();
                }, 100);
                break;
            case 'flag-to-country':
                showLoadingState('Loading flag quiz...');
                setTimeout(() => {
                    startFlagToCountryQuiz(settings);
                    hideLoadingState();
                }, 100);
                break;
            case 'country-to-flag':
                showLoadingState('Loading country quiz...');
                setTimeout(() => {
                    startCountryToFlagQuiz(settings);
                    hideLoadingState();
                }, 100);
                break;
            case 'fill-in-the-blank':
                showLoadingState('Preparing fill-in-the-blank quiz...');
                setTimeout(() => {
                    startFillInBlankQuiz(settings);
                    hideLoadingState();
                }, 100);
                break;
            case 'multiple-choice':
                // Store settings in sessionStorage to pass to quiz page
                try {
                    const validatedSettings = validateSettings(settings);
                    sessionStorage.setItem('quizSettings', JSON.stringify(validatedSettings));
                    window.location.href = 'html/quiz.html';
                } catch (error) {
                    showErrorMessage('Failed to save quiz settings. Please try again.');
                }
                break;
            default:
                // Fallback to quiz page
                try {
                    const validatedSettings = validateSettings(settings);
                    sessionStorage.setItem('quizSettings', JSON.stringify(validatedSettings));
                    window.location.href = 'html/quiz.html';
                } catch (error) {
                    showErrorMessage('Failed to save settings. Please try again.');
                }
        }
}

// Progress Tracking
class ProgressTracker {
    constructor() {
        this.storageKey = 'flagQuizProgress';
        this.data = this.loadProgress();
    }
    
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {
                totalQuizzes: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                bestStreak: 0,
                currentStreak: 0,
                lastPlayDate: null,
                quizHistory: [],
                masteredCountries: []
            };
        } catch (error) {
            return {
                totalQuizzes: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                bestStreak: 0,
                currentStreak: 0,
                lastPlayDate: null,
                quizHistory: [],
                masteredCountries: []
            };
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.warn('Failed to save progress to localStorage');
        }
    }
    
    recordQuiz(stats, quizType) {
        this.data.totalQuizzes++;
        this.data.totalQuestions += stats.total;
        this.data.totalCorrect += stats.score;
        
        const today = new Date().toDateString();
        const lastPlay = this.data.lastPlayDate;
        
        if (lastPlay === today) {
            // Same day
        } else if (lastPlay === new Date(Date.now() - 86400000).toDateString()) {
            // Yesterday - continue streak
            this.data.currentStreak++;
        } else {
            // Break in streak
            this.data.currentStreak = 1;
        }
        
        this.data.bestStreak = Math.max(this.data.bestStreak, this.data.currentStreak);
        this.data.lastPlayDate = today;
        
        this.data.quizHistory.push({
            date: Date.now(),
            type: quizType,
            score: stats.score,
            total: stats.total,
            accuracy: stats.accuracy,
            duration: stats.duration
        });
        
        // Keep only last 50 quiz records
        if (this.data.quizHistory.length > 50) {
            this.data.quizHistory = this.data.quizHistory.slice(-50);
        }
        
        this.saveProgress();
    }
    
    getOverallStats() {
        return {
            totalQuizzes: this.data.totalQuizzes,
            overallAccuracy: this.data.totalQuestions > 0 ? 
                Math.round((this.data.totalCorrect / this.data.totalQuestions) * 100) : 0,
            currentStreak: this.data.currentStreak,
            bestStreak: this.data.bestStreak,
            recentQuizzes: this.data.quizHistory.slice(-5)
        };
    }
}

// Initialize global progress tracker
window.progressTracker = new ProgressTracker();

// Loading state management
function showLoadingState(message = 'Loading...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-size: 18px;
    `;
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 15px;">${message}</div>
            <div style="width: 40px; height: 40px; border: 3px solid #ffffff33; border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideLoadingState() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Error handling function
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message-popup';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

    // Hide settings when clicking outside
    document.addEventListener('click', function(e) {
        if (!settings.contains(e.target) && 
            !learnLink.contains(e.target) && 
            !quizLink.contains(e.target)) {
            hideSettings();
        }
    });

    // Country Information Display Functions
    function initializeCountryInfo() {
        createRegionAccordion();
    }

    function createRegionAccordion() {
        const container = document.getElementById('regions-accordion');
        if (!container) return;

        // Check if CountryData is available
        if (typeof CountryData === 'undefined') {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Country Data Not Available</h3>
                    <p>Please check your internet connection and refresh the page.</p>
                </div>
            `;
            return;
        }

        const regions = {
            'eu': 'Europe',
            'na': 'North America', 
            'sa': 'South America',
            'as': 'Asia',
            'af': 'Africa',
            'oc': 'Oceania'
        };

        Object.keys(regions).forEach(regionCode => {
            try {
                if (CountryData[regionCode] && CountryData[regionCode].length > 0) {
                    const accordionItem = createAccordionItem(regionCode, regions[regionCode]);
                    container.appendChild(accordionItem);
                }
            } catch (error) {
                console.warn(`Failed to create accordion for region: ${regionCode}`);
            }
        });
    }

    function createAccordionItem(regionCode, regionName) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'region-accordion-item';

        // Create header
        const header = document.createElement('div');
        header.className = 'region-header';
        header.innerHTML = `
            <span>${regionName} (${CountryData[regionCode].length} countries)</span>
            <span class="region-toggle">▼</span>
        `;

        // Create content
        const content = document.createElement('div');
        content.className = 'region-content';

        // Add region statistics
        const stats = document.createElement('div');
        stats.className = 'region-stats';
        stats.innerHTML = `
            <div class="region-stats-text">
                Explore ${CountryData[regionCode].length} countries from ${regionName}
            </div>
        `;

        // Create countries grid
        const countriesGrid = document.createElement('div');
        countriesGrid.className = 'countries-grid';
        
        // Sort countries alphabetically by name
        const sortedCountries = CountryData[regionCode].sort((a, b) => a.name.localeCompare(b.name));
        
        sortedCountries.forEach(country => {
            const countryCard = createCountryCard(country);
            countriesGrid.appendChild(countryCard);
        });

        content.appendChild(stats);
        content.appendChild(countriesGrid);

        // Add click event to header
        header.addEventListener('click', function() {
            const isActive = header.classList.contains('active');
            
            // Close all other accordions
            const allHeaders = document.querySelectorAll('.region-header');
            const allContents = document.querySelectorAll('.region-content');
            
            allHeaders.forEach(h => h.classList.remove('active'));
            allContents.forEach(c => c.classList.remove('active'));
            
            // If this wasn't active, open it
            if (!isActive) {
                header.classList.add('active');
                content.classList.add('active');
            }
        });

        accordionItem.appendChild(header);
        accordionItem.appendChild(content);
        
        return accordionItem;
    }

    function createCountryCard(country) {
        const card = document.createElement('div');
        card.className = 'country-card';

        const flag = document.createElement('span');
        flag.className = `fi fi-${country.code} country-flag`;

        const name = document.createElement('div');
        name.className = 'country-name';
        name.textContent = country.name;

        const details = document.createElement('div');
        details.className = 'country-details';

        const capitalDetail = document.createElement('div');
        capitalDetail.className = 'country-detail';
        capitalDetail.innerHTML = `
            <span class="detail-label">Capital</span>
            <span class="detail-value">${country.capital}</span>
        `;

        const currencyDetail = document.createElement('div');
        currencyDetail.className = 'country-detail';
        currencyDetail.innerHTML = `
            <span class="detail-label">Currency</span>
            <span class="detail-value">${country.currency}</span>
        `;

        details.appendChild(capitalDetail);
        details.appendChild(currencyDetail);

        card.appendChild(flag);
        card.appendChild(name);
        card.appendChild(details);

        return card;
    }
});

// Enhanced Learning Functions
function startFlashcardMode(settings) {
    // Create flashcard interface directly on the main page
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="learning-mode-enhanced">
            <div class="learning-header">
                <h2>Flashcard Mode - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="study-stats" id="study-stats"></div>
            <div class="flashcard-container" id="flashcard-container">
                <p>Loading flashcards...</p>
            </div>
            <div class="flashcard-controls-global">
                <button onclick="skipFlashcard()" class="skip-btn">Skip Card</button>
                <button onclick="endFlashcardSession()" class="end-session-btn">End Session</button>
            </div>
        </div>
    `;
    
    // Initialize enhanced learning
    if (typeof EnhancedLearning !== 'undefined') {
        window.currentEnhancedLearning = new EnhancedLearning();
        const countries = getCountriesByRegion(settings.region);
        const filteredCountries = window.currentEnhancedLearning.getFlagsByDifficulty(countries, settings.difficulty);
        const questionCount = settings.questionCount === 'all' ? filteredCountries.length : parseInt(settings.questionCount) || 25;
        const flagsForReview = window.currentEnhancedLearning.getFlagsForReview(filteredCountries, questionCount);
        
        // Store current session data
        window.currentFlashcardSession = {
            flags: flagsForReview,
            currentIndex: 0,
            settings: settings
        };
        
        // Display study stats
        displayStudyStats(window.currentEnhancedLearning.getStudyStats());
        
        // Start flashcard session
        if (flagsForReview.length > 0) {
            displayFlashcard(flagsForReview[0], settings);
        } else {
            document.getElementById('flashcard-container').innerHTML = `
                <div class="no-flags-message">
                    <h3>All flags are up to date!</h3>
                    <p>Great job! You've studied all the flags in this region recently.</p>
                    <button onclick="location.reload()" class="back-button">Choose Different Settings</button>
                </div>
            `;
        }
    } else {
        document.getElementById('flashcard-container').innerHTML = `
            <div class="error-message">
                <h3>Enhanced Learning Not Available</h3>
                <p>Please ensure all JavaScript files are loaded properly.</p>
                <button onclick="location.reload()" class="back-button">Reload Page</button>
            </div>
        `;
    }
}

// Quiz Session Management
class QuizSession {
    constructor(type, settings) {
        this.type = type;
        this.settings = validateSettings(settings);
        this.startTime = Date.now();
        this.countries = [];
        this.currentIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.isActive = false;
    }
    
    start() {
        this.isActive = true;
        this.countries = getCountriesByRegion(this.settings.region);
        const questionCount = this.settings.questionCount === 'all' ? 
            this.countries.length : 
            Math.min(parseInt(this.settings.questionCount), this.countries.length);
        this.countries = this.countries.sort(() => Math.random() - 0.5).slice(0, questionCount);
    }
    
    submitAnswer(userAnswer, correctAnswer) {
        if (!this.isActive) return false;
        
        const isCorrect = checkAnswerMatch(userAnswer.toLowerCase(), correctAnswer.toLowerCase());
        
        this.userAnswers.push({
            question: this.currentIndex + 1,
            userAnswer,
            correctAnswer,
            isCorrect,
            timestamp: Date.now()
        });
        
        if (isCorrect) this.score++;
        this.currentIndex++;
        
        return isCorrect;
    }
    
    isComplete() {
        return this.currentIndex >= this.countries.length;
    }
    
    getStats() {
        const duration = Date.now() - this.startTime;
        return {
            score: this.score,
            total: this.countries.length,
            accuracy: Math.round((this.score / this.countries.length) * 100),
            duration: Math.round(duration / 1000),
            averageTime: Math.round(duration / this.countries.length / 1000)
        };
    }
    
    end() {
        this.isActive = false;
        return this.getStats();
    }
}

// Utility Functions
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>\"']/g, '');
}

function validateSettings(settings) {
    const validRegions = ['eu', 'na', 'sa', 'as', 'af', 'oc', 'wrld', 'all'];
    const validQuizTypes = ['multiple-choice', 'fill-in-the-blank', 'flag-to-country', 'country-to-flag', 'speed-round', 'partial-flag', 'flashcard', 'country-explorer'];
    const validQuestionCounts = ['5', '10', '15', '20', '25', 'all'];
    
    return {
        region: validRegions.includes(settings.region) ? settings.region : 'eu',
        quizType: validQuizTypes.includes(settings.quizType) ? settings.quizType : 'multiple-choice',
        questionCount: validQuestionCounts.includes(settings.questionCount) ? settings.questionCount : '10',
        difficulty: ['beginner', 'intermediate', 'advanced', 'expert'].includes(settings.difficulty) ? settings.difficulty : 'beginner',
        includeTerritory: Boolean(settings.includeTerritory),
        includeCapital: Boolean(settings.includeCapital),
        includeCurrency: Boolean(settings.includeCurrency)
    };
}

function getRegionName(regionCode) {
    const regions = {
        'eu': 'Europe',
        'na': 'North America',
        'sa': 'South America',
        'as': 'Asia',
        'af': 'Africa',
        'oc': 'Oceania',
        'wrld': 'World',
        'all': 'All Regions',
        'africa': 'Africa',
        'asia': 'Asia',
        'europe': 'Europe',
        'north-america': 'North America',
        'south-america': 'South America',
        'oceania': 'Oceania'
    };
    return regions[regionCode] || 'Unknown Region';
}

function getCountriesByRegion(region) {
    // Check if CountryData is available
    if (typeof CountryData === 'undefined') {
        console.error('CountryData not loaded. Please check if countryData.js is properly included.');
        return [];
    }
    
    // Create countries array from CountryData if it doesn't exist
    if (typeof countries === 'undefined') {
        window.countries = [];
        try {
            Object.keys(CountryData).forEach(regionCode => {
                CountryData[regionCode].forEach(country => {
                    window.countries.push({...country, region: regionCode});
                });
            });
        } catch (error) {
            console.error('Error processing CountryData:', error);
            return [];
        }
    }
    
    if (region === 'all' || region === 'wrld') {
        return countries;
    }
    return countries.filter(country => country.region === region);
}

function getRandomCountries(allCountries, count, excludeCode) {
    const filtered = allCountries.filter(country => country.code !== excludeCode);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function displayStudyStats(stats) {
    const statsContainer = document.getElementById('study-stats');
    const accuracyPercentage = Math.round(stats.averageAccuracy * 100);
    
    statsContainer.innerHTML = `
        <h3>Your Study Progress</h3>
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-number">${stats.totalFlags}</span>
                <span class="stat-label">Flags Studied</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${accuracyPercentage}%</span>
                <span class="stat-label">Average Accuracy</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.studyStreak}</span>
                <span class="stat-label">Day Streak</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">${stats.masteredFlags.length}</span>
                <span class="stat-label">Mastered Flags</span>
            </div>
        </div>
        ${stats.difficultFlags.length > 0 ? `
            <div class="difficult-flags">
                <h4>Flags to Review</h4>
                <div class="flag-list">
                    ${stats.difficultFlags.map(code => `<span class="fi fi-${code}" title="Needs review"></span>`).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function displayFlashcard(country, settings) {
    const container = document.getElementById('flashcard-container');
    const includeDetails = settings.flagDetails || settings.includeCapital || settings.includeCurrency;
    
    if (window.currentEnhancedLearning && window.currentFlashcardSession) {
        const session = window.currentFlashcardSession;
        const progressText = `Card ${session.currentIndex + 1} of ${session.flags.length}`;
        
        const flashcard = window.currentEnhancedLearning.createFlashcard(country, includeDetails);
        
        // Add progress indicator
        const progressDiv = document.createElement('div');
        progressDiv.className = 'flashcard-progress';
        progressDiv.textContent = progressText;
        
        container.innerHTML = '';
        container.appendChild(progressDiv);
        container.appendChild(flashcard);
    }
}

function skipFlashcard() {
    const session = window.currentFlashcardSession;
    if (session && session.currentIndex < session.flags.length - 1) {
        session.currentIndex++;
        displayFlashcard(session.flags[session.currentIndex], session.settings);
    } else {
        endFlashcardSession();
    }
}

function endFlashcardSession() {
    const main = document.querySelector('main');
    const stats = window.currentEnhancedLearning ? window.currentEnhancedLearning.getStudyStats() : { averageAccuracy: 0 };
    
    main.innerHTML = `
        <div class="session-complete">
            <h2>Study Session Complete!</h2>
            <div class="final-stats">
                <div class="stat-item">
                    <span class="stat-number">${window.currentFlashcardSession ? window.currentFlashcardSession.flags.length : 0}</span>
                    <span class="stat-label">Flags Reviewed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round(stats.averageAccuracy * 100)}%</span>
                    <span class="stat-label">Overall Accuracy</span>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Start New Session</button>
        </div>
    `;
}

// Speed Round Mode
function startSpeedRound(settings) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="speed-round-container">
            <div class="speed-header">
                <h2>Speed Round - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="speed-timer" id="speed-timer">30</div>
            <div class="speed-score" id="speed-score">Score: 0/0</div>
            <div class="speed-content" id="speed-content">
                <p>Get ready for a 30-second speed challenge!</p>
                <button onclick="startSpeedTimer()" class="start-speed-btn">Start Speed Round</button>
            </div>
        </div>
    `;
    
    // Prepare countries for speed round
    const countries = getCountriesByRegion(settings.region);
    const limitedCountries = countries.slice(0, 20); // Limit for speed
    
    window.speedRoundData = {
        countries: limitedCountries,
        currentIndex: 0,
        score: 0,
        timeLeft: 30,
        active: false,
        settings: settings
    };
}

function startSpeedTimer() {
    const speedData = window.speedRoundData;
    speedData.active = true;
    speedData.currentIndex = 0;
    speedData.score = 0;
    
    const timer = setInterval(() => {
        speedData.timeLeft--;
        document.getElementById('speed-timer').textContent = speedData.timeLeft;
        
        if (speedData.timeLeft <= 10) {
            document.getElementById('speed-timer').classList.add('urgent');
        }
        
        if (speedData.timeLeft <= 0) {
            clearInterval(timer);
            endSpeedRound();
        }
    }, 1000);
    
    // Show first question
    showSpeedQuestion();
}

function showSpeedQuestion() {
    const speedData = window.speedRoundData;
    if (speedData.currentIndex >= speedData.countries.length) {
        speedData.currentIndex = 0; // Loop back
    }
    
    const country = speedData.countries[speedData.currentIndex];
    const content = document.getElementById('speed-content');
    
    content.innerHTML = `
        <div class="speed-question">
            <div class="flag-display">
                <span class="fi fi-${country.code}"></span>
            </div>
            <input type="text" id="speed-answer" placeholder="Country name..." autocomplete="off">
            <button onclick="checkSpeedAnswer()" class="speed-submit">Submit</button>
        </div>
    `;
    
    // Auto-focus input
    const input = document.getElementById('speed-answer');
    input.focus();
    
    // Allow Enter key to submit (remove any existing listeners first)
    input.removeEventListener('keypress', handleSpeedRoundEnter);
    input.addEventListener('keypress', handleSpeedRoundEnter);
}

function handleSpeedRoundEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Only proceed if we're not already processing an answer
        const speedData = window.speedRoundData;
        if (speedData && speedData.active) {
            checkSpeedAnswer();
        }
    }
}

function checkSpeedAnswer() {
    const speedData = window.speedRoundData;
    const inputElement = document.getElementById('speed-answer');
    const submitButton = document.querySelector('.speed-submit');
    
    // Prevent multiple submissions and ensure we're still active
    if (!speedData || !speedData.active || !inputElement || inputElement.disabled || 
        !submitButton || submitButton.disabled) {
        return;
    }
    
    // Disable input and button to prevent duplicate submissions
    inputElement.disabled = true;
    submitButton.disabled = true;
    
    const userAnswer = inputElement.value.toLowerCase().trim();
    const correctAnswer = speedData.countries[speedData.currentIndex].name.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        speedData.score++;
        document.getElementById('speed-content').style.background = '#48bb78';
        setTimeout(() => {
            document.getElementById('speed-content').style.background = '';
        }, 200);
    } else {
        document.getElementById('speed-content').style.background = '#f56565';
        setTimeout(() => {
            document.getElementById('speed-content').style.background = '';
        }, 200);
    }
    
    speedData.currentIndex++;
    document.getElementById('speed-score').textContent = `Score: ${speedData.score}/${speedData.currentIndex}`;
    
    // Show next question
    setTimeout(() => {
        if (speedData.active) {
            showSpeedQuestion();
        }
    }, 300);
}

function endSpeedRound() {
    const speedData = window.speedRoundData;
    speedData.active = false;
    
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="speed-results">
            <h2>Speed Round Complete!</h2>
            <div class="final-speed-stats">
                <div class="stat-item">
                    <span class="stat-number">${speedData.score}</span>
                    <span class="stat-label">Correct Answers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${speedData.currentIndex}</span>
                    <span class="stat-label">Total Attempts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round((speedData.score / speedData.currentIndex) * 100)}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Try Again</button>
        </div>
    `;
}

// Partial Flag Challenge Mode
function startPartialFlagChallenge(settings) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="partial-flag-container">
            <div class="partial-header">
                <h2>Partial Flag Challenge - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="partial-score" id="partial-score">Score: 0/0</div>
            <div class="partial-content" id="partial-content">
                <p>Can you identify countries from partially hidden flags?</p>
                <button onclick="startPartialChallenge()" class="start-partial-btn">Start Challenge</button>
            </div>
        </div>
    `;
    
    // Prepare countries for partial flag challenge
    const countries = getCountriesByRegion(settings.region);
    const shuffledCountries = countries.sort(() => Math.random() - 0.5);
    const questionCount = settings.questionCount === 'all' ? countries.length : Math.min(parseInt(settings.questionCount), countries.length);
    
    window.partialChallengeData = {
        countries: shuffledCountries.slice(0, questionCount),
        currentIndex: 0,
        score: 0,
        settings: settings
    };
}

function startPartialChallenge() {
    showPartialQuestion();
}

function showPartialQuestion() {
    const challengeData = window.partialChallengeData;
    if (challengeData.currentIndex >= challengeData.countries.length) {
        endPartialChallenge();
        return;
    }
    
    const country = challengeData.countries[challengeData.currentIndex];
    const content = document.getElementById('partial-content');
    
    // Create multiple choice options
    const wrongAnswers = getRandomCountries(challengeData.countries, 3, country.code);
    const allOptions = [country, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    content.innerHTML = `
        <div class="partial-question">
            <div class="partial-flag-display">
                <span class="fi fi-${country.code}"></span>
                <div class="flag-mask"></div>
            </div>
            <p>Which country does this flag belong to?</p>
            <div class="partial-options">
                ${allOptions.map(option => `
                    <button onclick="checkPartialAnswer('${option.code}', '${country.code}')" class="partial-option">
                        ${option.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function getRandomCountries(countries, count, excludeCode) {
    return countries
        .filter(c => c.code !== excludeCode)
        .sort(() => Math.random() - 0.5)
        .slice(0, count);
}

function checkPartialAnswer(selectedCode, correctCode) {
    const challengeData = window.partialChallengeData;
    const isCorrect = selectedCode === correctCode;
    
    if (isCorrect) {
        challengeData.score++;
    }
    
    challengeData.currentIndex++;
    document.getElementById('partial-score').textContent = `Score: ${challengeData.score}/${challengeData.currentIndex}`;
    
    // Show feedback
    const content = document.getElementById('partial-content');
    content.style.background = isCorrect ? '#48bb78' : '#f56565';
    
    setTimeout(() => {
        content.style.background = '';
        showPartialQuestion();
    }, 1000);
}

function endPartialChallenge() {
    const challengeData = window.partialChallengeData;
    
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="partial-results">
            <h2>Partial Flag Challenge Complete!</h2>
            <div class="final-partial-stats">
                <div class="stat-item">
                    <span class="stat-number">${challengeData.score}</span>
                    <span class="stat-label">Correct Answers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${challengeData.countries.length}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round((challengeData.score / challengeData.countries.length) * 100)}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Try Again</button>
        </div>
    `;
}

// Flag to Country Quiz Mode
function startFlagToCountryQuiz(settings) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <h2>Flag → Country Quiz - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="quiz-progress" id="quiz-progress">Question 1 of ${settings.questionCount}</div>
            <div class="quiz-score" id="quiz-score">Score: 0/0</div>
            <div class="quiz-content" id="quiz-content">
                <p>Loading questions...</p>
            </div>
        </div>
    `;
    
    // Prepare quiz data
    const countries = getCountriesByRegion(settings.region);
    const questionCount = settings.questionCount === 'all' ? countries.length : Math.min(parseInt(settings.questionCount), countries.length);
    const shuffledCountries = countries.sort(() => Math.random() - 0.5).slice(0, questionCount);
    
    window.flagToCountryQuiz = {
        countries: shuffledCountries,
        currentIndex: 0,
        score: 0,
        settings: settings
    };
    
    showFlagToCountryQuestion();
}

function showFlagToCountryQuestion() {
    const quiz = window.flagToCountryQuiz;
    if (quiz.currentIndex >= quiz.countries.length) {
        endFlagToCountryQuiz();
        return;
    }
    
    const country = quiz.countries[quiz.currentIndex];
    const wrongAnswers = getRandomCountries(quiz.countries, 3, country.code);
    const allOptions = [country, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    document.getElementById('quiz-progress').textContent = `Question ${quiz.currentIndex + 1} of ${quiz.countries.length}`;
    document.getElementById('quiz-content').innerHTML = `
        <div class="flag-quiz-question">
            <div class="flag-display">
                <span class="fi fi-${country.code}"></span>
            </div>
            <h3>Which country does this flag belong to?</h3>
            <div class="quiz-options">
                ${allOptions.map(option => `
                    <button onclick="checkFlagToCountryAnswer('${option.code}', '${country.code}')" class="quiz-option">
                        ${option.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkFlagToCountryAnswer(selectedCode, correctCode) {
    const quiz = window.flagToCountryQuiz;
    const isCorrect = selectedCode === correctCode;
    
    if (isCorrect) {
        quiz.score++;
    }
    
    quiz.currentIndex++;
    document.getElementById('quiz-score').textContent = `Score: ${quiz.score}/${quiz.currentIndex}`;
    
    // Show feedback
    const content = document.getElementById('quiz-content');
    content.style.background = isCorrect ? '#48bb78' : '#f56565';
    
    setTimeout(() => {
        content.style.background = '';
        showFlagToCountryQuestion();
    }, 1000);
}

function endFlagToCountryQuiz() {
    const quiz = window.flagToCountryQuiz;
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-results">
            <h2>Flag → Country Quiz Complete!</h2>
            <div class="final-quiz-stats">
                <div class="stat-item">
                    <span class="stat-number">${quiz.score}</span>
                    <span class="stat-label">Correct Answers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${quiz.countries.length}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round((quiz.score / quiz.countries.length) * 100)}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Try Again</button>
        </div>
    `;
}

// Country to Flag Quiz Mode
function startCountryToFlagQuiz(settings) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <h2>Country → Flag Quiz - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="quiz-progress" id="quiz-progress">Question 1 of ${settings.questionCount}</div>
            <div class="quiz-score" id="quiz-score">Score: 0/0</div>
            <div class="quiz-content" id="quiz-content">
                <p>Loading questions...</p>
            </div>
        </div>
    `;
    
    // Prepare quiz data
    const countries = getCountriesByRegion(settings.region);
    const questionCount = settings.questionCount === 'all' ? countries.length : Math.min(parseInt(settings.questionCount), countries.length);
    const shuffledCountries = countries.sort(() => Math.random() - 0.5).slice(0, questionCount);
    
    window.countryToFlagQuiz = {
        countries: shuffledCountries,
        currentIndex: 0,
        score: 0,
        settings: settings
    };
    
    showCountryToFlagQuestion();
}

function showCountryToFlagQuestion() {
    const quiz = window.countryToFlagQuiz;
    if (quiz.currentIndex >= quiz.countries.length) {
        endCountryToFlagQuiz();
        return;
    }
    
    const country = quiz.countries[quiz.currentIndex];
    const wrongAnswers = getRandomCountries(quiz.countries, 3, country.code);
    const allOptions = [country, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    document.getElementById('quiz-progress').textContent = `Question ${quiz.currentIndex + 1} of ${quiz.countries.length}`;
    document.getElementById('quiz-content').innerHTML = `
        <div class="country-quiz-question">
            <h3>Which flag belongs to ${country.name}?</h3>
            <div class="flag-options">
                ${allOptions.map(option => `
                    <button onclick="checkCountryToFlagAnswer('${option.code}', '${country.code}')" class="flag-option">
                        <span class="fi fi-${option.code}"></span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function checkCountryToFlagAnswer(selectedCode, correctCode) {
    const quiz = window.countryToFlagQuiz;
    const isCorrect = selectedCode === correctCode;
    
    if (isCorrect) {
        quiz.score++;
    }
    
    quiz.currentIndex++;
    document.getElementById('quiz-score').textContent = `Score: ${quiz.score}/${quiz.currentIndex}`;
    
    // Show feedback
    const content = document.getElementById('quiz-content');
    content.style.background = isCorrect ? '#48bb78' : '#f56565';
    
    setTimeout(() => {
        content.style.background = '';
        showCountryToFlagQuestion();
    }, 1000);
}

function endCountryToFlagQuiz() {
    const quiz = window.countryToFlagQuiz;
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-results">
            <h2>Country → Flag Quiz Complete!</h2>
            <div class="final-quiz-stats">
                <div class="stat-item">
                    <span class="stat-number">${quiz.score}</span>
                    <span class="stat-label">Correct Answers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${quiz.countries.length}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${Math.round((quiz.score / quiz.countries.length) * 100)}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Try Again</button>
        </div>
    `;
}

// Fill in the Blank Quiz Mode
function startFillInBlankQuiz(settings) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-container">
            <div class="quiz-header">
                <h2>Fill in the Blank Quiz - ${getRegionName(settings.region)}</h2>
                <button class="back-button" onclick="location.reload()">← Back to Menu</button>
            </div>
            <div class="quiz-progress" id="quiz-progress">Question 1 of ${settings.questionCount}</div>
            <div class="quiz-score" id="quiz-score">Score: 0/0</div>
            <div class="quiz-content" id="quiz-content">
                <p>Loading questions...</p>
            </div>
        </div>
    `;
    
    // Prepare quiz data
    const countries = getCountriesByRegion(settings.region);
    const questionCount = settings.questionCount === 'all' ? countries.length : Math.min(parseInt(settings.questionCount), countries.length);
    const shuffledCountries = countries.sort(() => Math.random() - 0.5).slice(0, questionCount);
    
    window.fillInBlankQuiz = {
        countries: shuffledCountries,
        currentIndex: 0,
        score: 0,
        settings: settings
    };
    
    showFillInBlankQuestion();
}

function showFillInBlankQuestion() {
    const quiz = window.fillInBlankQuiz;
    if (quiz.currentIndex >= quiz.countries.length) {
        endFillInBlankQuiz();
        return;
    }
    
    const country = quiz.countries[quiz.currentIndex];
    
    document.getElementById('quiz-progress').textContent = `Question ${quiz.currentIndex + 1} of ${quiz.countries.length}`;
    document.getElementById('quiz-content').innerHTML = `
        <div class="fill-blank-question">
            <div class="flag-display">
                <span class="fi fi-${country.code}" role="img" aria-label="Flag of ${country.name}"></span>
            </div>
            <h3>Type the name of this country:</h3>
            <input type="text" 
                   id="fill-blank-answer" 
                   placeholder="Country name..." 
                   autocomplete="off"
                   aria-label="Enter country name"
                   aria-describedby="hint-text">
            <button onclick="checkFillInBlankAnswer()" 
                    class="submit-answer"
                    aria-label="Submit your answer">Submit</button>
            <div class="hint-section">
                <button onclick="showHint()" 
                        class="hint-button"
                        aria-label="Get a hint for this country">Need a hint?</button>
                <div id="hint-text" 
                     style="display: none; margin-top: 10px; color: var(--accent-color);"
                     role="region"
                     aria-live="polite"></div>
            </div>
        </div>
    `;
    
    // Auto-focus input
    const input = document.getElementById('fill-blank-answer');
    input.focus();
    
    // Allow Enter key to submit (remove any existing listeners first)
    input.removeEventListener('keypress', handleFillInBlankEnter);
    input.addEventListener('keypress', handleFillInBlankEnter);
}

function handleFillInBlankEnter(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Only proceed if we're not already processing an answer
        const submitButton = document.querySelector('.submit-answer');
        if (submitButton && !submitButton.disabled) {
            checkFillInBlankAnswer();
        }
    }
}

function showHint() {
    const quiz = window.fillInBlankQuiz;
    const country = quiz.countries[quiz.currentIndex];
    const hint = document.getElementById('hint-text');
    
    // Provide different types of hints
    const hints = [
        `Capital: ${country.capital}`,
        `Currency: ${country.currency}`,
        `First letter: ${country.name.charAt(0)}`,
        `Length: ${country.name.length} letters`
    ];
    
    hint.textContent = hints[Math.floor(Math.random() * hints.length)];
    hint.style.display = 'block';
}

function checkFillInBlankAnswer() {
    const quiz = window.fillInBlankQuiz;
    const inputElement = document.getElementById('fill-blank-answer');
    const submitButton = document.querySelector('.submit-answer');
    
    // Prevent multiple submissions
    if (!inputElement || inputElement.disabled || !submitButton || submitButton.disabled) {
        return;
    }
    
    // Validate input
    const rawAnswer = inputElement.value;
    if (!rawAnswer || rawAnswer.trim().length === 0) {
        showErrorMessage('Please enter an answer before submitting.');
        return;
    }
    
    // Disable input and button to prevent duplicate submissions
    inputElement.disabled = true;
    submitButton.disabled = true;
    
    const userAnswer = sanitizeInput(rawAnswer).toLowerCase();
    const correctAnswer = quiz.countries[quiz.currentIndex].name.toLowerCase();
    
    // Enhanced matching logic
    const isCorrect = checkAnswerMatch(userAnswer, correctAnswer);
    
    if (isCorrect) {
        quiz.score++;
    }
    
    quiz.currentIndex++;
    document.getElementById('quiz-score').textContent = `Score: ${quiz.score}/${quiz.currentIndex}`;
    
    // Show feedback with correct answer
    const content = document.getElementById('quiz-content');
    content.style.background = isCorrect ? '#48bb78' : '#f56565';
    
    if (!isCorrect) {
        content.innerHTML += `<div style="margin-top: 15px; color: white; font-weight: bold;">Correct answer: ${quiz.countries[quiz.currentIndex - 1].name}</div>`;
    }
    
    setTimeout(() => {
        content.style.background = '';
        // Remove the event listener before showing the next question
        if (inputElement) {
            inputElement.removeEventListener('keypress', handleFillInBlankEnter);
        }
        showFillInBlankQuestion();
    }, 2000);
}

// Enhanced answer matching function
function checkAnswerMatch(userAnswer, correctAnswer) {
    // Exact match
    if (userAnswer === correctAnswer) return true;
    
    // Partial match for longer answers
    if (correctAnswer.includes(userAnswer) && userAnswer.length > 3) return true;
    
    // Check first word match for compound country names
    if (userAnswer.includes(correctAnswer.split(' ')[0])) return true;
    
    // Levenshtein distance for typos (simple version)
    if (correctAnswer.length > 5 && calculateSimilarity(userAnswer, correctAnswer) > 0.8) return true;
    
    return false;
}

// Simple similarity calculation
function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

// Levenshtein distance implementation
function levenshteinDistance(str1, str2) {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + cost
            );
        }
    }
    
    return matrix[str2.length][str1.length];
}

function endFillInBlankQuiz() {
    const quiz = window.fillInBlankQuiz;
    const stats = {
        score: quiz.score,
        total: quiz.countries.length,
        accuracy: Math.round((quiz.score / quiz.countries.length) * 100)
    };
    
    // Record progress
    window.progressTracker.recordQuiz(stats, 'fill-in-the-blank');
    const overallStats = window.progressTracker.getOverallStats();
    
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-results">
            <h2>Fill in the Blank Quiz Complete!</h2>
            <div class="final-quiz-stats">
                <div class="stat-item">
                    <span class="stat-number">${stats.score}</span>
                    <span class="stat-label">Correct Answers</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.total}</span>
                    <span class="stat-label">Total Questions</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${stats.accuracy}%</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            <div class="progress-stats">
                <h3>Your Progress</h3>
                <div class="progress-grid">
                    <div class="progress-item">
                        <span class="progress-number">${overallStats.totalQuizzes}</span>
                        <span class="progress-label">Total Quizzes</span>
                    </div>
                    <div class="progress-item">
                        <span class="progress-number">${overallStats.overallAccuracy}%</span>
                        <span class="progress-label">Overall Accuracy</span>
                    </div>
                    <div class="progress-item">
                        <span class="progress-number">${overallStats.currentStreak}</span>
                        <span class="progress-label">Current Streak</span>
                    </div>
                </div>
            </div>
            <button onclick="location.reload()" class="start-new-session-btn">Try Again</button>
        </div>
    `;
}