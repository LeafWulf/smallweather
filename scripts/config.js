import { MODULE, MODULE_DIR } from "./const.js";
import { debug, cacheSettings, mode, system, currentConfig, currentWeather, weatherAPIKey } from "./settings.js";
import { treatWeatherObj, dateToString, addDays, unit, stringfyWindDir, stringfyWindSpeed, roundNoFloat, fahrToCelsius, capitalizeFirstLetter, stringfyWeather, inToMm } from "./util.js";
import { setClimateWater } from "./climate.js";
import { weatherUpdate, missingAPI, errorAPI } from "./smallweather.js";
import { getWeather } from "./weatherdata.js";

export class ConfigApp extends FormApplication {
    static _isOpen = true;

    constructor() {
        super();
    }

    // render(force = false, options = {}) {
    //     if (!weatherAPIKey) return missingAPI()
    //     else super.render(force, options);
    // }

    async _render(force = false, options = {}) {
        if (!weatherAPIKey) return missingAPI()
        else {
            await super._render(force, options);
            ConfigApp._isOpen = true;
        }
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
        console.log(formData)
        this.currentConfig = formData
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
        let previewValue
        let row
        let app = ui.activeWindow
        
        if (!game.modules.get('smallweather').configApp) game.modules.get('smallweather').configApp = app

        // if (!app.previewWeather) html.find('#weather-preview').css("display", "none")

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

        let climate = game.settings.get(MODULE, 'currentConfig')?.climate || 'tropical'
        let climateOptions = Array.from(html.find('select[name="climate"]')[0])
        climateOptions.find(i => i.value === climate).selected = true

        html.find('#sw-config-save').on('click', async function () {
            previewValue = Array.from($('.responstable').find('input[type="radio"]')).find(i => i.checked === true)?.value
            tab = html.find('.tab.active').attr('data-tab')
            currentHour = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
            await ConfigApp.save(tab)
            if (previewValue) {
                await game.settings.set(MODULE, 'currentConfig', app.currentConfig);
                cacheSettings();
                await weatherUpdate({ days: previewValue, hours: currentHour, fetchAPI: app.currentConfig.hourly }, app.previewWeather)
            }
            else await weatherUpdate({ hours: currentHour })
            $('#weather-preview-table').removeClass('show')
            await new Promise(resolve => setTimeout(resolve, 300));
            game.modules.get(MODULE).configApp.close()
        })
        html.find('#apply-preview').on('click', async function () {
            $(".pwtable").empty()
            $('#weather-preview').remove()
            tab = html.find('.tab.active').attr('data-tab')
            await game.settings.set(MODULE, 'mode', tab);
            cacheSettings();
            currentHour = SimpleCalendar.api.timestampToDate(game.time.worldTime).hour
            let injectPreview = ''
            let preview
            row = ''
            if (tab === 'advanced') {
                preview = {
                    location: app.currentConfig?.location || app.getData().location,
                    date: app.currentConfig?.startdate || app.getData().startdate,
                    dateFinal: addDays(app.currentConfig?.startdate || app.getData().startdate, app.currentConfig?.querylength || app.getData().querylength)
                }
            }
            if (tab === 'basic') {
                climate = Array.from($('select[name="climate"]')[0]).find(i => i.selected === true).value
                preview = setClimateWater(climate, 0); //arruma a soma desses dias (segundo argumento) e resolvo o problema do ano.
            }
            let previewWeather = await app.weatherUpdate({ cacheData: false }, preview);
            if (typeof previewWeather == 'number') return errorAPI(previewWeather)
            if (tab === 'basic') {
                let element = treatWeatherObj(previewWeather.days[0], system, previewWeather.days[0].feelslikemax, previewWeather.days[0].feelslikemin)
                injectPreview = `<fieldset id="weather-preview">
                                    <legend id="wpreview">
                                        <span>Preview Weather: ${capitalizeFirstLetter(climate)}</span>
                                    </legend>
                                    <div id="preview-temp">
                                        <img id="preview-temp-icon" src="/modules/smallweather/images/${element.icon}.webp"
                                            style="border: none;"></img>
                                        <span id="temp"> ${element.feelslikeC}${element.unit}</span>
                                    </div>
                                    <div id="preview-info">
                                        <i class="fas fa-temperature-high" id="fa-icon"></i><span id="temp">
                                        ${currentWeather.feelslikemaxC}${currentWeather.unit}</span><br>
                                        <i class="fas fa-temperature-low" id="fa-icon"></i><span id="temp">
                                        ${currentWeather.feelslikeminC}${currentWeather.unit}</span>
                                    </div>
                                    <div id="preview-info">
                                        <i class="fas fa-wind" id="fa-icon"></i><span id="temp"> ${stringfyWindSpeed(element.windspeed)}</span><br>
                                        <i class="far fa-compass" id="fa-icon"></i><span id="temp"> ${stringfyWindDir(element.winddir)}</span>
                                    </div><br>
                                    <div id="preview-info" class="preview-string">${game.i18n.localize(currentWeather.weatherStr)}</div>
                                </fieldset>`

                $("#separator-sw-config").after(injectPreview);
            }
            if (tab === 'advanced') {
                previewWeather.days.forEach((element, index) => {
                    row += `<tr class="pwtable">
                            <td><input type="radio" name="selpreview" value=${index}></td>
                            <td>${roundNoFloat(fahrToCelsius(system, element.feelslike))}${unit(system)}</td>
                            <td>${element.conditions}</td>
                            <td>${stringfyWindSpeed(element.windspeed)}</td>
                            <td>${stringfyWindDir(element.winddir)}</td>
                            <td>${addDays(element.datetime, 0)}</td>
                        </tr>`
                });
                $('.responstable').append(row)
                $('#weather-preview-table').css('left', app.position.width)
            }
            app.previewWeather = previewWeather
            app.previewConfig = app.currentConfig
            // html.find('#weather-preview').css("display", "flex")
            $('#weather-preview-table').addClass('show')
        })
        html.find('.item[data-tab="advanced"]').on('click', async function () {
            $('#weather-preview').remove()
        })
        html.find('.item[data-tab="basic"]').on('click', async function () {
            $('#weather-preview-table').removeClass('show')
        })
    }

    async weatherUpdate({ hours = 0, days = 0, fetchAPI = true, cacheData = true, queryLength = 0 } = {}, preview = {}) {
        let newWeather
        newWeather = await getWeather({ days: queryLength, query: queryLength, cacheData }, preview);
        if (debug) console.info("⛅ SmallWeather Debug | weatherUpdate function. variable newWeather: ", newWeather)
        return newWeather
    }

    getData() {
        // Send values to the HTML template.
        // let currentConfig = game.settings.get(MODULE, 'currentConfig')
        // let currentWeather = game.settings.get(MODULE, 'currentWeather')
        let today = dateToString(new Date())
        return {
            location: currentConfig?.location || 'Havana',
            startdate: currentConfig?.startdate || '2009-01-01',
            querylength: currentConfig?.querylength || 1,
            today,
            currentWeather,
            hourly: currentConfig.hourly ? 'checked' : 'unchecked',
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
        else game.modules.get('smallweather').configApp = await new ConfigApp().render(true);
    }
}