import { MODULE, MODULE_DIR } from "./const.js";
import { addDays, treatWeatherObj } from "./util.js";
import { allowPlayers, registerSettings, cacheSettings, system, apiWeatherData, debug, currentConfig, simpleCalendarData, mode, apiParametersCache, lastDateUsed, weatherAPIKey, currentWeather } from "./settings.js";
import { getWeather, cacheWeatherData } from "./weatherdata.js";
import { ConfigApp } from "./config.js"
import { weatherApp } from "./app.js"

let currentWeatherCache
let show
let hourly

Hooks.once("init", () => {
    registerSettings();
    cacheSettings();
    currentWeatherCache = game.settings.get(MODULE, "currentWeather") || ""
});

Hooks.once('ready', async function () {
    console.info(" ======================================== ⛅ SmallWeather ======================================== ")
    hourly = currentConfig.hourly
    if (!weatherAPIKey) missingAPI()

});

Hooks.on('ready', async function () {
    game.socket.on('module.smallweather', (data) => {
        doSocket(data);
    });
});

Hooks.on('smallweatherUpdate', async function (weather, hourly) {
    emitSocket('handleWeatherApp', weather);
})

Hooks.on('renderSmallTimeApp', async function (app, html) {
    if (game.user.isGM)
        await injectIntoSmallTime(currentWeather, true)
    else if (allowPlayers)
        injectIntoSmallTimePlayer(currentWeather, true)
    // ConfigApp.toggleAppVis('init');
})

Hooks.on("renderSettingsConfig", async function (app, html) {
    // Everything here is GM-only.
    if (!game.user.isGM) return;
    $('section[data-tab="smallweather"]').find('.submenu').appendTo($('section[data-tab="smallweather"]'))
});

Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {
    if (game.user.isGM) {
        if (debug) console.info('⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. data variable: ', data)
        if (weatherAPIKey) {
            let cachedDate = SimpleCalendar.api.dateToTimestamp({
                year: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).year,
                month: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).month,
                day: SimpleCalendar.api.timestampToDate(simpleCalendarData.timestamp).day,
                hour: 0, minute: 0, seconds: 0
            })
            let currentDate = SimpleCalendar.api.dateToTimestamp({ year: data.date.year, month: data.date.month, day: data.date.day, hour: 0, minute: 0, seconds: 0 })
            let days = ((currentDate - cachedDate) / 86400) // index for the days array
            let hours = data.date.hour //index for the hours array
            if (!hourly) hours = 0;

            if (await hasDateChanged(currentDate)) {
                if (0 <= days && days <= currentConfig.querylength && mode === 'advanced')
                    await weatherUpdate({ hours: hours, days: days, fetchAPI: false, cacheData: false })
                else {
                    if (debug) console.warn("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange. No more cached data to use")
                    await weatherUpdate({ hours: hours, cacheData: false, queryLength: days }) //use the day with index 0, checking the api but without caching the result.
                }
            }

            if (await hasHourChanged(currentDate, hours) && hourly) {
                if (debug) console.info("⛅ SmallWeather Debug | SimpleCalendar.Hooks.DateTimeChange.: ", days, hours)
                if (0 <= days && days <= currentConfig.querylength && mode === 'advanced')
                    await weatherUpdate({ hours: hours, days: days, fetchAPI: false, cacheData: false })
                else
                    await weatherUpdate({ hours: hours, fetchAPI: false, cacheData: false })
            }
        }
    }
});

async function hasDateChanged(currentDate) {
    let lastDateUsed = game.settings.get(MODULE, "lastDateUsed")
    let previous = {
        day: SimpleCalendar.api.timestampToDate(lastDateUsed).day,
        month: SimpleCalendar.api.timestampToDate(lastDateUsed).month,
        year: SimpleCalendar.api.timestampToDate(lastDateUsed).year
    }
    let date = {
        day: SimpleCalendar.api.timestampToDate(currentDate).day,
        month: SimpleCalendar.api.timestampToDate(currentDate).month,
        year: SimpleCalendar.api.timestampToDate(currentDate).year
    }
    if (date.day !== previous.day
        || date.month !== previous.month
        || date.year !== previous.year) {
        await game.settings.set(MODULE, "lastDateUsed", game.time.worldTime)
        return 'true';
    }
    return false;
}
async function hasHourChanged(currentDate, hours) {
    let lastDateUsed = game.settings.get(MODULE, "lastDateUsed")
    let previous = {
        hour: SimpleCalendar.api.timestampToDate(lastDateUsed).hour,
        day: SimpleCalendar.api.timestampToDate(lastDateUsed).day,
        month: SimpleCalendar.api.timestampToDate(lastDateUsed).month,
        year: SimpleCalendar.api.timestampToDate(lastDateUsed).year
    }
    let date = {
        hour: hours,
        day: SimpleCalendar.api.timestampToDate(currentDate).day,
        month: SimpleCalendar.api.timestampToDate(currentDate).month,
        year: SimpleCalendar.api.timestampToDate(currentDate).year
    }
    if (date.hour !== previous.hour
        || date.day !== previous.day
        || date.month !== previous.month
        || date.year !== previous.year) {
        await game.settings.set(MODULE, "lastDateUsed", game.time.worldTime)
        return 'true';
    }
    return false;
}

