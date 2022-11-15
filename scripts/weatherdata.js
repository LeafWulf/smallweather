import { MODULE, MODULE_DIR } from "./const.js";
import { addDays } from "./util.js";
import { weatherAPIKey, currentConfig, debug, cacheSettings, mode, system, simpleCalendarData } from "./settings.js";
import { setClimateWater } from "./climate.js";

export async function getWeather({ hourly = false, days = 0, query = currentConfig.querylength, cacheData = true } = {}, apiParameters = false) {
    if (!weatherAPIKey) return
    // let hourly = currentConfig.hourly

    let apiDefaultParameters = {
        dataUnit: 'us', //metric, us, uk
        location: currentConfig.location,
        date: addDays(currentConfig.startdate, days),
        dateFinal: addDays(currentConfig.startdate, query),
        include: "&include=alerts%2Cdays%2Cevents"
    }
    if (hourly) apiDefaultParameters.include += '%2Chours'

    if (mode === 'basic' && !apiParameters) {
        apiParameters = setClimateWater(currentConfig.climate, days)
    }
    apiParameters = { ...apiDefaultParameters, ...apiParameters }

    //&lang=id
    let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${apiParameters.location}/${apiParameters.date}/${apiParameters.dateFinal}?unitGroup=${apiParameters.dataUnit}${apiParameters.include}&key=${weatherAPIKey}&contentType=json`

    let apiCall = await fetch(url, {
        "method": "GET",
        "headers": {}
    })
    
    if (!apiCall.ok) return apiCall.status
    
    let response = await apiCall.json()

    /* if (cacheData) */ await cacheWeatherData(response);
    if (debug) {
        console.warn("⛅ SmallWeather Debug | async function getWeather. Api Parameters Data", apiParameters.location, apiParameters.date, apiParameters.dateFinal, apiParameters)
        // console.warn("⛅ SmallWeather Debug | async function getWeather. Current Config Data", currentConfig.location, currentConfig.querylength, currentConfig.startdate)
        console.warn("⛅ SmallWeather Debug | async function getWeather. variable simpleCalendarData: ", simpleCalendarData)
        console.warn(url)
    }
    return response
}

export async function cacheWeatherData(response, days = 0) {
    let simpleCalendarData = {
        timestamp: game.time.worldTime - (days * 86400),
        day: SimpleCalendar.api.getCurrentDay(),
        month: SimpleCalendar.api.getCurrentMonth(),
        year: SimpleCalendar.api.getCurrentYear(),
        season: SimpleCalendar.api.getCurrentSeason(),
    }
    simpleCalendarData.date = `${simpleCalendarData.year.numericRepresentation}-${simpleCalendarData.month.numericRepresentation}-${simpleCalendarData.day.numericRepresentation}`
    await game.settings.set(MODULE, "apiWeatherData", response)
    await game.settings.set(MODULE, "simpleCalendarData", simpleCalendarData)
    // await game.settings.set(MODULE, "apiParametersCache", apiParameters) //acho que não tem pq salvar, só serviu pra debug
    // await game.settings.set(MODULE, "lastDateUsed", simpleCalendarData.timestamp) //mesma info no simplecalendar data, acho que nao é necessario tb
    cacheSettings();
}