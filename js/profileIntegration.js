// Profile Integration - Functions to connect quiz results with profile system

// Function to save quiz results to profile
function saveQuizResult(quizData) {
    // Check if profile manager is available
    if (typeof window !== 'undefined' && window.profileManager) {
        window.profileManager.updateQuizStats(quizData);
    } else {
        // Fallback: save to sessionStorage for later processing
        const pendingResults = JSON.parse(sessionStorage.getItem('pendingQuizResults') || '[]');
        pendingResults.push(quizData);
        sessionStorage.setItem('pendingQuizResults', JSON.stringify(pendingResults));
    }
}

// Function to get current user info
function getCurrentUser() {
    const stored = localStorage.getItem('flagQuizUser');
    return stored ? JSON.parse(stored) : null;
}

// Function to check if user is logged in
function isUserLoggedIn() {
    return getCurrentUser() !== null;
}

// Function to process pending quiz results when profile loads
function processPendingResults() {
    const pendingResults = JSON.parse(sessionStorage.getItem('pendingQuizResults') || '[]');
    
    if (pendingResults.length > 0 && window.profileManager) {
        pendingResults.forEach(result => {
            window.profileManager.updateQuizStats(result);
        });
        sessionStorage.removeItem('pendingQuizResults');
    }
}

// Add this to profile.js initialization
document.addEventListener('DOMContentLoaded', () => {
    // Process any pending results when profile loads
    setTimeout(processPendingResults, 100);
});

// Export functions for use in quiz pages
if (typeof window !== 'undefined') {
    window.ProfileIntegration = {
        saveQuizResult,
        getCurrentUser,
        isUserLoggedIn,
        processPendingResults
    };
}
