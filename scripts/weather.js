const input = document.getElementById('searchbar');
const resultDiv = document.getElementById('resultDiv');
const cityTitle = document.getElementById('cityTitle');
const conditions = document.getElementById('conditions');
const temperature = document.getElementById('temperature');
const amountofrain = document.getElementById('amountofrain');
const windyness = document.getElementById('windyness');
const dayNightImgDiv = document.getElementById('dayNightImg');
const dayNightImg = document.getElementById('dayNightImg');

const firstPartOfPath = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
let secondPartOfPath;
const lastPartOfPath = "/today?unitGroup=metric&include=current&key=62X4JS8LF2RSDKDVFVZQ8NUMB&contentType=json";

async function fetchLocationData() {
    try {
        const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=b1623a0a82f14d58bdb06a60695c2fad');
        const data = await response.json();
        return data.city;
    } catch (error) {
        return 'Asker';
    }
}

fetchLocationData().then(city => {
    secondPartOfPath = city;
    setUpReport(secondPartOfPath);
});

async function setUpReport(locationInput) {
    let path = `${firstPartOfPath}${locationInput}${lastPartOfPath}`;
    try {
        let response = await fetch(path);
    
        if (!response.ok) {
            throw new Error('Failed to load resource: ' + response.statusText);
        }
    
        let jsonData = await response.json();
        cityTitle.innerText = jsonData.resolvedAddress;
        windyness.innerText = `${jsonData.currentConditions.windspeed}m/s wind`;
        conditions.innerText = jsonData.currentConditions.conditions;
        temperature.innerText = `${jsonData.currentConditions.temp}°C`;
        amountofrain.innerText = `${jsonData.currentConditions.precip}mm rain`;

        const sunriseTime = jsonData.currentConditions.sunrise;
        const sunsetTime = jsonData.currentConditions.sunset;
        const currentTime = jsonData.currentConditions.datetime;

        const currentDate = new Date();
        const sunriseDate = new Date(currentDate);
        const sunsetDate = new Date(currentDate);
        const currentDateWithTime = new Date(currentDate);

        const [sunriseHour, sunriseMinute] = sunriseTime.split(':');
        const [sunsetHour, sunsetMinute] = sunsetTime.split(':');
        const [currentHour, currentMinute] = currentTime.split(':');

        sunriseDate.setHours(sunriseHour, sunriseMinute, 0);
        sunsetDate.setHours(sunsetHour, sunsetMinute, 0);
        currentDateWithTime.setHours(currentHour, currentMinute, 0);

        if (currentDateWithTime > sunriseDate && currentDateWithTime < sunsetDate) {
            dayNightImg.src = "https://png.pngtree.com/png-vector/20230414/ourmid/pngtree-sun-orange-three-dimensional-illustration-png-image_6694186.png";
        } else {
            dayNightImg.src = "https://www.freeiconspng.com/thumbs/moon-png/moon-png--0.png";
        }

    } catch (error) {
        console.log("Fetch error: ", error.message);
        resultDiv.innerText = 'Failed to retrieve data. Please try again.';
        cityTitle.innerText = '';
        windyness.innerText = '';
        conditions.innerText = '';
        temperature.innerText = '';
        amountofrain.innerText = '';
        dayNightImg.src = 'https://cdn-icons-png.flaticon.com/512/7466/7466140.png';
    }
}

async function handleInput() {
    const value = input.value.trim();

    if (!value) {
        console.log("Input is empty");
        return;
    }

    input.value = "";

    setUpReport(value);

}