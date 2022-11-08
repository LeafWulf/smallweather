import { MODULE, MODULE_DIR } from "./const.js";
import { addDays } from "./util.js";
import { weatherAPIKey, currentConfig, debug, cacheSettings, system } from "./settings.js";

export function setClimateWater(climate, days) {
    let simpleCalendarData = game.settings.get(MODULE, "simpleCalendarData")
    let currentSeason = simpleCalendarData.season
    let firstDayOfTheYearTimestamp = SimpleCalendar.api.dateToTimestamp({ year: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).year, month: 0, day: 0, hour: 0, minute: 0, second: 0 })
    let fantasyDayOfTheYear = Math.ceil((simpleCalendarData.timestamp - firstDayOfTheYearTimestamp) / 86400)
    let seasonStartTimestamp = SimpleCalendar.api.dateToTimestamp({ year: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).year, month: currentSeason.startingMonth, day: currentSeason.startingDay, hour: 0, minute: 0, second: 0 })
    let seasonStartDayOfTheYear = Math.ceil((seasonStartTimestamp - firstDayOfTheYearTimestamp) / 86400)
    let syncSeasonOffset = fantasyDayOfTheYear - seasonStartDayOfTheYear

    climate = eval(climate)
    let basicParameters = {
        location: climate.representativeLocation,
        date: `2010-${climate.seasons[currentSeason.icon].startingMonth}-${climate.seasons[currentSeason.icon].startingDay}`,
        dateFinal:''
    }
    basicParameters.date = addDays(basicParameters.date, syncSeasonOffset + days)

    if (debug) console.info("⛅ SmallWeather Debug | climate. variable startdate: ", basicParameters.date)
    if (debug) console.info("⛅ SmallWeather Debug | climate. variable location: ", basicParameters.location)

    return basicParameters
}

const southernH = {
    summer: {
        startingDay: '20',
        startingMonth: '12',
    },
    fall: {
        startingDay: '19',
        startingMonth: '03',
    },
    winter: {
        startingDay: '20',
        startingMonth: '06',
    },
    spring: {
        startingDay: '21',
        startingMonth: '09',
    }
}
const northernH = {
    summer: {
        startingDay: '20',
        startingMonth: '06',
    },
    fall: {
        startingDay: '21',
        startingMonth: '09',
    },
    winter: {
        startingDay: '20',
        startingMonth: '12',
    },
    spring: {
        startingDay: '19',
        startingMonth: '03',
    }
}
const tropical = {
    representativeLocation: 'Manaus',
    seasons: southernH
}
const arid = {
    representativeLocation: 'Sabha',
    seasons: northernH
}
const temperate = {
    representativeLocation: 'Dublin',
    seasons: northernH
}
const continental = {
    representativeLocation: 'Helsinki',
    seasons: northernH
}
const polar = {
    representativeLocation: 'Siglufjörður',
    seasons: northernH
}


