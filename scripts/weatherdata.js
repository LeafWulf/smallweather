import { MODULE, MODULE_DIR } from "./const.js";
import { addDays } from "./util.js";
import { weatherAPIKey, currentConfig, debug, cacheSettings, mode, system } from "./settings.js";
import { setClimateWater } from "./climate.js";

//"&include=alerts%2Ccurrent%2Cdays%2Cevents%2Chours";
// 97JMBZAX2DRQ96SR2QT28K7WH
// 78WK5HM86QBUYJ394TZGC2HLA

export async function getWeather({days = 0, query = currentConfig.querylength, cacheData = true} = {}, apiParameters = {}) {
    if (!weatherAPIKey) return
    let hourly = currentConfig.hourly

    let apiDefaultParameters = {
        dataUnit: 'us', //metric, us, uk
        location: currentConfig.location,
        date: addDays(currentConfig.startdate, days),
        dateFinal: addDays(currentConfig.startdate, query),
        include: "&include=alerts%2Cdays"
    }
    if (hourly) apiDefaultParameters.include += '%2Cevents%2Chours'

    if (mode === 'basic') {
        apiParameters = setClimateWater(currentConfig.climate, days)
    }
    apiParameters = { ...apiDefaultParameters, ...apiParameters }

    let simpleCalendarData = {
        timestamp: game.time.worldTime,
        day: SimpleCalendar.api.getCurrentDay(),
        month: SimpleCalendar.api.getCurrentMonth(),
        year: SimpleCalendar.api.getCurrentYear(),
        season: SimpleCalendar.api.getCurrentSeason(),
    }
    simpleCalendarData.date = `${simpleCalendarData.year.numericRepresentation}-${simpleCalendarData.month.numericRepresentation}-${simpleCalendarData.day.numericRepresentation}`

    let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${apiParameters.location}/${apiParameters.date}/${apiParameters.dateFinal}?unitGroup=${apiParameters.dataUnit}${apiParameters.include}&key=${weatherAPIKey}&contentType=json`

    if (true) {
        console.warn("⛅ SmallWeather Debug | async function getWeather. Api Parameters Data", apiParameters.location, apiParameters.date, apiParameters.dateFinal)
        console.warn("⛅ SmallWeather Debug | async function getWeather. Current Config Data", currentConfig.location, currentConfig.querylength, currentConfig.startdate)
        // console.warn("⛅ SmallWeather Debug | async function getWeather. variable simpleCalendarData: ", simpleCalendarData)
        // console.warn(url)
    }


    // return game.settings.get('smallweather', "apiWeatherData")
    let apiCall = await fetch(url, {
        "method": "GET",
        "headers": {}
    })

    if (!apiCall.ok) return

    let response = await apiCall.json()

    if (cacheData) await game.settings.set(MODULE, "apiWeatherData", response) 
    if (cacheData) await game.settings.set(MODULE, "simpleCalendarData", simpleCalendarData) 
    // await game.settings.set(MODULE, "apiParametersCache", apiParameters) //acho que não tem pq salvar, só serviu pra debug
    // await game.settings.set(MODULE, "lastDateUsed", simpleCalendarData.timestamp) //mesma info no simplecalendar data, acho que nao é necessario tb
    cacheSettings();


    return response
}