import { MODULE, MODULE_DIR } from "./const.js";
import { debug, cacheSettings } from "./settings.js";

export async function treatWeatherObj(currentWeather, cache, system, feelslikemax, feelslikemin) {
    // if ( currentWeather.windspeed == null || currentWeather.winddir == null || currentWeather.feelslike == null ) return
    currentWeather.windspeedFriendly = stringfyWindSpeed(currentWeather.windspeed)
    currentWeather.winddirFriendly = stringfyWindDir(currentWeather.winddir)
    currentWeather.feelslikeC = roundNoFloat(fahrToCelsius(system, currentWeather.feelslike))
    currentWeather.feelslikemaxC = roundNoFloat(fahrToCelsius(system, feelslikemax))
    currentWeather.feelslikeminC = roundNoFloat(fahrToCelsius(system, feelslikemin))
    currentWeather.unit = unit(system)
    await game.settings.set(MODULE, "lastDateUsed", SimpleCalendar.api.timestamp())

    if (debug) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable currentWeather: ", currentWeather)
    if (cache) {
        await game.settings.set(MODULE, "currentWeather", currentWeather)
        cacheSettings();
    }
}

export function addDays(date, days) {
    let result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return dateToString(result)
}

export function dateToString(unixDate) {
    let dateString = `${unixDate.getUTCFullYear()}-${pad2(unixDate.getUTCMonth() + 1)}-${pad2(unixDate.getUTCDate())}`;
    return dateString
}

export function unit(system) {
    switch (system) {
        case 'metric': return 'ºC'
        case 'uk': return 'ºC'
        case 'us': return 'F'
    }
}

export function pad2(number) {
    return (number < 10 ? '0' : '') + number
}

export function fahrToCelsius(system, fahrTemp) {
    if (system === 'us') return fahrTemp
    else {
        let celsiusTemp = (fahrTemp - 32) * 5 / 9
        return celsiusTemp
    }
}

export function mphToKph(system, mph) {
    if (system === 'us') return mph
    else {
        let kph = mph * 1.60934
        return kph
    }
}

export function stringfyWindSpeed(number) { // table from https://www.weather.gov/pqr/wind
    if (number == 0) return 'calm'
    else if (number <= 3) return 'Light Air'
    else if (number <= 7) return 'Light Breeze'
    else if (number <= 12) return 'Gentle Breeze'
    else if (number <= 18) return 'Moderate Breeze'
    else if (number <= 24) return 'Fresh Breeze'
    else if (number <= 31) return 'Strong Breeze'
    else if (number <= 38) return 'Near Gale'
    else if (number <= 46) return 'Gale'
    else if (number <= 54) return 'Strong Gale'
    else if (number <= 63) return 'Whole Gale'
    else if (number <= 75) return 'Storm Force'
    else if (number > 75) return 'Hurricane Force'
}

export function stringfyWindDir(number) { //table from http://snowfence.umn.edu/Components/winddirectionanddegreeswithouttable3.htm
    if (348.75 <= number || number <= 11.25) return 'North'
    if (11.25 < number && number <= 33.75) return 'North-northeast'
    if (33.75 < number && number <= 56.25) return 'Northeast'
    if (56.25 < number && number <= 78.75) return 'East-northeast'
    if (78.75 < number && number <= 101.25) return 'East'
    if (101.25 < number && number <= 123.75) return 'East-southeast'
    if (123.75 < number && number <= 146.25) return 'Southeast'
    if (146.25 < number && number <= 168.75) return 'South-southeast'
    if (168.75 < number && number <= 191.25) return 'South'
    if (191.25 < number && number <= 213.75) return 'South-southwest'
    if (213.75 < number && number <= 236.25) return 'Southwest'
    if (236.25 < number && number <= 258.75) return 'West-southwest'
    if (258.75 < number && number <= 281.25) return 'West'
    if (281.25 < number && number <= 303.75) return 'West-northwest'
    if (303.75 < number && number <= 326.25) return 'Northwest'
    if (326.25 < number && number <= 348.75) return 'North-northwest'
}

export function roundNoFloat(number) {
    number = Math.round((number + Number.EPSILON))
    return number
}