// Enhanced Learning Features
class EnhancedLearning {
    constructor() {
        this.spacedRepetitionData = this.loadSpacedRepetitionData();
        this.studySession = {
            startTime: null,
            flagsStudied: 0,
            correctAnswers: 0,
            difficultFlags: []
        };
    }

    // Spaced Repetition System
    loadSpacedRepetitionData() {
        const data = localStorage.getItem('spacedRepetitionData');
        return data ? JSON.parse(data) : {};
    }

    saveSpacedRepetitionData() {
        localStorage.setItem('spacedRepetitionData', JSON.stringify(this.spacedRepetitionData));
    }

    updateFlagDifficulty(countryCode, wasCorrect, responseTime) {
        if (!this.spacedRepetitionData[countryCode]) {
            this.spacedRepetitionData[countryCode] = {
                attempts: 0,
                correct: 0,
                lastSeen: null,
                difficulty: 1,
                nextReview: Date.now()
            };
        }

        const flagData = this.spacedRepetitionData[countryCode];
        flagData.attempts++;
        flagData.lastSeen = Date.now();
        
        if (wasCorrect) {
            flagData.correct++;
            flagData.difficulty = Math.max(1, flagData.difficulty - 0.1);
            // Increase interval for next review
            flagData.nextReview = Date.now() + (flagData.difficulty * 24 * 60 * 60 * 1000);
        } else {
            flagData.difficulty = Math.min(5, flagData.difficulty + 0.3);
            // Decrease interval for next review
            flagData.nextReview = Date.now() + (flagData.difficulty * 2 * 60 * 60 * 1000);
            this.studySession.difficultFlags.push(countryCode);
        }

        this.saveSpacedRepetitionData();
    }

    getFlagsForReview(countries, maxFlags = 25) {
        const now = Date.now();
        const flagsForReview = [];
        
        countries.forEach(country => {
            const flagData = this.spacedRepetitionData[country.code];
            if (!flagData || flagData.nextReview <= now) {
                flagsForReview.push(country);
            }
        });

        // Sort by difficulty (hardest first) and last seen
        return flagsForReview.sort((a, b) => {
            const aData = this.spacedRepetitionData[a.code] || { difficulty: 1, lastSeen: 0 };
            const bData = this.spacedRepetitionData[b.code] || { difficulty: 1, lastSeen: 0 };
            
            if (aData.difficulty !== bData.difficulty) {
                return bData.difficulty - aData.difficulty;
            }
            return aData.lastSeen - bData.lastSeen;
        }).slice(0, maxFlags);
    }

