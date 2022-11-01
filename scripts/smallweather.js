import { MODULE, MODULE_DIR } from "./const.js";
import { advanceOneDay, stringfyWindDir, stringfyWindSpeed, roundNoFloat, dateToString, addDays } from "./util.js";
import { registerSettings, cacheWfxSettings, toggleApp, unit, apiWeatherData, debug, currentConfig, simpleCalendarData, apiParametersCache, lastDateUsed } from "./settings.js";
import { getWeather } from "./weatherdata.js";
import { ConfigApp } from "./config.js"
import { weatherApp } from "./app.js"

let currentWeather
let show
let smalltimeHTML

Hooks.once("init", () => {
    registerSettings();
    cacheWfxSettings();
});

Hooks.once('ready', async function () {
    console.log(" ======================================== ⛅ SmallWeather ======================================== ")
    currentWeather = game.settings.get(MODULE, "currentWeather") || ""
    // show = game.settings.get(MODULE, 'show');
});

Hooks.on('renderSmallTimeApp', async function (app, html) {
    smalltimeHTML = html
    if (debug) {
        console.log("⛅ SmallWeather Debug | renderSmallTimeApp Hook parameter html: ", html)
        console.log("⛅ SmallWeather Debug | renderSmallTimeApp Hook parameter app: ", app)

    }
    if (game.modules.get('smalltime')?.active) {
        // await game.settings.set(MODULE, 'lastDateUsed', app)
        // cacheWfxSettings();
        // if (debug) console.log("⛅ SmallWeather Debug | renderSmallTimeApp Hook. variable lastDateUsed: ", lastDateUsed)
        await injectIntoSmallTime(html)
    }
    // ConfigApp.toggleAppVis('init');
})

Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {

    if (debug) console.log('⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. data variable: ', data)

    // let currentFantasyDay = data.date.day
    // let currentFantasyMonth = data.date.month
    // let currentFantasyYear = data.date.year
    // let currentFantasyDate = `${currentFantasyYear}-${currentFantasyMonth}-${currentFantasyDay}`
    // let currentFantasyDate = data.date.display.date
    let currentFantasyDate = SimpleCalendar.api.dateToTimestamp({
        year: data.date.year, 
        month: data.date.month,
        day: data.date.day, 
        hour: 0, 
        minute: 0, 
        seconds: 0
    })

    // let cachedFantasyDay = simpleCalendarData.day.numericRepresentation
    // let cachedFantasyMonth = simpleCalendarData.month.numericRepresentation
    // let cachedFantasyYear = simpleCalendarData.year.numericRepresentation
    // let cachedFantasyDate = simpleCalendarData.date
    // let cachedFantasyDate = SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).display.date
    let cachedFantasyDate = SimpleCalendar.api.dateToTimestamp({
        year: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).year, 
        month: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).month,
        day: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).day, 
        hour: 0, 
        minute: 0, 
        seconds: 0
    })
    let cachedRealDate = currentConfig.startdate

    if (debug) console.log(`⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. currentFantasyDate: ${currentFantasyDate}, cachedFantasyDate: ${cachedFantasyDate}`)

    if (currentFantasyDate !== cachedFantasyDate) {
        // await game.settings.set(MODULE, "lastDateUsed", {fantasy: game.time.worldTime})
        // cacheWfxSettings();

        // let currentFantasyDate = Date.parse(`${SimpleCalendar.api.getCurrentYear().numericRepresentation}-${SimpleCalendar.api.getCurrentMonth().numericRepresentation}-${SimpleCalendar.api.getCurrentDay().numericRepresentation+2}`)
        // let cachedFantasyDate = Date.parse(simpleCalendarData.date)
        let days = Math.ceil((currentFantasyDate - cachedFantasyDate) / 86400)
        if (debug) {
            console.log("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. variable days: ", days)
        }

        if ( 0 <= days && days <= currentConfig.querylength ) {

            await weatherUpdate(days, smalltimeHTML, false, false)
                
            // let nextRealDate = addDays(cachedRealDate, days)
            // // if (currentFantasyDay < CachedFantasyDay) nextRealDate = addDays(lastDateUsed.real, -1) //não é pra ser mais necessario

            // let cachedDateFinal = Date.parse(apiParametersCache.dateFinal)

            // if (debug) {
            //     console.log("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. variable nextRealDate: ", nextRealDate)
            // }

            // if (Date.parse(nextRealDate) <= cachedDateFinal) {
            //     if (debug) console.log("⛅ SmallWeather Debug | New day, update weather")
            //     await game.settings.set(MODULE, "lastDateUsed", nextRealDate)
            //     cacheWfxSettings();
            //     await weatherUpdate(nextRealDate, smalltimeHTML, false)
            // }
        }
        else {
            if (debug) console.log("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. No more cached data to use. last day:")
        }
    }
});

