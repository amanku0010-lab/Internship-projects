// ============================================
// WEATHER APP - PRODUCTION READY CODE
// ============================================

// ============================================
// APP STATE
// ============================================
let appState = {
  currentCity: null,
  currentUnit: "metric",
  recentSearches: [],
  weatherData: null,
  forecastdata: null,
};

// ============================================
// DOM ELEMENTS
// ============================================

// Search Elements
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locationBtn = document.getElementById("location-btn");
const unitToggle = document.getElementById("unit-toggle");
const unitDisplay = document.getElementById("unit-display");
const suggestions = document.getElementById("suggestions");
// Display Elements
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const weatherDisplay = document.getElementById("weather-display");
// Current Weather Elements
const cityName = document.getElementById("city-name");
const dateTime = document.getElementById("date-time");
const weatherIcon = document.getElementById("weather-icon");
const tempDisplay = document.getElementById("temp-display");
const feelsLike = document.getElementById("feels-like");
const weatherDesc = document.getElementById("weather-desc");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
// Forecast Elements
const forecastContainer = document.getElementById("forecast-container");
const hourlyContainer = document.getElementById("hourly-container");
// Recent Searches
const recentSearchesSection = document.getElementById(
  "recent-searches-section"
);
const recentList = document.getElementById("recent-list");
const clearHistory = document.getElementById("clear-history");
// Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toast-message");
// ============================================
// API FUNCTIONS
// ============================================
async function fetchWeatherByCity(city) {
  try {
    const url = `${CONFIG.BASE_URL}/weather?q=${encodeURIComponent(
      city
    )}&appid=${CONFIG.API_KEY}&units=${appState.currentUnit}`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Please check the spelling");
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Please check your configuration.");
      } else {
        throw new Error("Failed to fetch weather data. Please try again.");
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather", error);
    throw error;
  }
}

