import { MODULE, MODULE_DIR } from "./const.js";
import { addDays } from "./util.js";
import { weatherAPIKey, currentConfig, debug, cacheWfxSettings } from "./settings.js";

//"&include=alerts%2Ccurrent%2Cdays%2Cevents%2Chours";
// 97JMBZAX2DRQ96SR2QT28K7WH

export async function getWeather(cache = true) {
    if (!weatherAPIKey) return

    let apiParameters = {
        dataUnit: "metric", //metric, us, uk
        location: currentConfig.location,
        date: currentConfig.startdate,
        dateFinal: addDays(currentConfig.startdate, currentConfig.querylength),
        include: "&include=days"
    }

    let simpleCalendarData = {
        timestamp: game.time.worldTime,
        day: SimpleCalendar.api.getCurrentDay(),
        month: SimpleCalendar.api.getCurrentMonth(),
        year: SimpleCalendar.api.getCurrentYear(),
        season: SimpleCalendar.api.getCurrentSeason(),
    }
    simpleCalendarData.date = `${simpleCalendarData.year.numericRepresentation}-${simpleCalendarData.month.numericRepresentation}-${simpleCalendarData.day.numericRepresentation}`

    let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${apiParameters.location}/${apiParameters.date}/${apiParameters.dateFinal}?unitGroup=${apiParameters.dataUnit}${apiParameters.include}&key=${weatherAPIKey}&contentType=json`

    if (debug) {
        console.log(apiParameters.location, apiParameters.date, apiParameters.dateFinal)
        console.log(currentConfig.location, currentConfig.querylength, currentConfig.startdate)
        console.log(url)
    }

    let apiCall = await fetch(url, {
        "method": "GET",
        "headers": {}
    })

    let response = await apiCall.json()
    if (cache) {
        await game.settings.set(MODULE, "apiWeatherData", response)
        await game.settings.set(MODULE, "simpleCalendarData", simpleCalendarData)
        await game.settings.set(MODULE, "apiParametersCache", apiParameters)
        await game.settings.set(MODULE, "lastDateUsed", apiParameters.date)
        cacheWfxSettings();
    }

    return response
}