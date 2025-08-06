document.addEventListener('DOMContentLoaded', function() {
    // Get settings from sessionStorage
    try {
        const settingsData = sessionStorage.getItem('quizSettings');
        
        if (!settingsData) {
            // If no settings found, redirect back to main page
            window.location.href = '../index.html';
            return;
        }

        const settings = JSON.parse(settingsData);
        
        // Initialize quiz content based on settings
        initializeQuiz(settings);
    } catch (error) {
        console.error('Failed to load quiz settings:', error);
        window.location.href = '../index.html';
    }
});

let currentQuiz = {
    countries: [],
    currentQuestion: 0,
    score: 0,
    totalQuestions: 0,
    settings: null,
    userAnswers: []
};

function initializeQuiz(settings) {
    currentQuiz.settings = settings;
    const container = document.querySelector('.quiz-container');
    
    // Clear existing content
    container.innerHTML = `
        <div class="quiz-header">
            <h2>Quiz Mode - ${getRegionName(settings.region)}</h2>
            <button class="back-button" onclick="goBack()">← Back to Menu</button>
        </div>
        <div class="quiz-setup">
            <div class="quiz-info">
                <h3>Quiz Settings:</h3>
                <div class="quiz-settings-display">
                    <p><strong>Region:</strong> ${getRegionName(settings.region)}</p>
                    <p><strong>Quiz Type:</strong> ${getQuizTypeName(settings.quizType)}</p>
                    <p><strong>Questions:</strong> ${settings.questionCount === 'all' ? 'All Available' : settings.questionCount}</p>
                    <div class="quiz-includes">
                        <p><strong>Includes:</strong></p>
                        <ul>
                            <li>Country Flags</li>
                            ${settings.includeTerritory ? '<li>Territories</li>' : ''}
                            ${settings.includeCapital ? '<li>Capital Cities</li>' : ''}
                            ${settings.includeCurrency ? '<li>Currencies</li>' : ''}
                        </ul>
                    </div>
                </div>
                <button class="start-quiz-btn" onclick="startQuiz()">Start Quiz</button>
            </div>
        </div>
        <div class="quiz-content" id="quiz-content" style="display: none;">
            <!-- Quiz questions will be loaded here -->
        </div>
    `;
}

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

function getQuizTypeName(quizType) {
    const types = {
        'multiple-choice': 'Multiple Choice',
        'fill-in-the-blank': 'Fill in the Blank'
    };
    return types[quizType] || 'Unknown Type';
}

function startQuiz() {
    // Get countries for the quiz
    currentQuiz.countries = getCountriesByRegion(currentQuiz.settings.region);
    
    // Shuffle countries for random order
    currentQuiz.countries = shuffleArray([...currentQuiz.countries]);
    
    // Generate questions based on settings
    currentQuiz.questions = generateQuestions(currentQuiz.countries, currentQuiz.settings);
    currentQuiz.totalQuestions = currentQuiz.questions.length;
    currentQuiz.currentQuestion = 0;
    currentQuiz.score = 0;
    currentQuiz.userAnswers = [];
    
    // Hide setup and show quiz content
    document.querySelector('.quiz-setup').style.display = 'none';
    document.getElementById('quiz-content').style.display = 'block';
    
    // Show first question
    showQuestion();
}

function generateQuestions(countries, settings) {
    const questions = [];
    const questionTypes = ['flag-to-country'];
    
    // Add question types based on settings
    if (settings.includeCapital) {
        questionTypes.push('capital-to-country', 'country-to-capital');
    }
    
    if (settings.includeCurrency) {
        questionTypes.push('currency-to-country', 'country-to-currency');
    }
    
    // Generate questions for each country
    countries.forEach(country => {
        questionTypes.forEach(type => {
            questions.push(createQuestion(country, type, countries, settings));
        });
    });
    
    // Shuffle questions
    const shuffledQuestions = shuffleArray(questions);
    
    // Limit questions based on user selection
    let questionLimit;
    if (settings.questionCount === 'all') {
        questionLimit = shuffledQuestions.length;
    } else {
        questionLimit = parseInt(settings.questionCount);
    }
    
    return shuffledQuestions.slice(0, Math.min(questionLimit, shuffledQuestions.length));
}

function createQuestion(country, type, allCountries, settings) {
    const question = {
        country: country,
        type: type,
        correctAnswer: '',
        options: [],
        questionText: ''
    };
    
    switch (type) {
        case 'flag-to-country':
            question.questionText = 'Which country does this flag belong to?';
            question.correctAnswer = country.name;
            question.flagCode = country.code;
            break;
            
        case 'capital-to-country':
            question.questionText = `Which country has ${country.capital} as its capital?`;
            question.correctAnswer = country.name;
            break;
            
        case 'country-to-capital':
            question.questionText = `What is the capital of ${country.name}?`;
            question.correctAnswer = country.capital;
            break;
            
        case 'currency-to-country':
            question.questionText = `Which country uses ${country.currency} as its currency?`;
            question.correctAnswer = country.name;
            break;
            
        case 'country-to-currency':
            question.questionText = `What currency does ${country.name} use?`;
            question.correctAnswer = country.currency;
            break;
    }
    
    // Generate options for multiple choice
    if (settings.quizType === 'multiple-choice') {
        question.options = generateMultipleChoiceOptions(question, allCountries);
    }
    
    return question;
}