async function fetchWeatherByCoords(lat, lon) {
  try {
    const url = `${CONFIG.BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${appState.currentUnit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch weather data for your location.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather by coords:", error);
    throw error;
  }
}

async function fetchForecast(city) {
  try {
    const url = `${CONFIG.BASE_URL}/forecast?q=${encodeURIComponent(
      city
    )}&appid=${CONFIG.API_KEY}&units=${appState.currentUnit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch forecast data.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}

async function fetchForecastByCoords(lat, lon) {
  try {
    const url = `${CONFIG.BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}&units=${appState.currentUnit}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch forecast data.");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    throw error;
  }
}
// ============================================
// WEATHER DISPLAY FUNCTIONS
// ============================================
function displayWeather(data) {
  //Store data
  appState.weatherData = data;
  appState.currentCity = data.name;

  // Update city name
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  // Update date/time
  const now = new Date();
  dateTime.textContent = formatDateTime(now);
  // Update weather icon
  const iconCode = data.weather[0].icon;
  weatherIcon.src = `${CONFIG.ICON_BASE_URL}/${iconCode}@4x.png`;
  weatherIcon.lat = data.weather[0].description;
  // Update temperature
  const temp = Math.round(data.main.temp);
  const feels = Math.round(data.main.feels_like);
  const unit = appState.currentUnit === "metric" ? "°C" : "°F";

  tempDisplay.textContent = `${temp}${unit}`;
  feelsLike.textContent = `Feels like ${feels}${unit}`;
  // Update description
  weatherDesc.textContent = data.weather[0].description;
  // Update details
  humidity.textContent = `${data.main.humidity}%`;

  const windSpeedValue =
    appState.currentUnit === "metric"
      ? `${Math.round(data.wind.speed * 3.6)} km/h`
      : `${Math.round(data.wind.speed)} mph`;
  windSpeed.textContent = windSpeedValue;

  pressure.textContent = `${data.main.pressure} hpa`;

  const visibilityKm = (data.visibility / 1000).toFixed(1);
  visibility.textContent = `${visibilityKm} km`;
  // Update sunrise/sunset
  sunrise.textContent = formatTime(data.sys.sunrise);
  sunset.textContent = formatTime(data.sys.sunset);

  // Change background based on weather
  updateBackground(data.weather[0].main, data.weather[0].icon);
  // Show weather display
  hideLoading();
  hideError();
  weatherDisplay.style.display = "block";

  // Add to recent searches
  addToRecentSearches(data.name);

  // Save last city
  saveLastCity(data.name);
}

function displayForecast(data){
    appState.forecastdata = data;
     // Group forecast by day
     const dailyForecasts = groupForecastByDay(data.list);

     //Clear container
     forecastContainer.innerHTML = '';

    //  display first 5 days
    dailyForecasts.slice(0, 5).forEach(day => {
        const card = createForecastCard(day);
        forecastContainer.appendChild(card);
    });

    // Display hourly forecast (next 24 hours)
    displayHourlyForecast(data.list.slice(0, 8)); // 8 x 3 hours = 24 hours
}

function displayHourlyForecast(hourlyDate){
    hourlyContainer.innerHTML = '';

    hourlyDate.forEach(hour =>{
        const card = createHourlyCard(hour);
        hourlyContainer.appendChild(card);
    });
}


function groupForecastByDay(list) {
    const grouped = {};
    
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = {
                date: date,
                temps: [],
                weather: item.weather[0],
                icon: item.weather[0].icon
            };
        }
        
        grouped[dateKey].temps.push(item.main.temp);
    });
    
    // Convert to array and calculate avg temp
    return Object.values(grouped).map(day => ({
        date: day.date,
        temp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length),
        tempMin: Math.round(Math.min(...day.temps)),
        tempMax: Math.round(Math.max(...day.temps)),
        weather: day.weather,
        icon: day.icon
    }));
}


function createForecastCard(day) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const dayName = formatDayName(day.date);
    const unit = appState.currentUnit === 'metric' ? '°C' : '°F';
    
    card.innerHTML = `
        <div class="forecast-day">${dayName}</div>
        <div class="forecast-icon">
            <img src="${CONFIG.ICON_BASE_URL}/${day.icon}@2x.png" alt="${day.weather.description}">
        </div>
        <div class="forecast-temp">${day.temp}${unit}</div>
        <div class="forecast-range" style="font-size: 0.85rem; color: var(--text-secondary);">
            ${day.tempMin}° / ${day.tempMax}°
        </div>
    `;
    
    return card;
}


function createHourlyCard(hour) {
    const card = document.createElement('div');
    card.className = 'hourly-card';
    
    const time = formatTime(hour.dt);
    const temp = Math.round(hour.main.temp);
    const unit = appState.currentUnit === 'metric' ? '°C' : '°F';
    
    card.innerHTML = `
        <div class="hourly-time">${time}</div>
        <div class="hourly-icon">
            <img src="${CONFIG.ICON_BASE_URL}/${hour.weather[0].icon}@2x.png" alt="${hour.weather[0].description}">
        </div>
        <div class="hourly-temp">${temp}${unit}</div>
    `;
    
    return card;
}



// ============================================
// SEARCH FUNCTIONS
// ============================================

async function searchWeather(city) {
    if (!city || city.trim() === '') {
        showError('Please enter a city name');
        return;
    }
    
    showLoading();
    
    try {
        // Fetch current weather
        const weatherData = await fetchWeatherByCity(city);
        displayWeather(weatherData);
        
        // Fetch forecast
        const forecastData = await fetchForecast(city);
        displayForecast(forecastData);
        
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

/**
 * Get weather by user's geolocation
 */
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser');
        return;
    }
    
    showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Fetch current weather
                const weatherData = await fetchWeatherByCoords(latitude, longitude);
                displayWeather(weatherData);
                
                // Fetch forecast
                const forecastData = await fetchForecastByCoords(latitude, longitude);
                displayForecast(forecastData);
                
            } catch (error) {
                hideLoading();
                showError(error.message);
            }
        },
        (error) => {
            hideLoading();
            let message = 'Unable to get your location';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out.';
                    break;
            }
            
            showError(message);
        }
    );
}


// ============================================
// UNIT TOGGLE
// ============================================
function toggleUnit() {
    appState.currentUnit = appState.currentUnit === 'metric' ? 'imperial' : 'metric';
    
    // Update display
    unitDisplay.textContent = appState.currentUnit === 'metric' ? '°C' : '°F';
    
    // Save preference
    saveUnitPreference();
    
    // Refresh data if we have a current city
    if (appState.currentCity) {
        searchWeather(appState.currentCity);
    }
}
// ============================================
// UI STATE FUNCTIONS
// ============================================
/**
 * Show loading state
 */
function showLoading() {
    loading.style.display = 'block';
    weatherDisplay.style.display = 'none';
    errorMessage.style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoading() {
    loading.style.display = 'none';
}

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    weatherDisplay.style.display = 'none';
    loading.style.display = 'none';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Show toast notification
 */
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// BACKGROUND FUNCTIONS
// ============================================
function updateBackground(condition, icon) {
    const body = document.body;
    
    // Remove all weather classes
    body.classList.remove('clear-day', 'clouds', 'rain', 'snow', 'night');
    
    // Check if night
    const isNight = icon.includes('n');
    
    if (isNight) {
        body.classList.add('night');
    } else {
        switch(condition.toLowerCase()) {
            case 'clear':
                body.classList.add('clear-day');
                break;
            case 'clouds':
                body.classList.add('clouds');
                break;
            case 'rain':
            case 'drizzle':
            case 'thunderstorm':
                body.classList.add('rain');
                break;
            case 'snow':
                body.classList.add('snow');
                break;
            default:
                body.classList.add('clear-day');
        }
    }
}
// ============================================
// RECENT SEARCHES
// ============================================
function addToRecentSearches(city) {
    // Remove if already exists
    appState.recentSearches = appState.recentSearches.filter(c => c.toLowerCase() !== city.toLowerCase());
    
    // Add to beginning
    appState.recentSearches.unshift(city);
    
    // Keep only last 5
    if (appState.recentSearches.length > CONFIG.MAX_RECENT_SEARCHES) {
        appState.recentSearches = appState.recentSearches.slice(0, CONFIG.MAX_RECENT_SEARCHES);
    }
    
    // Save to localStorage
    saveRecentSearches();
    
    // Update display
    displayRecentSearches();
}


/**
 * Display recent searches
 */
function displayRecentSearches() {
    if (appState.recentSearches.length === 0) {
        recentSearchesSection.style.display = 'none';
        return;
    }
    
    recentSearchesSection.style.display = 'block';
    
    recentList.innerHTML = appState.recentSearches.map(city => `
        <div class="recent-item" onclick="searchWeather('${city}')">
            <i class="fas fa-map-marker-alt"></i> ${city}
        </div>
    `).join('');
}

/**
 * Clear recent searches
 */
function clearRecentSearches() {
    appState.recentSearches = [];
    saveRecentSearches();
    displayRecentSearches();
    showToast('Search history cleared');
}
// ============================================
// LOCAL STORAGE FUNCTIONS
// ============================================
/**
 * Save recent searches to localStorage
 */
function saveRecentSearches() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(appState.recentSearches));
}

/**
 * Load recent searches from localStorage
 */
function loadRecentSearches() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.RECENT_SEARCHES);
    if (saved) {
        appState.recentSearches = JSON.parse(saved);
        displayRecentSearches();
    }
}

/**
 * Save last searched city
 */
function saveLastCity(city) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_CITY, city);
}

/**
 * Load last searched city
 */
function loadLastCity() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_CITY);
}

/**
 * Save unit preference
 */
function saveUnitPreference() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE, appState.currentUnit);
}

/**
 * Load unit preference
 */
function loadUnitPreference() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.UNIT_PREFERENCE);
    if (saved) {
        appState.currentUnit = saved;
        unitDisplay.textContent = saved === 'metric' ? '°C' : '°F';
    }
}
// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format date and time
 */
function formatDateTime(date) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleString('en-US', options);
}

/**
 * Format time from Unix timestamp
 */
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format day name from date
 */
function formatDayName(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
}

/**
 * Debounce function for search input
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}




// ============================================
// EVENT LISTENERS
// ============================================
// Search button
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    searchWeather(city);
    cityInput.value = '';
});

// Enter key on input
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        searchWeather(city);
        cityInput.value = '';
    }
});

// Location button
locationBtn.addEventListener('click', getWeatherByLocation);

// Unit toggle
unitToggle.addEventListener('click', toggleUnit);

// Clear history
clearHistory.addEventListener('click', clearRecentSearches);

// Input suggestions (debounced)
const handleInputChange = debounce((e) => {
    const value = e.target.value.trim();
    
    if (value.length > 0) {
        // Show matching recent searches
        const matches = appState.recentSearches.filter(city => 
            city.toLowerCase().includes(value.toLowerCase())
        );
        
        if (matches.length > 0) {
            suggestions.innerHTML = matches.map(city => `
                <div class="suggestion-item" onclick="searchWeather('${city}'); document.getElementById('city-input').value = '';">
                    <i class="fas fa-map-marker-alt"></i> ${city}
                </div>
            `).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    } else {
        suggestions.style.display = 'none';
    }
}, 300);

cityInput.addEventListener('input', handleInputChange);

// Close suggestions on outside click
document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestions.contains(e.target)) {
        suggestions.style.display = 'none';
    }
});
// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the weather app
 */
function init() {
    console.log('🌤️ Weather App initialized - 100amankumarprojects');
    
    // Check API key
    if (CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please add your OpenWeather API key in config.js. Get it free from openweathermap.org/api');
        return;
    }
    
    // Load saved data
    loadUnitPreference();
    loadRecentSearches();
    
    // Load last city or default
    const lastCity = loadLastCity() || CONFIG.DEFAULT_CITY;
    searchWeather(lastCity);
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for testing
if (typeof window !== 'undefined') {
    window.WeatherApp = {
        searchWeather,
        getWeatherByLocation,
        toggleUnit
    };
}