    // Flashcard Mode
    createFlashcard(country, includeDetails = false) {
        const flashcard = document.createElement('div');
        flashcard.className = 'flashcard';
        flashcard.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="flag-container">
                        <span class="fi fi-${country.code}"></span>
                    </div>
                    <div class="country-name">${country.name}</div>
                    ${includeDetails ? `
                        <div class="country-details">
                            <p><strong>Capital:</strong> ${country.capital}</p>
                            <p><strong>Currency:</strong> ${country.currency}</p>
                            ${country.population ? `<p><strong>Population:</strong> ${country.population}</p>` : ''}
                            ${country.language ? `<p><strong>Language:</strong> ${country.language}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
                <div class="flashcard-back">
                    ${country.flagFacts ? `
                        <div class="flag-facts">
                            <h4>Flag Facts</h4>
                            <p>${country.flagFacts}</p>
                        </div>
                    ` : ''}
                    ${country.pronunciation ? `
                        <div class="pronunciation">
                            <h4>Pronunciation</h4>
                            <p>${country.pronunciation}</p>
                            <button class="pronunciation-btn" onclick="speakCountryName('${country.name}')">🔊</button>
                        </div>
                    ` : ''}
                    ${country.similarFlags && country.similarFlags.length > 0 ? `
                        <div class="similar-flags">
                            <h4>Similar Flags</h4>
                            <div class="similar-flags-container">
                                ${country.similarFlags.map(code => `<span class="fi fi-${code}" title="Similar flag"></span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="flashcard-controls">
                <button class="flip-btn" onclick="flipFlashcard(this)">Flip Card</button>
                <div class="difficulty-buttons" style="display: none;">
                    <button class="easy-btn" onclick="markFlashcard(this, 'easy', '${country.code}')">Easy</button>
                    <button class="medium-btn" onclick="markFlashcard(this, 'medium', '${country.code}')">Medium</button>
                    <button class="hard-btn" onclick="markFlashcard(this, 'hard', '${country.code}')">Hard</button>
                </div>
            </div>
        `;
        return flashcard;
    }

    // Flag Similarity Analysis
    getFlagsByDifficulty(countries, difficulty) {
        switch (difficulty) {
            case 'beginner':
                return countries.filter(c => c.difficulty === 'beginner').slice(0, 20);
            case 'intermediate':
                return countries.filter(c => ['beginner', 'intermediate'].includes(c.difficulty));
            case 'advanced':
                return countries.filter(c => ['intermediate', 'advanced'].includes(c.difficulty));
            case 'expert':
                return countries;
            default:
                return countries;
        }
    }

    // Speed Round Implementation
    createSpeedRound(countries, timeLimit = 30) {
        const speedRound = {
            countries: countries.slice(0, 20), // Limit for speed
            currentIndex: 0,
            score: 0,
            timeRemaining: timeLimit,
            timer: null,
            startTime: Date.now()
        };

        return speedRound;
    }

    // Partial Flag Challenge
    createPartialFlagChallenge(country) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 133;
        
        // This would need actual flag image data to implement properly
        // For now, we'll create a placeholder that covers part of the flag
        const flagElement = document.createElement('div');
        flagElement.className = 'partial-flag-challenge';
        flagElement.innerHTML = `
            <div class="flag-container partial">
                <span class="fi fi-${country.code}"></span>
                <div class="flag-mask"></div>
            </div>
            <p class="challenge-text">Can you identify this country from the partial flag?</p>
        `;
        
        return flagElement;
    }

    // Study Statistics
    getStudyStats() {
        const stats = {
            totalFlags: Object.keys(this.spacedRepetitionData).length,
            averageAccuracy: 0,
            difficultFlags: [],
            masteredFlags: [],
            studyStreak: this.getStudyStreak()
        };

        let totalAttempts = 0;
        let totalCorrect = 0;

        Object.entries(this.spacedRepetitionData).forEach(([code, data]) => {
            totalAttempts += data.attempts;
            totalCorrect += data.correct;
            
            const accuracy = data.attempts > 0 ? (data.correct / data.attempts) : 0;
            
            if (accuracy < 0.5 && data.attempts >= 3) {
                stats.difficultFlags.push(code);
            } else if (accuracy >= 0.9 && data.attempts >= 5) {
                stats.masteredFlags.push(code);
            }
        });

        stats.averageAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) : 0;
        return stats;
    }

    getStudyStreak() {
        const studyDates = localStorage.getItem('studyDates');
        if (!studyDates) return 0;
        
        const dates = JSON.parse(studyDates);
        const today = new Date().toDateString();
        
        if (!dates.includes(today)) {
            dates.push(today);
            localStorage.setItem('studyDates', JSON.stringify(dates));
        }

        // Calculate consecutive days
        let streak = 0;
        const sortedDates = dates.sort((a, b) => new Date(b) - new Date(a));
        
        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);
            
            if (date.toDateString() === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
}

// Global functions for flashcard interactions
function flipFlashcard(button) {
    const flashcard = button.closest('.flashcard');
    flashcard.classList.toggle('flipped');
    
    const controls = flashcard.querySelector('.difficulty-buttons');
    if (flashcard.classList.contains('flipped')) {
        controls.style.display = 'flex';
        button.textContent = 'Next Card';
    } else {
        controls.style.display = 'none';
        button.textContent = 'Flip Card';
    }
}

function markFlashcard(button, difficulty, countryCode) {
    const enhancedLearning = window.currentEnhancedLearning || new EnhancedLearning();
    const wasCorrect = difficulty === 'easy';
    const responseTime = 5000; // Approximate time for flashcard
    
    enhancedLearning.updateFlagDifficulty(countryCode, wasCorrect, responseTime);
    
    // Move to next flashcard
    const flashcard = button.closest('.flashcard');
    flashcard.style.opacity = '0';
    setTimeout(() => {
        // Advance to next card using the skip function
        if (typeof skipFlashcard === 'function') {
            skipFlashcard();
        }
    }, 300);
}

function speakCountryName(countryName) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(countryName);
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.EnhancedLearning = EnhancedLearning;
}