function generateMultipleChoiceOptions(question, allCountries) {
    const options = [question.correctAnswer];
    const otherCountries = allCountries.filter(c => c.name !== question.country.name);
    
    // Add 3 wrong options
    while (options.length < 4 && otherCountries.length > 0) {
        const randomCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
        let wrongAnswer = '';
        
        switch (question.type) {
            case 'flag-to-country':
            case 'capital-to-country':
            case 'currency-to-country':
                wrongAnswer = randomCountry.name;
                break;
            case 'country-to-capital':
                wrongAnswer = randomCountry.capital;
                break;
            case 'country-to-currency':
                wrongAnswer = randomCountry.currency;
                break;
        }
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
        
        // Remove to avoid infinite loop
        otherCountries.splice(otherCountries.indexOf(randomCountry), 1);
    }
    
    return shuffleArray(options);
}

function showQuestion() {
    if (currentQuiz.currentQuestion >= currentQuiz.totalQuestions) {
        showResults();
        return;
    }
    
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    const quizContent = document.getElementById('quiz-content');
    
    let questionHTML = `
        <div class="question-container">
            <div class="question-header">
                <span class="question-number">Question ${currentQuiz.currentQuestion + 1} of ${currentQuiz.totalQuestions}</span>
                <span class="score">Score: ${currentQuiz.score}/${currentQuiz.currentQuestion}</span>
            </div>
            
            <div class="question">
                <h3>${question.questionText}</h3>
                ${question.flagCode ? `<div class="question-flag"><span class="fi fi-${question.flagCode}"></span></div>` : ''}
                ${currentQuiz.settings.quizType === 'multiple-choice' ? '<div class="keyboard-hint">💡 Use number keys 1-4 or click to select</div>' : ''}
            </div>
            
            <div class="answer-section" id="answer-section">
    `;
    
    if (currentQuiz.settings.quizType === 'multiple-choice') {
        questionHTML += '<div class="multiple-choice-options">';
        question.options.forEach((option, index) => {
            questionHTML += `
                <button class="option-btn" onclick="selectAnswer('${option}')" data-option="${option}" tabindex="${index + 1}">${option}</button>
            `;
        });
        questionHTML += '</div>';
    } else {
        questionHTML += `
            <div class="fill-in-blank">
                <input type="text" id="answer-input" placeholder="Enter your answer..." onkeypress="handleEnterKey(event)">
                <button class="submit-answer-btn" onclick="submitAnswer()">Submit Answer</button>
            </div>
        `;
    }
    
    questionHTML += `
            </div>
        </div>
    `;
    
    quizContent.innerHTML = questionHTML;
    
    // Add keyboard navigation for multiple choice
    if (currentQuiz.settings.quizType === 'multiple-choice') {
        setupMultipleChoiceKeyboard();
    }
    
    // Focus on input for fill-in-the-blank
    if (currentQuiz.settings.quizType === 'fill-in-the-blank') {
        setTimeout(() => {
            document.getElementById('answer-input').focus();
        }, 100);
    }
}

function setupMultipleChoiceKeyboard() {
    const buttons = document.querySelectorAll('.option-btn');
    
    // Add keyboard listener for number keys (1-4)
    const handleMultipleChoiceKeys = (event) => {
        const key = event.key;
        
        // Check if it's a number key 1-4
        if (key >= '1' && key <= '4') {
            const index = parseInt(key) - 1;
            if (index < buttons.length) {
                event.preventDefault();
                buttons[index].click();
                // Remove listener after selection
                document.removeEventListener('keypress', handleMultipleChoiceKeys);
            }
        }
    };
    
    document.addEventListener('keypress', handleMultipleChoiceKeys);
    
    // Focus on first button for better keyboard navigation
    if (buttons.length > 0) {
        buttons[0].focus();
    }
}

function selectAnswer(answer) {
    // Disable all option buttons
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    // Highlight selected answer
    buttons.forEach(btn => {
        if (btn.textContent === answer) {
            btn.classList.add('selected');
        }
    });
    
    checkAnswer(answer);
}

function submitAnswer() {
    const answer = document.getElementById('answer-input').value.trim();
    if (!answer) {
        alert('Please enter an answer!');
        return;
    }
    
    document.getElementById('answer-input').disabled = true;
    document.querySelector('.submit-answer-btn').disabled = true;
    
    checkAnswer(answer);
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        submitAnswer();
    }
}

