document.addEventListener('DOMContentLoaded', function() {
    // Get settings from sessionStorage
    const settingsData = sessionStorage.getItem('learningSettings');
    
    if (!settingsData) {
        // If no settings found, redirect back to main page
        window.location.href = '../index.html';
        return;
    }
    
    const settings = JSON.parse(settingsData);
    console.log('Learning mode settings:', settings);
    
    // Initialize learning content based on settings
    initializeLearning(settings);
});

function initializeLearning(settings) {
    const container = document.querySelector('.learning-container');
    
    // Clear existing content
    container.innerHTML = `
        <div class="learning-header">
            <h2>Learning Mode - ${getRegionName(settings.region)}</h2>
            <button class="back-button" onclick="goBack()">← Back to Menu</button>
        </div>
        <div class="learning-content">
            <div class="learning-options">
                <h3>What you'll learn:</h3>
                <ul>
                    <li>Country Flags</li>
                    ${settings.includeTerritory ? '<li>Territories</li>' : ''}
                    ${settings.includeCapital ? '<li>Capital Cities</li>' : ''}
                    ${settings.includeCurrency ? '<li>Currencies</li>' : ''}
                </ul>
            </div>
            <div class="country-cards" id="country-cards">
                <!-- Country cards will be loaded here -->
            </div>
        </div>
    `;
    
    // Load countries based on region
    loadCountries(settings);
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

function loadCountries(settings) {
    // This is where you'll load country data based on the region
    // For now, let's create a sample implementation
    const countries = getCountriesByRegion(settings.region);
    const cardsContainer = document.getElementById('country-cards');
    
    countries.forEach(country => {
        const card = createCountryCard(country, settings);
        cardsContainer.appendChild(card);
    });
}

function createCountryCard(country, settings) {
    const card = document.createElement('div');
    card.className = 'country-card';
    
    let cardContent = `
        <div class="flag-container">
            <span class="fi fi-${country.code}"></span>
        </div>
        <div class="country-info">
            <h3>${country.name}</h3>
    `;
    
    // Add optional information based on settings
    if (settings.includeCapital) {
        cardContent += `<p><strong>Capital:</strong> ${country.capital}</p>`;
    }
    
    if (settings.includeCurrency) {
        cardContent += `<p><strong>Currency:</strong> ${country.currency}</p>`;
    }
    
    cardContent += `
        </div>
    `;
    
    card.innerHTML = cardContent;
    return card;
}

function goBack() {
    // Clear the settings from sessionStorage
    sessionStorage.removeItem('learningSettings');
    // Go back to main page
    window.location.href = '../index.html';
}
