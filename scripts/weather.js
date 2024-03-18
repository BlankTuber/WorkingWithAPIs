/* Grabbing the elements I'm going to use */
const input = document.getElementById('searchbar');
const resultDiv = document.getElementById('resultDiv');
const cityTitle = document.getElementById('cityTitle');
const conditions = document.getElementById('conditions');
const temperature = document.getElementById('temperature');
const amountofrain = document.getElementById('amountofrain');
const windyness = document.getElementById('windyness');
const dayNightImgDiv = document.getElementById('dayNightImg');
const dayNightImg = document.getElementById('dayNightImg');

/* Declaring the API url */
const firstPartOfPath = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
let secondPartOfPath;
const lastPartOfPath = "/next7days?unitGroup=metric&include=current&key=62X4JS8LF2RSDKDVFVZQ8NUMB&contentType=json";

/* On page load, it will show Asker's weather report on default */
secondPartOfPath = "Asker";
setUpReport(secondPartOfPath);


/* This is the function that sets up and displays everything. */
async function setUpReport(locationInput) {
    let path = `${firstPartOfPath}${locationInput}${lastPartOfPath}`; //Putting the 3 parts of the url together
    try {
        let response = await fetch(path); // Fetching the api using the full url made before
    
        if (!response.ok) { //Checks if there is not a response, and if so, gives and error
            throw new Error('Failed to load resource: ' + response.statusText);
        }

        let jsonData = await response.json(); //Gets json from the api response if there was a response

        /* Getting the data in a json/object format, and showing this on the page */
        cityTitle.innerText = jsonData.resolvedAddress;
        windyness.innerText = `${jsonData.days[0].windspeed}m/s wind`;
        conditions.innerText = jsonData.days[0].conditions;
        temperature.innerText = `${jsonData.days[0].temp}°C`;
        amountofrain.innerText = `${jsonData.days[0].precip}mm rain`;


        /*
        The following lines figure out when sunrise and sunset is, then checks what time of day it is,
        then displays if it is daytime or nighttime
        */
        const sunriseTime = jsonData.days[0].sunrise;
        const sunsetTime = jsonData.days[0].sunset;

        const currentDate = new Date();
        const sunriseDate = new Date(currentDate);
        const sunsetDate = new Date(currentDate);

        const [sunriseHour, sunriseMinute] = sunriseTime.split(':');
        const [sunsetHour, sunsetMinute] = sunsetTime.split(':');

        sunriseDate.setHours(sunriseHour, sunriseMinute, 0);
        sunsetDate.setHours(sunsetHour, sunsetMinute, 0);

        if (currentDate > sunriseDate && currentDate < sunsetDate) {
            dayNightImg.src = "https://png.pngtree.com/png-vector/20230414/ourmid/pngtree-sun-orange-three-dimensional-illustration-png-image_6694186.png";
        } else {
            dayNightImg.src = "https://www.freeiconspng.com/thumbs/moon-png/moon-png--0.png";
        }

        /* This sends the json info and the current day to another function which is made to display the next 6 days. */
        await fixTheRest(jsonData, currentDate.getDay());

    } catch (error) { //If the try-catch didn't work, logs the error in console, then notifies the user about reloading the page.
        console.log("Fetch error: ", error.message);
        resultDiv.innerText = 'Failed to retrieve data. Reloading page...';
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

async function fixTheRest(info, currentDay) { //Function to display stats for future days
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] // Array with days in the same format as the Date.getDay() method 
    const days = document.getElementsByClassName('moreDayStats');
    const temps = document.getElementsByClassName('moreTempStats');
    const conditions = document.getElementsByClassName('moreConditionStats');

    /* Goes through each "p" to set the day names. Does this by using current day and looping thru the previously mentioned array */
    Array.from(days).forEach((day) =>{
        currentDay++; //Starts off by setting the day to the next day, not the current day.
        if (currentDay >= 7) { //If the array index is at the end, go to the start
            currentDay = 0;
        }
        day.innerText = weekdayNames[currentDay];
    })

    /* Loop to display min and max temperature for a given day */
    for (let index = 0; index < Array.from(temps).length; index++) {
        const element = Array.from(temps)[index];

        let minTemp = info.days[index].tempmin;
        let maxTemp = info.days[index].tempmax;

        element.innerText = `${minTemp}°C to ${maxTemp}°C`;
    }
    
    /* Loop to display conditions for a given day */
    for (let i = 0; i < Array.from(conditions).length; i++) {
        const element = Array.from(conditions)[i];

        let condition = info.days[i].conditions;

        element.innerText = condition;
    }
}

/* Function to handle the input (from searchbar) */
function handleInput() {
    const value = input.value.trim();

    if (!value) {
        console.log("Input is empty");
        return;
    }

    input.value = "";

    setUpReport(value);

}

/* Adds support so that you can click "enter" after typing... quality of life :] */ 
document.addEventListener("keydown", (key) => {
    if (key.key == "Enter") {
        handleInput();
    }
})