import { MODULE, MODULE_DIR } from "./const.js";
import { treatWeatherObj } from "./util.js";
import { registerSettings, cacheSettings, system, apiWeatherData, debug, currentConfig, simpleCalendarData, mode, apiParametersCache, lastDateUsed } from "./settings.js";
import { getWeather } from "./weatherdata.js";
import { ConfigApp } from "./config.js"
import { weatherApp } from "./app.js"

let currentWeatherCache
let show

Hooks.once("init", () => {
    registerSettings();
    cacheSettings();
});

Hooks.once('ready', async function () {
    console.info(" ======================================== ⛅ SmallWeather ======================================== ")
    currentWeatherCache = game.settings.get(MODULE, "currentWeather") || ""
});

Hooks.on('renderSmallTimeApp', async function (app, html) {
    if (game.modules.get('smalltime')?.active) {
        await injectIntoSmallTime(currentWeatherCache)
    }
    // ConfigApp.toggleAppVis('init');
})

Hooks.on("renderSettingsConfig", async function (app, html) {
    console.info(app, html)
    // $('div[data-settings-key="smallweather.weatherApiConfig"]').appendTo($('section[data-tab="smallweather"]'));
    const menu = html.find('div[data-settings-key="smallweather.weatherApiConfig"]');
    const list = html.find('section[data-tab="smallweather"]'); // get the settings list
    list.append(menu);
});

Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {
    if (debug) console.info('⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. data variable: ', data)
    let currentFantasyDate = SimpleCalendar.api.dateToTimestamp({
        year: data.date.year,
        month: data.date.month,
        day: data.date.day,
        hour: data.date.hour,
        minute: 0,
        seconds: 0
    })
    let cachedFantasyDate = SimpleCalendar.api.dateToTimestamp({
        year: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).year,
        month: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).month,
        day: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).day,
        hour: 0,
        minute: 0,
        seconds: 0
    })
    let currentFDZeroHour = SimpleCalendar.api.dateToTimestamp({year: data.date.year, month: data.date.month, day: data.date.day, hour: 0, minute: 0, seconds: 0})

    if (true) console.info(`⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. currentFantasyDate: ${SimpleCalendar.api.timestampToDate(currentFantasyDate).display.date}, cachedFantasyDate: ${SimpleCalendar.api.timestampToDate(cachedFantasyDate).display.date}`)

    if (hasDateChanged(currentFantasyDate)) {
        await game.settings.set(MODULE, "lastDateUsed", SimpleCalendar.api.timestamp())
        let days = /* Math.floor */((currentFDZeroHour - cachedFantasyDate) / 86400)
        let hours = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
        if (true) {
            console.info("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. variable days: ", days, " and hours: ", hours)
        }

        if (0 <= days && days <= currentConfig.querylength && mode === 'advanced') {
            // await weatherUpdate(hours, days, false, false)
        }
        else {
            if (debug) console.warn("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. No more cached data to use")
            await weatherUpdate(hours, 0, true, false, days) //use the day with index 0, checking the api but without caching the result.
            // ta checando a API a cada hora, preciso mudar isso.
        }
    }
});

function hasDateChanged(currentDate) {
    let lastDateUsed = game.settings.get(MODULE, "lastDateUsed")
    let hourly = currentConfig.hourly
    let previous = {
        hour: SimpleCalendar.api.timestampToDate(lastDateUsed).hour,
        day: SimpleCalendar.api.timestampToDate(lastDateUsed).day,
        month: SimpleCalendar.api.timestampToDate(lastDateUsed).month,
        year: SimpleCalendar.api.timestampToDate(lastDateUsed).year
    }
    let date = {
        hour: SimpleCalendar.api.timestampToDate(currentDate).hour,
        day: SimpleCalendar.api.timestampToDate(currentDate).day,
        month: SimpleCalendar.api.timestampToDate(currentDate).month,
        year: SimpleCalendar.api.timestampToDate(currentDate).year
    }
    if (debug) console.info("⛅ SmallWeather Debug | hasDateChanged. Previous: ", previous, "Current: ", date, "last Date Used", lastDateUsed)
    if (hourly) {
        if (date.hour !== previous.hour
            || date.day !== previous.day
            || date.month !== previous.month
            || date.year !== previous.year) {
                console.info("⛅ SmallWeather Debug | hasDateChanged Hour")
            return true;
        }
        else if (date.day !== previous.day
            || date.month !== previous.month
            || date.year !== previous.year) {
                console.info("⛅ SmallWeather Debug | hasDateChanged Day")
            return true;
        }
        return false;
    }
}

