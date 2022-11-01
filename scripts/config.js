import { MODULE, MODULE_DIR } from "./const.js";
import { debug, cacheWfxSettings } from "./settings.js";

export class ConfigApp extends FormApplication {
    static _isOpen = true;

    constructor() {
        super();
    }

    async _render(force = false, options = {}) {
        await super._render(force, options);
        ConfigApp._isOpen = true;
        // Remove the window from candidates for closing via Escape.
        delete ui.windows[this.appId];
    }

    /**
    * Shows the application window
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
        if (debug) console.log(ev, formData)
        this.currentConfig = formData
        if (debug) console.log(this)
    }
    // async _onSubmit(ev, formData)
    // {
    //if (debug) console.log(ev, formData)
    // }
    // async _onChangeInput(ev, formData)
    // {
    //if (debug) console.log(ev, formData)
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
            id: 'sw-config-app',
            title: 'SmallWeather Config',
            top: this.initialPosition.top,
            left: this.initialPosition.left,
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        this.appWindow = document.getElementById('sw-config')
        // if (debug) console.log('==============================================THIS',this)

        // this.appWindow.querySelector("#sw-config-save")?.addEventListener('click', async function () {
        //     await ConfigApp.writeInputValuesToObjects(document.getElementById('sw-config'))
        // })
        // $('#sw-config-save').on('click', async function () {
        //     ConfigApp.writeInputValuesToObjects(document.getElementById('sw-config'))
        // }) 
        html.find('#sw-config-save').on('click', async function () {
            await ConfigApp.save()
            game.modules.get(MODULE).configApp.close()
        })
    }

    getData() {
        // Send values to the HTML template.
        let currentConfig = game.settings.get(MODULE, 'currentConfig')
        return {
            location: currentConfig.location,
            startdate: currentConfig.startdate,
            querylength: currentConfig.querylength
        }
    }

    //preciso validar os campos, se houve alteração e se são validos (não são strings vazias ou sei la oq)
    static async save() {
        let formData = game.modules.get(MODULE).configApp.currentConfig
        if (debug) console.log(formData)
        if (formData) {
            await game.settings.set(MODULE, 'currentConfig', formData);
            cacheWfxSettings();
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
        cacheWfxSettings();
        // if (debug) console.log(el)
    }

    // Toggle visibility of the main window.
    static async toggleAppVis(mode) {
        if (!game.modules.get('smalltime').viewAuth) return;
        else game.modules.get(MODULE).configApp = await new ConfigApp().render(true);
    }

}