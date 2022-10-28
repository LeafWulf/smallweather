import { MODULE } from "./const.js"

export let toggleApp = null;
export let weatherAPI = null;
export let currentWeather = null;

export function registerSettings() {

    game.settings.register(MODULE, 'weatherAPI', {
        name: 'Weather API',
        hint: `Fetch weather data from an online API instead of locally generating it.`,
        scope: 'world',
        config: true,
        type: String,
        default: false,
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
}

// function that get the settings options and assign to the variables
export function cacheWfxSettings() {
    toggleApp = game.settings.get(MODULE, 'toggleApp');
    currentWeather = game.settings.get(MODULE, 'currentWeather');
    weatherAPI = game.settings.get(MODULE, 'weatherAPI');
}
