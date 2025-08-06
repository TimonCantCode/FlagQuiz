document.addEventListener('DOMContentLoaded', function() {
    // Get settings from sessionStorage
    try {
        const settingsData = sessionStorage.getItem('learningSettings');
        
        if (!settingsData) {
            // If no settings found, redirect back to main page
            window.location.href = '../index.html';
            return;
        }

        const settings = JSON.parse(settingsData);
        
        // Initialize enhanced learning content based on settings
        initializeEnhancedLearning(settings);
    } catch (error) {
        console.error('Failed to load learning settings:', error);
        window.location.href = '../index.html';
    }
});

function initializeEnhancedLearning(settings) {
    const container = document.querySelector('.learning-container');
    
    // Clear existing content
    container.innerHTML = `
        <div class="learning-header">
            <h2>Enhanced Learning Mode - ${getRegionName(settings.region)}</h2>
            <button class="back-button" onclick="goBack()">← Back to Menu</button>
        </div>
        <div class="learning-content">
            <div class="learning-options-enhanced">
                ${createLearningModeCards(settings)}
            </div>
            <div class="study-stats" id="study-stats" style="display: none;">
                <!-- Study statistics will be populated here -->
            </div>
            <div class="country-cards" id="country-cards">
                <!-- Country cards will be loaded here -->
            </div>
        </div>
    `;
    
    // Initialize enhanced learning instance
    window.enhancedLearning = new EnhancedLearning();
    
    // Load countries based on region and difficulty
    loadEnhancedCountries(settings);
}

function createLearningModeCards(settings) {
    const quizType = settings.quizType;
    let cards = '';
    
    // Different learning mode options
    const modes = [
        {
            id: 'browse',
            title: 'Browse & Explore',
            description: 'Explore flags with detailed information and facts',
            active: ['multiple-choice', 'fill-in-the-blank', 'flag-to-country', 'country-to-flag'].includes(quizType)
        },
        {
            id: 'partial-challenge',
            title: 'Partial Flag Challenge',
            description: 'Identify countries from partially hidden flags',
            active: quizType === 'partial-flag'
        },
        {
            id: 'speed-mode',
            title: 'Speed Learning',
            description: 'Quick-fire flag identification practice',
            active: quizType === 'speed-round'
        },
        {
            id: 'similar-flags',
            title: 'Similar Flags Comparison',
            description: 'Learn to distinguish between similar-looking flags',
            active: settings.similarFlags
        }
    ];
    
    modes.forEach(mode => {
        if (mode.active) {
            cards += `
                <div class="learning-option-card" onclick="activateLearningMode('${mode.id}')">
                    <h4>${mode.title}</h4>
                    <p>${mode.description}</p>
                </div>
            `;
        }
    });
    
    return cards;
}

function activateLearningMode(mode) {
    const settings = JSON.parse(sessionStorage.getItem('learningSettings'));
    const countries = getCountriesByRegion(settings.region);
    const filteredCountries = window.enhancedLearning.getFlagsByDifficulty(countries, settings.difficulty);
    
    switch(mode) {
        case 'browse':
            showBrowseMode(filteredCountries, settings);
            break;
        case 'partial-challenge':
            showPartialFlagChallenge(filteredCountries, settings);
            break;
        case 'speed-mode':
            showSpeedLearningMode(filteredCountries, settings);
            break;
        case 'similar-flags':
            showSimilarFlagsMode(filteredCountries, settings);
            break;
    }
}

function showBrowseMode(countries, settings) {
    const container = document.getElementById('country-cards');
    container.innerHTML = '<h3>Country Information Browser</h3>';
    
    // Display study stats
    document.getElementById('study-stats').style.display = 'block';
    displayStudyStats(window.enhancedLearning.getStudyStats());
    
    countries.forEach(country => {
        const card = createEnhancedCountryCard(country, settings);
        container.appendChild(card);
    });
}

function showPartialFlagChallenge(countries, settings) {
    const container = document.getElementById('country-cards');
    container.innerHTML = `
        <div class="partial-flag-game">
            <h3>Partial Flag Challenge</h3>
            <div class="game-controls">
                <button onclick="startPartialFlagGame()" class="start-game-btn">Start Challenge</button>
                <div class="game-stats">
                    <span id="partial-score">Score: 0</span>
                    <span id="partial-total">Total: 0</span>
                </div>
            </div>
            <div id="partial-flag-container">
                <p>Click "Start Challenge" to begin the partial flag identification game!</p>
            </div>
        </div>
    `;
    
    // Store countries for the game
    window.partialFlagCountries = countries.slice(0, 20); // Limit for game
}

