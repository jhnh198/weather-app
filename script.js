// Song source
const audio = document.querySelector('#audio');

// Clock elements
const clockElement = document.querySelector('#clock-element');
const dateElement = document.querySelector('#date-element');

// Weather data
const degreeText = document.querySelector('#degree-text'); 
const conditionText = document.querySelector('#condition-text'); 
const conditionImage = document.querySelector('#condition-image');
const windSpeedSpan = document.querySelector('#wind-speed-span');
const regionText = document.querySelector('#region-text');
const humiditySpan = document.querySelector('#humidity-span');
const dewpointSpan = document.querySelector('#dewpoint-span');
const ceilingSpan = document.querySelector('#ceiling-span');
const visibilitySpan = document.querySelector('#visibility-span');
const pressureSpan = document.querySelector('#pressure-span');
const scrollContentText = document.querySelector("#scroll-content");

// weather report object
let weatherReport = {
    region: 'Seattle',
    temp: 66,
    condition: 'Cloudy',
    windspeed: '8',
    windDirection: [],
    dewpoint: '47',
    humidity: '89'
}

let weatherData = {};
let previousCity = regionText.value || 'Seattle';

regionText.addEventListener('keyup', function(event) {
    event.preventDefault();

    if (event.key === 'Enter' || event.keyCode === 13) {
        updateWeather(regionText.value);
    }    
});

const songs = [
    "starks_blizzard_song",
    "starks_after_the_rain",
    "starks_all_that_jazz",
    "starks_after_midnight",
    "starks_bobbys_theme",
    "starks_here_comes_the_rain",
    "starks_just_for_the_moment",    
];

function loadSong(song){ 
    audio.src = `music/${song}.mp3`;
}

function playSong(){
    audio.volume = 0.2;
    audio.play();
}

function nextSong(){
    songIndex++;
    if(songIndex > songs.length - 1) songIndex = 0;

    loadSong(songs[songIndex])
    playSong();
}

let songIndex = 0;
loadSong(songs[songIndex]);
playSong();


audio.addEventListener('ended', nextSong);

setTime();

function setTime(){
    const currentDate = new Date();

    let hours = currentDate.getHours();
    if(hours == 0) hours = 12;
    if(hours > 12) hours = hours - 12;
    hours = (hours < 10) ? `0${hours}` : hours;

    let minutes = currentDate.getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    let seconds = currentDate.getSeconds();
    if (seconds < 10) seconds = `0${seconds}`;

    let session = (currentDate.getHours() > 12) ? 'PM' : 'AM'; 
    clockElement.innerText = `${hours}:${minutes}:${seconds} ${session}`;

    const month = currentDate.toLocaleString('default', { month: 'long' }).substring(0, 3);
    let dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'long',}).substring(0, 3);

    let day = currentDate.getDate();

    dateElement.innerText = `${dayOfWeek} ${month} ${day}`;

    setTimeout(setTime, 1000);
}

function setWeatherImage(weatherStatusCode){
    if(weatherStatusCode >=200 && weatherStatusCode <=232){
        return `images/1992_EF/t-storms.gif`;
    }
    if(weatherStatusCode >=300 && weatherStatusCode <=321){
        return `images/1992_EF/drizzle.gif`;
    }
    if(weatherStatusCode >=500 && weatherStatusCode <=531){
        return `images/1992_EF/rain.gif`;
    }
    if(weatherStatusCode >=600 && weatherStatusCode <=622){
        return `images/1992_EF/snow.gif`;
    }
    if(weatherStatusCode >=701 && weatherStatusCode <=781){
        return `images/1992_EF/Windy.gif`;
    }
    if(weatherStatusCode === 800){
        return `images/1992_EF/sunny.gif`;
    }
    if(weatherStatusCode === 801){
        return `images/1992_EF/Mostly-Sunny.gif`;
    }
    if(weatherStatusCode === 802){
        return `images/1992_EF/Partly-Cloudy.gif`;
    }
    if(weatherStatusCode === 803){
        return `images/1992_EF/Mostly-Cloudy.gif`;
    }
    if(weatherStatusCode === 804 || weatherStatusCode === 1009){
        return `images/1992_EF/overcast-clouds.gif`;
    }
    if(weatherStatusCode=== 1003){
        return `images/1992_EF/CC_PartlyCloudy0.gif`;
    }
    return `images/1992_EF/Mostly-Sunny.gif`;
    
}

