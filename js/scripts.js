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
        
        console.log('Starting learning mode with enhanced settings:', settings);
        
        // Handle different learning modes
        if (quizType === 'flashcard') {
            startFlashcardMode(settings);
        } else {
            // Store settings in sessionStorage to pass to learn page
            sessionStorage.setItem('learningSettings', JSON.stringify(settings));
            window.location.href = 'html/learn.html';
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
        
        console.log('Starting quiz mode with enhanced settings:', settings);
        
        // Handle different quiz modes with distinct functionality
        switch(quizType) {
            case 'speed-round':
                startSpeedRound(settings);
                break;
            case 'partial-flag':
                startPartialFlagChallenge(settings);
                break;
            case 'flag-to-country':
                startFlagToCountryQuiz(settings);
                break;
            case 'country-to-flag':
                startCountryToFlagQuiz(settings);
                break;
            case 'fill-in-the-blank':
                startFillInBlankQuiz(settings);
                break;
            case 'multiple-choice':
                // Store settings in sessionStorage to pass to quiz page
                sessionStorage.setItem('quizSettings', JSON.stringify(settings));
                window.location.href = 'html/quiz.html';
                break;
            default:
                // Fallback to quiz page
                sessionStorage.setItem('quizSettings', JSON.stringify(settings));
                window.location.href = 'html/quiz.html';
        }
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

        const regions = {
            'eu': 'Europe',
            'na': 'North America', 
            'sa': 'South America',
            'as': 'Asia',
            'af': 'Africa',
            'oc': 'Oceania'
        };

        Object.keys(regions).forEach(regionCode => {
            if (CountryData[regionCode]) {
                const accordionItem = createAccordionItem(regionCode, regions[regionCode]);
                container.appendChild(accordionItem);
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
    // Create countries array from CountryData if it doesn't exist
    if (typeof countries === 'undefined') {
        window.countries = [];
        Object.keys(CountryData).forEach(regionCode => {
            CountryData[regionCode].forEach(country => {
                window.countries.push({...country, region: regionCode});
            });
        });
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
    document.getElementById('speed-answer').focus();
    
    // Allow Enter key to submit
    document.getElementById('speed-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkSpeedAnswer();
        }
    });
}

function checkSpeedAnswer() {
    const speedData = window.speedRoundData;
    const userAnswer = document.getElementById('speed-answer').value.toLowerCase().trim();
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
                <span class="fi fi-${country.code}"></span>
            </div>
            <h3>Type the name of this country:</h3>
            <input type="text" id="fill-blank-answer" placeholder="Country name..." autocomplete="off">
            <button onclick="checkFillInBlankAnswer()" class="submit-answer">Submit</button>
            <div class="hint-section">
                <button onclick="showHint()" class="hint-button">Need a hint?</button>
                <div id="hint-text" style="display: none; margin-top: 10px; color: var(--accent-color);"></div>
            </div>
        </div>
    `;
    
    // Auto-focus input
    document.getElementById('fill-blank-answer').focus();
    
    // Allow Enter key to submit
    document.getElementById('fill-blank-answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkFillInBlankAnswer();
        }
    });
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
    const userAnswer = document.getElementById('fill-blank-answer').value.toLowerCase().trim();
    const correctAnswer = quiz.countries[quiz.currentIndex].name.toLowerCase();
    
    // Check for exact match or close match
    const isCorrect = userAnswer === correctAnswer || 
                     correctAnswer.includes(userAnswer) && userAnswer.length > 3 ||
                     userAnswer.includes(correctAnswer.split(' ')[0].toLowerCase());
    
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
        showFillInBlankQuestion();
    }, 2000);
}

function endFillInBlankQuiz() {
    const quiz = window.fillInBlankQuiz;
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="quiz-results">
            <h2>Fill in the Blank Quiz Complete!</h2>
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