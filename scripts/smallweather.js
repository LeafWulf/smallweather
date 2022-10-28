

Hooks.on('renderSmallTimeApp', function (app, html) {
    const injection = `<form class="flexcol" id="weather-app">
                        <div id="displayContainer">
                            <div id="current-temp">
                                <img id="temp-icon" src="/modules/weatherfx/images/clearSky.webp" alt="heavyRain"></img>
                                <span id="temp"> 68.7F</span>
                            </div>
                            <div id="high-low">
                                <i class="fas fa-temperature-high" id="fa-icon"></i><span id="temp"> 78.8F</span><br>
                                <i class="fas fa-temperature-low" id="fa-icon"></i><span id="temp"> 60.6F</span>
                            </div>
                            <div id="wind">
                                <i class="fas fa-wind" id="fa-icon"></i><span id="temp"> Moderate Breeze</span><br>
                                <i class="far fa-compass" id="fa-icon"></i><span id="temp"> SE</span>
                            </div>
                            <div id="weather-text">Clear conditions throughout the day.</div>
                        </div>
                        <div id="rightHandle"></div>
                        </form>`;
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