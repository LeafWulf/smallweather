import { ConfigApp } from "./config.js";
import { MODULE } from "./const.js"
import { weatherUpdate } from "./smallweather.js";

export let mode = 'basic';
export let weatherAPIKey = null;
export let currentWeather = {
    feelslikeC: 20,
    feelslikemaxC: 25,
    feelslikeminC: 17,
    winddirFriendly: 'North',
    windspeedFriendly: 'Gentle Breeze',
    conditions: 'clear',
    unit: 'F',
    icon: 'clear-day'
};
export let system = 'us'
export let currentConfig = {
    location: 'Havana',
    startdate: '2009-01-01',
    querylength: '1',
    climate: 'tropical',
    hourly: false
}

export let lastDateUsed
export let apiWeatherData
export let simpleCalendarData
export let apiParametersCache
export let debug = false
export let allowPlayers = false

export function registerSettings() {
    game.settings.register(MODULE, 'weatherAPIKey', {
        name: 'Weather API Key',
        hint: `In order to generate your API key go to: https://www.visualcrossing.com/sign-up, save it and paste up here. `,
        scope: 'world',
        config: true,
        type: String,
        default: '',
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'unitSystem', {
        name: 'Unit System',
        hint: `Choose the unit system.`,
        scope: 'world',
        config: true,
        type: String,
        choices: {
            "us": "Imperial/US",
            "metric": "Metric"
        },
        default: system,
        restricted: true,
        onChange: async () => {
            cacheSettings();
            await weatherUpdate(0, false, false);
        },
    });
    game.settings.register(MODULE, 'allowPlayers', {
        name: 'Allow Players To See Weather App ',
        hint: `Allow players to have the weather app and see the current weather information.`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: allowPlayers,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.registerMenu(MODULE, "weatherApiConfig", {
        name: "Weather API Configuration",
        label: "Weather API",
        hint: "Dialog for API fetch configuration, this can be accessed in the module floating window too.",
        icon: 'fas fa-cogs',
        type: ConfigApp,
        restricted: true
    });


    game.settings.register(MODULE, 'currentWeather', {
        name: 'weatherData',
        hint: '',
        scope: 'world',
        config: false,
        type: Object,
        default: currentWeather,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'mode', {
        name: 'mode',
        hint: '',
        scope: 'world',
        config: false,
        type: String,
        default: mode,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'show', {
        name: 'show',
        hint: '',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });

    /**********************
    CONFIG WINDOW SETTINGS
    **********************/
    game.settings.register(MODULE, 'currentConfig', {
        name: 'currentConfig',
        hint: ``,
        scope: 'world',
        config: false,
        type: Object,
        default: currentConfig,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'apiWeatherData', {
        name: 'apiWeatherData',
        hint: ``,
        scope: 'world',
        config: false,
        type: Object,
        default: null,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'simpleCalendarData', {
        name: 'simpleCalendarData',
        hint: ``,
        scope: 'world',
        config: false,
        type: Object,
        default: '',
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'apiParametersCache', {
        name: 'apiParametersCache',
        hint: ``,
        scope: 'world',
        config: false,
        type: Object,
        default: '',
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
    game.settings.register(MODULE, 'lastDateUsed', {
        name: 'lastDateUsed',
        hint: ``,
        scope: 'world',
        config: false,
        type: Number,
        default: '',
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });

    /**********************
    DEBUG
    **********************/
    game.settings.register(MODULE, 'debug', {
        name: 'Debug',
        hint: `Activate debug to show console logs`,
        scope: 'world',
        config: true,
        type: Boolean,
        default: debug,
        restricted: true,
        onChange: () => {
            cacheSettings();
        },
    });
}

// function that get the settings options and assign to the variables
export async function cacheSettings() {
    mode = game.settings.get(MODULE, 'mode');
    system = game.settings.get(MODULE, 'unitSystem');
    currentWeather = game.settings.get(MODULE, 'currentWeather');
    weatherAPIKey = game.settings.get(MODULE, 'weatherAPIKey');
    currentConfig = game.settings.get(MODULE, 'currentConfig');
    apiWeatherData = game.settings.get(MODULE, 'apiWeatherData');
    simpleCalendarData = game.settings.get(MODULE, 'simpleCalendarData');
    debug = game.settings.get(MODULE, 'debug');
    allowPlayers = game.settings.get(MODULE, 'allowPlayers');
    apiParametersCache = game.settings.get(MODULE, 'apiParametersCache');
    lastDateUsed = game.settings.get(MODULE, 'lastDateUsed');
}
