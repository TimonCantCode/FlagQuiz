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
        
        if (mode === 'learn') {
            settings.classList.add('learn-mode');
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
        // Get selected settings
        const region = document.getElementById('region').value;
        const includeTerritory = document.getElementById('territory').checked;
        const includeCapital = document.getElementById('capital').checked;
        const includeCurrency = document.getElementById('currency').checked;
        
        console.log('Starting learning mode with settings:', {
            region,
            includeTerritory,
            includeCapital,
            includeCurrency
        });
        
        // Store settings in sessionStorage to pass to learn page
        sessionStorage.setItem('learningSettings', JSON.stringify({
            region,
            includeTerritory,
            includeCapital,
            includeCurrency
        }));
        
        // Navigate to learn page
        window.location.href = 'html/learn.html';
    }
    
    function startQuiz() {
        // Get selected settings
        const region = document.getElementById('region').value;
        const quizType = document.getElementById('quiz-type').value;
        const questionCount = document.getElementById('question-count').value;
        const includeTerritory = document.getElementById('territory').checked;
        const includeCapital = document.getElementById('capital').checked;
        const includeCurrency = document.getElementById('currency').checked;
        
        console.log('Starting quiz mode with settings:', {
            region,
            quizType,
            questionCount,
            includeTerritory,
            includeCapital,
            includeCurrency
        });
        
        // Store settings in sessionStorage to pass to quiz page
        sessionStorage.setItem('quizSettings', JSON.stringify({
            region,
            quizType,
            questionCount,
            includeTerritory,
            includeCapital,
            includeCurrency
        }));
        
        // Navigate to quiz page
        window.location.href = 'html/quiz.html';
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