function checkAnswer(userAnswer) {
    const question = currentQuiz.questions[currentQuiz.currentQuestion];
    const isCorrect = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
    
    if (isCorrect) {
        currentQuiz.score++;
    }
    
    currentQuiz.userAnswers.push({
        question: question,
        userAnswer: userAnswer,
        correct: isCorrect
    });
    
    // Show feedback
    showAnswerFeedback(isCorrect, question.correctAnswer);
}

function showAnswerFeedback(isCorrect, correctAnswer) {
    const answerSection = document.getElementById('answer-section');
    
    const feedbackHTML = `
        <div class="answer-feedback ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="feedback-message">
                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                ${!isCorrect ? `<br>The correct answer is: <strong>${correctAnswer}</strong>` : ''}
            </div>
            <button class="next-question-btn" onclick="nextQuestion()" id="next-btn">
                ${currentQuiz.currentQuestion + 1 >= currentQuiz.totalQuestions ? 'View Results' : 'Next Question'}
            </button>
        </div>
    `;
    
    answerSection.innerHTML += feedbackHTML;
    
    // Focus on the next button for immediate Enter key access
    setTimeout(() => {
        document.getElementById('next-btn').focus();
        
        // Add global Enter key listener for next question
        const handleNextQuestionEnter = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                nextQuestion();
                // Remove this specific listener after use
                document.removeEventListener('keypress', handleNextQuestionEnter);
            }
        };
        
        document.addEventListener('keypress', handleNextQuestionEnter);
    }, 100);
}

function nextQuestion() {
    currentQuiz.currentQuestion++;
    showQuestion();
}

function showResults() {
    const quizContent = document.getElementById('quiz-content');
    const percentage = Math.round((currentQuiz.score / currentQuiz.totalQuestions) * 100);
    
    let grade = '';
    if (percentage >= 90) grade = 'Excellent!';
    else if (percentage >= 80) grade = 'Great job!';
    else if (percentage >= 70) grade = 'Good work!';
    else if (percentage >= 60) grade = 'Not bad!';
    else grade = 'Keep practicing!';
    
    quizContent.innerHTML = `
        <div class="quiz-results">
            <h2>Quiz Complete!</h2>
            <div class="score-display">
                <div class="final-score">${currentQuiz.score} / ${currentQuiz.totalQuestions}</div>
                <div class="percentage">${percentage}%</div>
                <div class="grade">${grade}</div>
            </div>
            
            <div class="results-actions">
                <button class="restart-quiz-btn" onclick="restartQuiz()" id="restart-btn" tabindex="1">Take Quiz Again</button>
                <button class="back-button" onclick="goBack()" tabindex="2">Back to Menu</button>
            </div>
            
            <div class="detailed-results">
                <h3>Review Your Answers:</h3>
                <div class="answers-review">
                    ${currentQuiz.userAnswers.map((answer, index) => `
                        <div class="answer-review ${answer.correct ? 'correct' : 'incorrect'}">
                            <span class="question-num">Q${index + 1}:</span>
                            <span class="question-text">${answer.question.questionText}</span>
                            <span class="answer-comparison">
                                Your answer: <strong>${answer.userAnswer}</strong>
                                ${!answer.correct ? `<br>Correct answer: <strong>${answer.question.correctAnswer}</strong>` : ''}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Focus on restart button and add keyboard navigation
    setTimeout(() => {
        document.getElementById('restart-btn').focus();
        
        // Add keyboard listener for results page
        const handleResultsKeys = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                // Default action is restart quiz (focused button)
                if (document.activeElement.id === 'restart-btn') {
                    restartQuiz();
                } else {
                    goBack();
                }
                document.removeEventListener('keypress', handleResultsKeys);
            } else if (event.key === '1') {
                event.preventDefault();
                restartQuiz();
                document.removeEventListener('keypress', handleResultsKeys);
            } else if (event.key === '2') {
                event.preventDefault();
                goBack();
                document.removeEventListener('keypress', handleResultsKeys);
            }
        };
        
        document.addEventListener('keypress', handleResultsKeys);
    }, 100);
}

function restartQuiz() {
    currentQuiz.currentQuestion = 0;
    currentQuiz.score = 0;
    currentQuiz.userAnswers = [];
    
    // Shuffle questions for variety
    currentQuiz.questions = shuffleArray([...currentQuiz.questions]);
    
    showQuestion();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function goBack() {
    // Clean up any active event listeners before navigation
    cleanupEventListeners();
    sessionStorage.removeItem('quizSettings');
    window.location.href = '../index.html';
}

// Global event listener cleanup function
function cleanupEventListeners() {
    // Remove any remaining global event listeners
    const existingHandlers = ['handleMultipleChoiceKeys', 'handleNextQuestionEnter', 'handleResultsKeys'];
    existingHandlers.forEach(handlerName => {
        if (window[handlerName]) {
            document.removeEventListener('keypress', window[handlerName]);
        }
    });
}
