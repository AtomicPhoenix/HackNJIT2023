let userLatitude = 0;
let userLongitude = 0;

let cityname = document.getElementById("cityname");
let stationname = document.getElementById("stationname");
let stationname2 = document.getElementById("stationnametwo");
let citylongitude = document.getElementById("citylongitude");
let stationlongitude = document.getElementById("stationlongitude");
let citylatitude = document.getElementById("citylatitude");
let stationlatitude = document.getElementById("stationlatitude");

let meanTideLevel = document.getElementById("meantide");
let highTideLevel = document.getElementById("hightide");
let lowTideLevel = document.getElementById("lowtide");
let rangeTide = document.getElementById("rangetide");

let floodLevel = document.getElementById("floodlevel");

let windSpeed = document.getElementById("windspeed");
let airTemp = document.getElementById("airtemp");
let baroPressure = document.getElementById("baropressure");
let waterTemp = document.getElementById("watertemp");

let userForm = document.getElementById("userForm");
userForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let userinput = document.getElementById("userinput").value;
    let mapsAPI = "https://api.geoapify.com/v1/geocode/search?text=" + userinput + "&lang=en&limit=10&type=city&apiKey=" + mapsAPIKey;

    let mapsxml = new XMLHttpRequest();
    mapsxml.addEventListener("load", getCityData);
    mapsxml.open("GET", mapsAPI);
    mapsxml.send();
});

function getCityData() {
    let jsonResponse = JSON.parse(this.responseText);
    userLongitude = jsonResponse["features"][0]["geometry"]["coordinates"][0];
    userLatitude = jsonResponse["features"][0]["geometry"]["coordinates"][1];
    
    cityname.innerText = jsonResponse["features"][0]["properties"]["city"] + ", " + jsonResponse["features"][0]["properties"]["state"];
    citylongitude.innerText = userLongitude;
    citylatitude.innerText = userLatitude;

    getStations()
}

function getStations() {
    let stationsXML = new XMLHttpRequest();
    stationsXML.addEventListener("load", getNearestStation);
    stationsXML.open("GET", "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=waterlevels");
    stationsXML.send();
}

function getNearestStation() {
    let jsonReponse = JSON.parse(this.responseText);
    let stations = jsonReponse["stations"];
    let distance = 0;
    let stationID=0;
    for (let station of stations) {
        let latitude = station["lat"];
        let longitude = station["lng"];
        
        let stationDistance = getDistance(userLatitude, latitude, userLongitude, longitude, false);
        if (distance == 0 || stationDistance < distance) {
            distance = stationDistance;
            nearestStation = station;
            stationID = nearestStation["id"];
        }
    }

    let resultText = document.getElementById("results");

    resultText.innerText = "Station Number: " + stationID;
    resultText.removeAttribute("class");
    stationname.innerText = nearestStation["name"] + ", " + nearestStation["state"];
    stationname2.innerText = nearestStation["name"] + ", " + nearestStation["state"];
    stationlatitude.innerText = nearestStation["lat"];
    stationlongitude.innerText = nearestStation["lng"];

    let waterLevelXML = new XMLHttpRequest();
    waterLevelXML.addEventListener("load", setWaterLevelData);
    waterLevelXML.open("GET", "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/" + stationID + "/datums.json");
    waterLevelXML.send();

    let floodLevelXML = new XMLHttpRequest();
    floodLevelXML.addEventListener("load", setFloodLevelData);
    floodLevelXML.open("GET", "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations/" + stationID + "/floodlevels.json");
    floodLevelXML.send();
}

function setWaterLevelData() {
    let stationData = JSON.parse(this.responseText);
    let meanTideLevelValue = stationData["datums"][4]["value"];
    let meanHighLevelValue = stationData["datums"][2]["value"];
    let meanLowLevelValue = stationData["datums"][6]["value"];
    let rangeTideValue = stationData["datums"][9]["value"]

    meanTideLevel.innerText = meanTideLevelValue;
    highTideLevel.innerText = meanHighLevelValue;
    lowTideLevel.innerText = meanLowLevelValue;
    rangeTide.innerText = rangeTideValue;

    meanTideLevel.removeAttribute("class");
    highTideLevel.removeAttribute("class");
    lowTideLevel.removeAttribute("class");
    stationname2.removeAttribute("class");
    rangeTide.removeAttribute("class");
}

function setFloodLevelData() {
    let stationData = JSON.parse(this.responseText);
    let minorFloodLevel = stationData["nos_minor"];
    let moderateFloodLevel = stationData["nos_moderate"];
    let majorFloodLevel = stationData["nos_major"];
    let currentTideLevel = meanTideLevel.innerText;

    if(currentTideLevel > majorFloodLevel) {
        floodLevel.innerText = "MAJOR FLOODING";
    }
    else if(currentTideLevel > moderateFloodLevel) {
        floodLevel.innerText = "MODERATE FLOODING";
    }
    else if(currentTideLevel > minorFloodLevel) {
        floodLevel.innerText = "MINOR FLOODING";
    }
    else {
        floodLevel.innerText = "No Flooding :D";
    }

    floodLevel.removeAttribute("class");

}

function getDistance(lat1, lat2, long1, long2) {
    let diameter = 2 * 6378;
    let latDistance = (lat2 - lat1)  * Math.PI/180;
    let lngDistance = (long2 - long1)  * Math.PI/180;
    let h = Math.pow(Math.sin(latDistance/2),2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.pow(Math.sin(lngDistance/2),2);
    
    let distance = diameter * Math.asin(Math.sqrt(h));
    return distance;
}


/* api credits
    all information on city and station location was from geocode.api
    all information relating to water levels, currents, floodlevels, etc is frop co-ops.api, which comes from national oceanic and atmospheric administration */