async function injectIntoSmallTime(html) {
    // const template = await fetch(`modules/smallweather/templates/smallweather.html`);
    // const injection = await template.text();
    const injection = `
        <form class="flexcol" id="weather-app">
        <div id="displayContainer-weatherapp">
        <div id="current-temp">
            <img id="temp-icon" src="/modules/weatherfx/images/clearSky.webp" alt="heavyRain"></img>
            <span id="temp"> ${currentWeather.feelslike}${unit.temp}</span>
        </div>
        <div id="high-low">
            <i class="fas fa-temperature-high" id="fa-icon"></i><span id="temp"> ${currentWeather.feelslikemax}${unit.temp}</span><br>
            <i class="fas fa-temperature-low" id="fa-icon"></i><span id="temp"> ${currentWeather.feelslikemin}${unit.temp}</span>
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
    // if (debug) console.log("⛅ SmallWeather Debug | injectIntoSmallTime Hook. variable injection: ", injection)
    const dragHandle = html.find('#dragHandle')
    if (debug) console.log("⛅ SmallWeather Debug | injectIntoSmallTime Hook. variable dragHandle: ", dragHandle)
    const formGroup = dragHandle.closest("form")
    formGroup.after(injection)
    html.find('#rightHandle').on('click', async function () {
        if (!$('#weather-app').hasClass('show')) {
            $('#weather-app').addClass('show');
            $('#weather-app').animate({ width: '270px', left: "+=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
            await game.settings.set(MODULE, 'show', true);
            cacheWfxSettings();

        } else {
            $('#weather-app').removeClass('show');
            $('#weather-app').animate({ width: '200px', left: "-=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px")
            await game.settings.set(MODULE, 'show', false);
            cacheWfxSettings();
        }
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
        let dayToUse = currentConfig.startdate
        await weatherUpdate(0, html)
    })
    html.find('#configWeather').on('click', async function () {
        ConfigApp.toggleAppVis('init');
    })
    show = game.settings.get(MODULE, 'show');
    if (show) {
        $('#weather-app').addClass('show');
        $('#weather-app').css("width", '270px')
        $('#weather-app').css("left", "+=200")
        $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
    }
}

async function weatherUpdate(dayToUse, html, checkAPI = true, cache = true) {
    let newWeather
    if (checkAPI) newWeather = await getWeather(cache);
    else newWeather = apiWeatherData

    if (debug) console.log("⛅ SmallWeather Debug | weatherUpdate function. variable newWeather: ", newWeather)
    if (debug) console.log("⛅ SmallWeather Debug | weatherUpdate function. variable dayToUse: ", dayToUse)
    // currentWeather = newWeather.days.find(i => i.datetime === dayToUse)
    currentWeather = newWeather.days[dayToUse]
    currentWeather.windspeedFriendly = stringfyWindSpeed(currentWeather.windspeed)
    currentWeather.winddirFriendly = stringfyWindDir(currentWeather.winddir)
    currentWeather.feelslike = roundNoFloat(currentWeather.feelslike)
    currentWeather.feelslikemax = roundNoFloat(currentWeather.feelslikemax)
    currentWeather.feelslikemin = roundNoFloat(currentWeather.feelslikemin)
    if (debug) console.log("⛅ SmallWeather Debug | weatherUpdate function. variable currentWeather: ", currentWeather)
    await game.settings.set(MODULE, "currentWeather", currentWeather)
    cacheWfxSettings();
    $("#weather-app").remove()
    await injectIntoSmallTime(html)
}