async function injectIntoSmallTime(currentWeather, load) {
    if (!load) {
        Hooks.call('smallweatherUpdate', currentWeather, currentConfig.hourly);
        $("#weather-app").remove()
    }
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
        <div id="weather-text">${game.i18n.localize(currentWeather.weatherStr)}</div>
        </div>
        <div id="rightHandle"></div>
        </form>`
    const dragHandle = html.find('#dragHandle')
    const formGroup = dragHandle.closest("form")
    formGroup.after(injection)
    html.find('#rightHandle').on('click', async function () {
        if (!$('#weather-app').hasClass('show')) {
            $('#weather-app').addClass('show');
            $('#weather-app').animate({ width: '285px', left: "+=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
            $('#rightHandle').css("width", "291px")
            await game.settings.set(MODULE, 'show', true);

        } else {
            $('#weather-app').removeClass('show');
            $('#weather-app').animate({ width: '200px', left: "-=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px")
            $('#rightHandle').css("width", "206px")
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
        $('#rightHandle').css("width", "291px")
        $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
    }
}
async function injectIntoSmallTimePlayer(currentWeather, load) {
    if (!load) {
        $("#weather-app").remove()
    }
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
        <div id="weather-text">${game.i18n.localize(currentWeather.weatherStr)}</div>
        </div>
        <div id="rightHandle"></div>
        </form>`
    const dragHandle = html.find('#dragHandle')
    const formGroup = dragHandle.closest("form")
    formGroup.after(injection)
    html.find('#rightHandle').on('click', async function () {
        if (!$('#weather-app').hasClass('show')) {
            $('#weather-app').addClass('show');
            $('#weather-app').animate({ width: '255px', left: "+=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
            $('#rightHandle').css("width", "261px")
            await game.settings.set(MODULE, 'show', true);

        } else {
            $('#weather-app').removeClass('show');
            $('#weather-app').animate({ width: '200px', left: "-=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px")
            $('#rightHandle').css("width", "206px")
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
    show = game.settings.get(MODULE, 'show');
    if (show) {
        $('#weather-app').addClass('show');
        $('#weather-app').css("width", '255px')
        $('#weather-app').css("left", "+=200")
        $('#rightHandle').css("width", "261px")
        $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
    }
}

export async function weatherUpdate({ hours = 0, days = 0, fetchAPI = true, cacheData = true, queryLength = 0 } = {}, previewWeather = false) {
    let newWeather
    let currentWeather
    hourly = currentConfig.hourly // colocar como variavel global que muda sempre quando salva o cachesettings

    if (fetchAPI) {
        if (cacheData) newWeather = await getWeather({ hourly, days: queryLength, cacheData }); // here we get new data but using the query size specified by the user
        else newWeather = await getWeather({ hourly, days: queryLength, query: queryLength, cacheData }); // Here when we need new data but we only go for one more day
    } else if (previewWeather) {
        newWeather = previewWeather // here we are using the data fetched by the preview.
        await cacheWeatherData(previewWeather, days);
    }
    else newWeather = apiWeatherData

    if (debug) console.warn("⛅ SmallWeather Debug | weatherUpdate function. variable newWeather: ", newWeather.days[days].datetime, newWeather)

    if (typeof newWeather == 'number') return errorAPI(newWeather)

    if (hourly) currentWeather = newWeather.days[days].hours[hours]
    else currentWeather = newWeather.days[days]

    currentWeather = treatWeatherObj(currentWeather, system, newWeather.days[days].feelslikemax, newWeather.days[days].feelslikemin)

    await game.settings.set(MODULE, "lastDateUsed", game.time.worldTime)
    await game.settings.set(MODULE, "currentWeather", currentWeather)
    cacheSettings();

    if (debug) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable currentWeather: ", currentWeather)
    await injectIntoSmallTime(currentWeather)
}

export function missingAPI() {
    new Dialog({
        title: "SmallWeather | API key is missing!",
        content: '<p>In order to generate your API key go to:</p><a href="https://www.visualcrossing.com/sign-up">https://www.visualcrossing.com/sign-up</a><p>Then copy and paste it in SmallWeather settings.</p>',
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: "OK",
                callback: async () => {
                    return
                }
            },
        },
        default: "yes",
    }).render(true);
}
export function errorAPI(error) {
    new Dialog({
        title: "SmallWeather | API Error!",
        content: `<div id="errordialogcontent"><img id="errorsign" width="32"  style="border:none" src="${MODULE_DIR}/images/error.svg" ></img><span id="errordialog">API fetch method returned ${error} error.</span></div>`,
        buttons: {
            yes: {
                icon: "<i class='fas fa-check'></i>",
                label: "OK",
                callback: async () => {
                    return
                }
            },
        },
        default: "yes",
    }, { height: 120 }).render(true);
}

// Helper function for handling sockets.
function emitSocket(type, payload) {
    game.socket.emit('module.smallweather', {
        type: type,
        payload: payload,
    });
}
async function doSocket(data) {
    if (data.type === 'handleWeatherApp') {
        if (!game.user.isGM) handleWeatherApp(data.payload);
    }
}
function handleWeatherApp(weather) {
    return injectIntoSmallTimePlayer(weather, false)
}