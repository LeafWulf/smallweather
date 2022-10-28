import { MODULE, MODULE_DIR } from "./const.js";
import { registerSettings, cacheWfxSettings, toggleApp } from "./settings.js";
import { generateWeather } from "./weatherdata.js";

Hooks.on('renderSmallTimeApp', async function (app, html) {
    const template = await fetch(`modules/smallweather/templates/smallweather.html`);
    const injection = await template.text();
    const dragHandle = html.find('#dragHandle')
    const formGroup = dragHandle.closest("form");
    formGroup.after(injection);
    html.find('#rightHandle').on('click', async function () {
        if (!$('#weather-app').hasClass('show')) {
            $('#weather-app').addClass('show');
            $('#weather-app').animate({ width: '280px', left: "+=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px 0 0 5px")
        } else {
            $('#weather-app').removeClass('show');
            $('#weather-app').animate({ width: '200px', left: "-=200" }, 80);
            $("#smalltime-app .window-content").css("border-radius", "5px")
            // await game.settings.set('weatherfx', 'show', false);
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
    const dateDisplayHidden = 'matrix(1, 0, 0, 0, 0, 0)';
    if ($('#dateDisplay').css('transform') === dateDisplayHidden) {
        $("#weather-text").css("display", "none")
        $("#weather-app").css("height", $("#smalltime-app").css("height"))
    }
})