import { MODULE, MODULE_DIR } from "./const.js";
import { debug, cacheSettings, mode } from "./settings.js";
import { dateToString } from "./util.js";
import { setClimateWater } from "./climate.js";
import { weatherUpdate } from "./smallweather.js";

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
            top: ((screen.availHeight) / 2) - 272,
            left: (screen.availWidth - 516) / 2
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
        climateOptions.find(i=> i.value === climate ).selected = true

        html.find('#sw-config-save').on('click', async function () {
            let tab = html.find('.tab.active').attr('data-tab')
            let currentHour = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
            await ConfigApp.save(tab)
            await weatherUpdate(currentHour)
            game.modules.get(MODULE).configApp.close()
        })
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
            await game.settings.set(MODULE, 'currentConfig', formData);
            // if (tab === 'basic') // chamar a função, não sei qual ainda
            await game.settings.set(MODULE, 'mode', tab);
            cacheSettings();
        }
    }

    //Daqui pra baixo deu errado, eu nao soube fazer. Inventei diferente pra conseguir rodar.

    static async writeInputValuesToObjects(root) {
        await this.getInputValue('location', '', root);
    }

    static async getInputValue(selector, defaultVal, root) {
        const el = root.querySelector(`input[name=${selector}]`);
        el ? el.value : defaultVal;
        await game.settings.set(MODULE, selector, el);
        cacheSettings();
        // if (debug) console.info(el)
    }

    // Toggle visibility of the main window.
    static async toggleAppVis(mode) {
        if (!game.modules.get('smalltime').viewAuth) return;
        else game.modules.get(MODULE).configApp = await new ConfigApp().render(true);
    }

}