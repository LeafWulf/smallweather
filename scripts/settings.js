import { MODULE } from "./const.js"

export let toggleApp = null;
export let weatherAPIKey = null;
export let currentWeather = null;
export let unit = {
    temp: 'ºC',
    unit: 'metric'
}
export let currentConfig = {
    location: '',
    startdate: '',
    querylength: ''
}

export let lastDateUsed
export let apiWeatherData
export let simpleCalendarData
export let apiParametersCache
export let debug = true

export function registerSettings() {
    game.settings.register(MODULE, 'weatherAPIKey', {
        name: 'Weather API',
        hint: `Fetch weather data from an online API instead of locally generating it.`,
        scope: 'world',
        config: true,
        type: String,
        default: '',
        restricted: true,
        onChange: () => {
            cacheWfxSettings();
        },
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
            cacheWfxSettings();
        },
    });

    game.settings.register(MODULE, 'toggleApp', {
        name: 'toggleApp',
        hint: '',
        scope: 'world',
        config: false,
        type: Number,
        default: 1,
        restricted: true,
        onChange: () => {
            cacheWfxSettings();
        },
    });

    game.settings.register(MODULE, 'show', {
        name: 'show',
        hint: '',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        restricted: true,
        onChange: () => {
            cacheWfxSettings();
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
            cacheWfxSettings();
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
            cacheWfxSettings();
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
            cacheWfxSettings();
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
            cacheWfxSettings();
        },
    });
    game.settings.register(MODULE, 'lastDateUsed', {
        name: 'lastDateUsed',
        hint: ``,
        scope: 'world',
        config: false,
        type: String,
        default: '',
        restricted: true,
        onChange: () => {
            cacheWfxSettings();
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
            cacheWfxSettings();
        },
    });
}

// function that get the settings options and assign to the variables
export async function cacheWfxSettings() {
    toggleApp = game.settings.get(MODULE, 'toggleApp');
    currentWeather = game.settings.get(MODULE, 'currentWeather');
    weatherAPIKey = game.settings.get(MODULE, 'weatherAPIKey');
    currentConfig = game.settings.get(MODULE, 'currentConfig');
    apiWeatherData = game.settings.get(MODULE, 'apiWeatherData');
    simpleCalendarData = game.settings.get(MODULE, 'simpleCalendarData');
    debug = game.settings.get(MODULE, 'debug');
    apiParametersCache = game.settings.get(MODULE, 'apiParametersCache');
    lastDateUsed = game.settings.get(MODULE, 'lastDateUsed');
}
