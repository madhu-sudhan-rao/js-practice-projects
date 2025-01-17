const weatherAPI = 'https://weatherapi-com.p.rapidapi.com/current.json?q=53.1%2C-0.13';
const locationSearchAPI = 'https://weatherapi-com.p.rapidapi.com/search.json';

const locationInputElement = document.getElementById('location-input');
const weatherSection = document.getElementById('weather-data-section');
const autoCompleteWrapper = document.getElementById('auto-complete-wrapper');

// Hide weather section initially
weatherSection.style.display = 'none';

// Month names for displaying dates
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let currentLocation = '';

// Event Listener for Input
locationInputElement.addEventListener("keydown", handleLocationInput)

// Handle input for location search
function handleLocationInput(event) {
    console.log('event: ', event);

    if (event.target.value.length >= 3) {
        console.log('event.target.value.: ', event.target.value);
        fetchLocationAutoComplete(event.target.value);

        if (event.key === 'Enter') {
            currentLocation = event.target.value;
            fetchWeatherData();
        }
    } else {
        // Optionally, provide feedback to the user about invalid input
    }
}

// Fetch location autocomplete suggestions
async function fetchLocationAutoComplete(query) {
    const url = `${locationSearchAPI}?q=${query}`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'a679ac159emsh7b42c1b151767a6p1ae967jsn15e828625236',
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options)
        const result = await response.json();
        updateAutoCompleteSuggestions(result)

    } catch (error) {
        console.error(error)
    }


}

// Update autocomplete suggestions in the UI
function updateAutoCompleteSuggestions(locations) {
    autoCompleteWrapper.innerHTML = ''

    if (locations.length > 1) {
        autoCompleteWrapper.classList.add('show');

        locations.forEach(location => {
            const locationElement = createLocationSuggestionElement(location);
            autoCompleteWrapper.appendChild(locationElement);
        });

        autoCompleteWrapper.style.display = 'flex'
        autoCompleteWrapper.style.flexDirection = 'column'

    } else {
        autoCompleteWrapper.style.display = 'none';
    }
}

// Create a single location suggestion element
function createLocationSuggestionElement(location) {
    const locationElement = document.createElement('div');
    locationElement.classList.add('location-suggestion-item');
    locationElement.textContent = `${location.name}, ${location.region}, ${location.country}`;

    locationElement.addEventListener("click", () => {
        currentLocation = location.name;
        fetchWeatherData();
        autoCompleteWrapper.classList.remove('show'); // Hide suggestions on selection
    });

    return locationElement;
}



async function fetchWeatherData() {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${currentLocation.toLowerCase()}&days=3`
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'a679ac159emsh7b42c1b151767a6p1ae967jsn15e828625236',
            'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
        }
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        displayWeatherData(result);
    } catch (error) {
        console.error(error);
    }

}

// Display fetched weather data in the UI
function displayWeatherData(data) {
    weatherSection.style.display = 'flex';

    setLocationName(data.location.name);
    setDate(data.location.localtime);
    
    const currentWeatherDetails = data.current;
    setCurrentTemperature(currentWeatherDetails.temp_c);
    
    const forecast = data.forecast.forecastday;
    setCurrentMinMaxTemperature(forecast[0].day.mintemp_c, forecast[0].day.maxtemp_c);
    
    setWeatherType(currentWeatherDetails.condition.text);
}

function setWeatherType(weatherType) {
    document.getElementById('weather-type').textContent = weatherType;
}

function setCurrentMinMaxTemperature(min, max) {
    document.getElementById('min-temp').textContent = min;
    document.getElementById('max-temp').textContent = max;
}


function setCurrentTemperature(temp) {
    document.getElementById('current-temperature').textContent = `${temp} °C`;
}

function setLocationName(location) {
    document.getElementById('location-name').textContent = location;
}



function setDate(date) {
    const d = new Date(date); 
    const monthName = months[d.getMonth()];
    
    document.getElementById('date').textContent = `${monthName} ${d.getDate()}, ${d.getFullYear()}`;


}