async function injectIntoSmallTime(currentWeather) {
    const html = $('div[id="smalltime-app"]')
    // const template = await fetch(`modules/smallweather/templates/smallweather.html`);
    // const injection = await template.text();
    const injection = `
        <form class="flexcol" id="weather-app">
        <div id="displayContainer-weatherapp">
        <div id="current-temp">
            <img id="temp-icon" src="${MODULE_DIR}/images/${currentWeather.icon}.webp" ></img>
            <span id="temp"> ${currentWeather.feelslikeC}${currentWeather.unit}</span>
        </div>
        <div id="high-low">
            <i class="fas fa-temperature-high" id="fa-icon"></i><span id="temp"> ${currentWeather.feelslikemaxC}${currentWeather.unit}</span><br>
            <i class="fas fa-temperature-low" id="fa-icon"></i><span id="temp"> ${currentWeather.feelslikeminC}${currentWeather.unit}</span>
        </div>
        <div id="wind">
            <i class="fas fa-wind" id="fa-icon"></i><span id="temp"> ${currentWeather.windspeedFriendly}</span><br>
            <i class="far fa-compass" id="fa-icon"></i><span id="temp"> ${currentWeather.winddirFriendly}</span>
        </div>
        <div id="configWeather"><i class="fa-solid fa-bars"></i></div>
        <div id="weather-text">${currentWeather.conditions}</div>
        </div>
        <div id="rightHandle"></div>
        </form>`
    // if (debug) console.info("⛅ SmallWeather Debug | injectIntoSmallTime Hook. variable injection: ", injection)
    const dragHandle = html.find('#dragHandle')
    if (debug) console.info("⛅ SmallWeather Debug | injectIntoSmallTime Hook. variable dragHandle: ", dragHandle)
    const formGroup = dragHandle.closest("form")
    formGroup.after(injection)
    html.find('#rightHandle').on('click', async function () {
        if (!$('#weather-app').hasClass('show')) {
            $('#weather-app').addClass('show');
            $('#weather-app').animate({ width: '285px', left: "+=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
            await game.settings.set(MODULE, 'show', true);

        } else {
            $('#weather-app').removeClass('show');
            $('#weather-app').animate({ width: '200px', left: "-=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px")
            await game.settings.set(MODULE, 'show', false);
        }
        cacheSettings();
    });
    html.find('#timeDisplay').on('click', async function () {
        let formerHeight = $("#smalltime-app").css("height");
        await new Promise(resolve => setTimeout(resolve, 100));
        let smalltimeHeight = $("#smalltime-app").css("height")
        $("#weather-app").css("height", smalltimeHeight)
        if (formerHeight > smalltimeHeight) $("#weather-text").css("display", "none")
        else $("#weather-text").css("display", "unset")
    });
    const dateDisplayShow = game.settings.get('smalltime', 'date-showing');
    if (!dateDisplayShow) {
        $("#weather-text").css("display", "none")
        $("#weather-app").css("height", $("#smalltime-app").css("height"))
    }
    html.find('#current-temp').on('click', async function () {
        // await weatherUpdate()
    })
    html.find('#configWeather').on('click', async function () {
        ConfigApp.toggleAppVis('init');
    })
    show = game.settings.get(MODULE, 'show');
    if (show) {
        $('#weather-app').addClass('show');
        $('#weather-app').css("width", '285px')
        $('#weather-app').css("left", "+=200")
        $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
    }
}

export async function weatherUpdate(hourToUse = null, dayToUse = 0, checkAPI = true, cache = true, addDayToQuery = 0) {
    let hourly = currentConfig.hourly
    let newWeather
    let currentWeather
    if (checkAPI) {
        if (cache) newWeather = await getWeather(cache, addDayToQuery);
        else newWeather = await getWeather(cache, addDayToQuery, addDayToQuery);
    }
    // if (checkAPI && cache) newWeather = await getWeather(cache, addDayToQuery);
    // else if (checkAPI && !cache) newWeather = await getWeather(cache, addDayToQuery, addDayToQuery);
    else newWeather = apiWeatherData

    if (debug) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable newWeather: ", newWeather)
    console.info("⛅ SmallWeather Debug | weatherUpdate function. variable newWeather: ", newWeather)

    let missingDataHour = newWeather.days[dayToUse].hours[hourToUse].feelslike
    let missingData = newWeather.days[dayToUse].feelslike

    if (hourly) {
        if (!missingDataHour) currentWeather = newWeather.days[dayToUse].hours[hourToUse]
        else currentWeather = newWeather.days[dayToUse].hours[hourToUse-1]
    }
    else currentWeather = newWeather.days[dayToUse]

    await treatWeatherObj(currentWeather, cache, system, newWeather.days[dayToUse].feelslikemax, newWeather.days[dayToUse].feelslikemin)

    if (debug) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable currentWeather: ", currentWeather)

    $("#weather-app").remove()
    await injectIntoSmallTime(currentWeather)
}