
// Get elements from the HTML
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const message = document.getElementById("message");

// Listen for the search button click
searchBtn.addEventListener("click", getWeather);

// Allow users to press Enter to search
cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

// Main function to retrieve weather information
async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Searching for weather data...";

    try {

        // STEP 1: Find the city's coordinates
        const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        const geoData = await geoResponse.json();

        if (!geoResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Try another city.");
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // STEP 2: Retrieve live weather data
        const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherURL);

        const weatherData = await weatherResponse.json();

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        // STEP 3: Extract information from JSON
        const current = weatherData.current;

        const temperature = current.temperature_2m;
        const humidity = current.relative_humidity_2m;
        const feelsLike = current.apparent_temperature;
        const wind = current.wind_speed_10m;
        const weatherCode = current.weather_code;
        const isDay = current.is_day;

        // STEP 4: Update the webpage (DOM)
        document.getElementById("cityName").textContent = location.name;
        document.getElementById("countryName").textContent = location.country;
        document.getElementById("temperature").textContent = `${Math.round(temperature)}°C`;
        document.getElementById("humidity").textContent = `${humidity}%`;
        document.getElementById("wind").textContent = `${wind} km/h`;
        document.getElementById("feelsLike").textContent = `${Math.round(feelsLike)}°C`;

        // STEP 5: Change the icon and background based on weather
        const weatherInfo = getWeatherDescription(weatherCode, isDay);

        document.getElementById("weatherIcon").textContent = weatherInfo.icon;
        document.getElementById("weatherDescription").textContent = weatherInfo.description;

        document.body.style.background = weatherInfo.background;

        message.textContent = "Weather successfully updated!";

        document.getElementById("updated").textContent =
            `Last updated: ${current.time.replace("T", " ")} (local time)`;

    } catch (error) {

        message.textContent = error.message;

    }
}

// Convert weather codes into descriptions and visuals
function getWeatherDescription(code, isDay) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: isDay ? "☀️" : "🌙",
            background: "linear-gradient(135deg, #f6d365, #fda085)"
        };
    }

    if ([1, 2, 3].includes(code)) {
        return {
            description: "Partly Cloudy",
            icon: isDay ? "🌤️" : "☁️",
            background: "linear-gradient(135deg, #b7d8ed, #a9b8d5)"
        };
    }

    if ([45, 48].includes(code)) {
        return {
            description: "Foggy",
            icon: "🌫️",
            background: "linear-gradient(135deg, #bdc3c7, #7f8c8d)"
        };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
        return {
            description: "Drizzle",
            icon: "🌦️",
            background: "linear-gradient(135deg, #89a9c5, #c3d5e8)"
        };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return {
            description: "Rainy",
            icon: "🌧️",
            background: "linear-gradient(135deg, #52677d, #8ca6b8)"
        };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return {
            description: "Snowy",
            icon: "❄️",
            background: "linear-gradient(135deg, #dceefb, #a6c8e0)"
        };
    }

    if ([95, 96, 99].includes(code)) {
        return {
            description: "Thunderstorm",
            icon: "⛈️",
            background: "linear-gradient(135deg, #343a55, #69758c)"
        };
    }

    return {
        description: "Unknown Conditions",
        icon: "🌡️",
        background: "linear-gradient(135deg, #b7d8ed, #e4d8f5)"
    };
}