// Populate weather data: does not return value
async function updateWeather(city){
    //get free key from https://openweathermap.org/api
     const apiKey = 'openweather_api_key';

     try{
        const response = await fetch(`http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);

        weatherData = await response.json();
        //console.log(weatherData)

        if(response.status >= 404){
            return 400;
        }
        else if(response.status === 403){
            return 400;
        }

        setTextElementValues(weatherData);
        setWeatherReport(weatherData);
        readDetailedForecast(weatherReport);
        previousCity = regionText.value;
     } catch ({name, message}){
        console.log(`${name} : ${message}`);
        regionText.value = previousCity;
        regionText.innerText = previousCity;
     }
}

function setTextElementValues(weatherData){
    console.log(weatherData);
    let temp = Math.floor(weatherData.current.temp_f);
    let humidity = weatherData.current.humidity;

    //finished left content
    degreeText.innerText = temp +  '°';
    conditionText.innerText = weatherData.current.condition.text;

    //check time of day to use night or day icons
    //tweak images and take status, translate image names to suit the status number
    conditionImage.src = setWeatherImage(weatherData.current.condition.code);
    windSpeedSpan.innerText = `${Math.floor(weatherData.current.wind_mph)} ${weatherData.current.wind_dir} `;

    //right content
    regionText.innerText = weatherData.location.name; 
    humiditySpan.innerText = humidity + "%";

    //dewpoint calculation 
    let dewpoint = Math.floor(temp - ((100 - humidity)/5));
    dewpointSpan.innerText = dewpointCalculation(weatherData.current.temp_f, weatherData.current.humidity);

    visibilitySpan.innerText = weatherData.current.vis_miles + " mi.";
    pressureSpan.innerText = weatherData.current.pressure_in;

    let lat = weatherData.location.lat;
    let long = weatherData.location.lon;

    //need to tweak ceiling as it no longer reads
    //getCeiling(lat, long);
    return weatherData;
}

function setWeatherReport(weatherData){
    weatherReport.region =  weatherData.name;
    weatherReport.temp = weatherData.current.temp_f;
    weatherReport.condition = weatherData.current.condition.text;
    weatherReport.windspeed = weatherData.current.wind_mph,
    weatherReport.windDirection = weatherData.current.wind_dir.split('');
    weatherReport.dewpoint = dewpointCalculation(weatherData.current.temp_f, weatherData.current.humidity);
    weatherReport.humidity = weatherData.current.humidity;

    return weatherData;
}

updateWeather(regionText.value);

// Get report and TTS
function readDetailedForecast(weatherReport){
    let windDirection = [];
    weatherReport.windDirection.forEach(element => {
        console.log(element);
        console.log(element === "N");
        if(element === "S") windDirection.push('south ');
        if(element === "E") windDirection.push('east ');
        if(element === "N") windDirection.push('north ');
        if(element === "W") windDirection.push('west ');
    });

    let windDirectionString = windDirection.toString();

    console.log(windDirection);

    const weatherTextScript = `Today's temperature is ${weatherReport.temp} degrees. Weather is ${weatherReport.condition}. Wind speed is ${weatherReport.windspeed} miles per hour. Wind direction is ${windDirectionString}`;

    scrollContentText.innerText = weatherTextScript;
    const synth = window.speechSynthesis;
    synth.speak(new SpeechSynthesisUtterance(weatherTextScript));
}

// set up alert data
async function readAlert(weatherAlert){
    const synth = window.speechSynthesis;
    synth.speak(new SpeechSynthesisUtterance(weatherAlert));
}

//get ceiling function, not used currently
async function getCeiling(lat, long){
    let noaaCallDatacall = await fetch(`https://api.weather.gov/points/${lat},${long}`);

    if(noaaCallDatacall.status === 404){
        console.log('Query failed: 404 not found');
    } else {
        var noaaPointData = await noaaCallDatacall.json();
        let stationID = noaaPointData.properties.radarStation;

        let forecastURL = await fetch(noaaPointData.properties.forecast);
        let forecastData = await forecastURL.json();
        let weatherReport = forecastData.properties.periods[0].detailedForecast;
        readDetailedForecast(weatherReport);
        scrollContentText.innerText = weatherReport;        

        const latestObservationRequest =  await fetch(`https://api.weather.gov/stations/${stationID}/observations/latest?require_qc=false`);
        var noaaStationRequestData = await latestObservationRequest.json();

        let ceiling = (noaaStationRequestData.properties.cloudLayers[0].amount === "CLR") ? "Unlimited" : noaaStationRequestData.properties.cloudLayers[0].base.value;

        ceilingSpan.innerText = ceiling;
    }    
}

function dewpointCalculation(temp, humidity){
    return  Math.floor(temp - ((100 - humidity)/5));
}

function getWindDirection(){
    weatherReport.windDirection.forEach(element => {
        console.log(element);
        console.log(element === "N");
        if(element === "S") windDirection.concat('south ');
        if(element === "E") windDirection.concat('east ');
        if(element === "N") windDirection.concat('north ');
        if(element === "W") windDirection.concat('west ');
    });
}