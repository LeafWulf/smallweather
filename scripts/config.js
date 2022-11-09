import { MODULE, MODULE_DIR } from "./const.js";
import { debug, cacheSettings, mode, system } from "./settings.js";
import { dateToString, addDays, unit, stringfyWindDir, stringfyWindSpeed } from "./util.js";
import { setClimateWater } from "./climate.js";
import { weatherUpdate } from "./smallweather.js";
import { getWeather } from "./weatherdata.js";

export class ConfigApp extends FormApplication {
    static _isOpen = true;

    constructor() {
        super();
    }

    async _render(force = false, options = {}) {
        await super._render(force, options);
        ConfigApp._isOpen = true;
        // Remove the window from candidates for closing via Escape.
        // delete ui.windows[this.appId];
    }

    /********************************
    *** Shows the application window
    **/
    showApp() {
        this.render(true);
    }

    /**
    * Closes the application window
    **/
    closeApp() {
        this.close().catch(Logger.error);
    }

    async _updateObject(ev, formData) {
        if (debug) console.info(ev, formData)
        this.currentConfig = formData
        if (debug) console.info(this)
    }
    // async _onSubmit(ev, formData)
    // {
    //if (debug) console.info(ev, formData)
    // }
    // async _onChangeInput(ev, formData)
    // {
    //if (debug) console.info(ev, formData)
    // }

    static get defaultOptions() {
        this.initialPosition = {
            top: (screen.availHeight - 489) / 4,
            left: (screen.availWidth - 516) / 4
        }
        return mergeObject(super.defaultOptions, {
            classes: ['form'],
            popOut: true,
            submitOnChange: true,
            closeOnSubmit: false,
            minimizable: false,
            template: `${MODULE_DIR}/templates/config.html`,
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", initial: mode }],
            id: 'sw-config-app',
            title: 'SmallWeather Configuration',
            top: this.initialPosition.top,
            left: this.initialPosition.left,
            heigh: "auto",
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        let tab
        let currentHour
        let app = ui.activeWindow

        // if (debug) console.info('==============================================THIS', this)
        // this.appWindow = document.getElementById('sw-config')
        // this.appWindow.querySelector("#sw-config-save")?.addEventListener('click', async function () {
        //     await ConfigApp.writeInputValuesToObjects(document.getElementById('sw-config'))
        // })

        // $('#sw-config-save').on('click', async function () {
        //     ConfigApp.writeInputValuesToObjects(document.getElementById('sw-config'))
        // }) 

        // $('.item').on('click', async function () {
        //     // console.info(this)
        // })

        // let climateOptions = Array.from ($('select[name="climate"]')[0].options)
        // climateOptions.find(i=> i.value === climate).selected = true

        let climate = game.settings.get(MODULE, 'currentConfig').climate
        let climateOptions = Array.from(html.find('select[name="climate"]')[0])
        climateOptions.find(i => i.value === climate).selected = true

        html.find('#sw-config-save').on('click', async function () {
            tab = html.find('.tab.active').attr('data-tab')
            currentHour = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
            await ConfigApp.save(tab)
            await weatherUpdate({ hours: currentHour })
            game.modules.get(MODULE).configApp.close()
        })
        html.find('#apply-preview').on('click', async function () {
            tab = html.find('.tab.active').attr('data-tab')
            currentHour = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
            let preview = {
                dataUnit: system,
                location: app.currentConfig?.location || app.getData().location,
                date: app.currentConfig?.startdate || app.getData().startdate,
                dateFinal: addDays(app.currentConfig?.startdate || app.getData().startdate, app.currentConfig?.querylength || app.getData().querylength)
            }
            // if (tab === 'basic') //mudar valores de preview
            // console.warn(preview)
            let row = ''
            let previewWeather = await app.weatherUpdate({ hours: currentHour, cacheData: false }, preview);
            previewWeather.forEach(element => {
                row += `<tr>
                            <td><input type="radio"/></td>
                            <td>${element.feelslike}${unit(system)}</td>
                            <td>${element.conditions}</td>
                            <td>${stringfyWindSpeed(element.windspeed)}</td>
                            <td>${stringfyWindDir(element.winddir)}</td>
                            <td>${addDays(element.datetime,0)}</td>
                        </tr>`
            });
            $('.responstable').append(row)
            

            $('#weather-preview-table').addClass('show')
        })
    }

    async weatherUpdate({ hours = 0, days = 0, fetchAPI = true, cacheData = true, queryLength = 0 } = {}, preview = {}) {
        let newWeather
        let currentWeather

        newWeather = await getWeather({ days: queryLength, query: queryLength, cacheData }, preview);

        // if (hourly) currentWeather = newWeather.days[days].hours[hours]
        /* else */ currentWeather = newWeather.days

        if (true) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable currentWeather: ", currentWeather)

        return currentWeather
    }

    getData() {
        // Send values to the HTML template.
        let currentConfig = game.settings.get(MODULE, 'currentConfig')
        let currentWeather = game.settings.get(MODULE, 'currentWeather')
        let today = dateToString(new Date())
        let maxYear = new Date().getUTCFullYear() - 1
        return {
            location: currentConfig.location,
            startdate: currentConfig.startdate,
            querylength: currentConfig.querylength,
            today,
            currentWeather,
            maxYear,
            hourly: currentConfig.hourly ? 'checked' : 'unchecked',
            startyear: currentConfig.startyear,
            climate: currentConfig.climate
        }
    }

    //preciso validar os campos, se houve alteração e se são validos (não são strings vazias ou sei la oq)
    static async save(tab) {
        let formData = game.modules.get(MODULE).configApp.currentConfig
        if (debug) console.info(formData)
        if (formData) {
            // if (tab === 'basic') {

            // }
            await game.settings.set(MODULE, 'currentConfig', formData);
        }
        await game.settings.set(MODULE, 'mode', tab);
        cacheSettings();
    }

    // Toggle visibility of the main window.
    static async toggleAppVis(mode) {
        if (!game.modules.get('smalltime').viewAuth) return;
        else game.modules.get(MODULE).configApp = await new ConfigApp().render(true);
    }
}