function showSpeedLearningMode(countries, settings) {
    const container = document.getElementById('country-cards');
    container.innerHTML = `
        <div class="speed-learning-mode">
            <h3>Speed Learning Mode</h3>
            <div class="speed-controls">
                <button onclick="startSpeedLearning()" class="start-speed-btn">Start Speed Round</button>
                <div class="speed-timer" id="speed-timer">30</div>
                <div class="speed-score" id="speed-score">Score: 0/0</div>
            </div>
            <div id="speed-flag-container">
                <p>Ready for a quick-fire flag learning session?</p>
            </div>
        </div>
    `;
    
    // Store countries for speed learning
    window.speedLearningCountries = countries;
}

function showSimilarFlagsMode(countries, settings) {
    const container = document.getElementById('country-cards');
    container.innerHTML = '<h3>Similar Flags Comparison</h3>';
    
    // Group countries by similar flags
    const similarGroups = groupSimilarFlags(countries);
    
    similarGroups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'similar-flags-group';
        groupDiv.innerHTML = `
            <h4>Similar Flag Group</h4>
            <div class="flag-comparison">
                ${group.map(country => `
                    <div class="flag-comparison-item">
                        <span class="fi fi-${country.code}"></span>
                        <p>${country.name}</p>
                        ${country.flagFacts ? `<small>${country.flagFacts}</small>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(groupDiv);
    });
}

function createEnhancedCountryCard(country, settings) {
    const card = document.createElement('div');
    card.className = 'country-card enhanced';
    
    card.innerHTML = `
        <div class="flag-container">
            <span class="fi fi-${country.code}"></span>
        </div>
        <div class="country-info">
            <h4>${country.name}</h4>
            ${settings.pronunciation && country.pronunciation ? `
                <div class="pronunciation">
                    <span>🔊 ${country.pronunciation}</span>
                    <button onclick="speakCountryName('${country.name}')" class="pronunciation-btn">Play</button>
                </div>
            ` : ''}
            <div class="country-details">
                <p><strong>Capital:</strong> ${country.capital}</p>
                <p><strong>Currency:</strong> ${country.currency}</p>
                ${country.population ? `<p><strong>Population:</strong> ${country.population}</p>` : ''}
                ${country.language ? `<p><strong>Language:</strong> ${country.language}</p>` : ''}
            </div>
            ${settings.flagDetails && country.flagFacts ? `
                <div class="flag-facts">
                    <h5>Flag Facts</h5>
                    <p>${country.flagFacts}</p>
                </div>
            ` : ''}
            ${country.similarFlags && country.similarFlags.length > 0 && settings.similarFlags ? `
                <div class="similar-flags">
                    <h5>Similar Flags</h5>
                    <div class="similar-flags-container">
                        ${country.similarFlags.map(code => `<span class="fi fi-${code}" title="Similar flag"></span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
        <div class="card-actions">
            <button onclick="markAsStudied('${country.code}')" class="studied-btn">Mark as Studied</button>
            ${settings.spacedRepetition ? `<button onclick="addToReview('${country.code}')" class="review-btn">Add to Review</button>` : ''}
        </div>
    `;
    
    return card;
}

function groupSimilarFlags(countries) {
    const groups = [];
    const processed = new Set();
    
    countries.forEach(country => {
        if (!processed.has(country.code) && country.similarFlags && country.similarFlags.length > 0) {
            const group = [country];
            processed.add(country.code);
            
            country.similarFlags.forEach(similarCode => {
                const similarCountry = countries.find(c => c.code === similarCode);
                if (similarCountry && !processed.has(similarCode)) {
                    group.push(similarCountry);
                    processed.add(similarCode);
                }
            });
            
            if (group.length > 1) {
                groups.push(group);
            }
        }
    });
    
    return groups;
}

// Helper functions
function getRegionName(regionCode) {
    const regions = {
        'eu': 'Europe',
        'na': 'North America',
        'sa': 'South America',
        'as': 'Asia',
        'af': 'Africa',
        'oc': 'Oceania',
        'wrld': 'World'
    };
    return regions[regionCode] || 'Unknown Region';
}

function loadEnhancedCountries(settings) {
    // This function loads countries and sets up the initial learning mode
    // The actual loading is handled by activateLearningMode which is called when users click mode cards
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
    `;
}

function markAsStudied(countryCode) {
    window.enhancedLearning.updateFlagDifficulty(countryCode, true, 5000);
    
    // Visual feedback
    const card = event.target.closest('.country-card');
    card.style.opacity = '0.7';
    event.target.textContent = 'Studied!';
    event.target.disabled = true;
    
    // Update stats
    displayStudyStats(window.enhancedLearning.getStudyStats());
}

function addToReview(countryCode) {
    // Add to spaced repetition review queue
    window.enhancedLearning.updateFlagDifficulty(countryCode, false, 5000);
    
    // Visual feedback
    const card = event.target.closest('.country-card');
    event.target.textContent = 'Added to Review!';
    event.target.style.background = '#ed8936';
    
    setTimeout(() => {
        event.target.textContent = 'Add to Review';
        event.target.style.background = '';
    }, 2000);
}

function speakCountryName(countryName) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(countryName);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

function goBack() {
    window.location.href = '../index.html';
}
