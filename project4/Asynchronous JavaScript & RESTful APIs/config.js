// ============================================
// API CONFIGURATION
// ============================================

const CONFIG = {
    API_KEY: "04b187566fee895172e03e70104cabeb",
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    DEFAULT_CITY: 'Dehardun',
    DEFAULT_UNIT: 'metric',


    // Weather Icon Base URL
    ICON_BASE_URL: 'https://openweathermap.org/img/wn',

    // LocalStorage Keys
    STORAGE_KEYS:{
        RECENT_SEARCHES: 'weatherAppRecentSearches',
        LAST_CITY: 'weatherAppLastCity',
        UNIT_PREFERENCE: 'weatherAppUnitPreference'
    },
    // Limits
    MAX_RECENT_SEARCHES: 5
};
// Validate API key
if (CONFIG.API_KEY === '04b187566fee895172e03e70104cabeb') {
    console.warn('⚠️ Please add your OpenWeather API key in config.js');
    console.warn('Get your free API key from: https://openweathermap.org/api');
}
