# To-do

## General Stuff
- [x] keep a cached copy of the previous day weather, in case the GM needs to comeback in time.  
- [x] there is a problem with the hour/day button that is saving the state when it shouldn't.
- [ ] add check to see if the end date does not exceed the current date
- [ ] fix setclimate year problem for preview (already posted a comment with the solution)
- [x] add check for cases that the API fails
- [x] show different interface for player
- [ ] refresh the values of sunrise and sunset based on the values given by the API

## Types of Weather
- [x] "Partially cloudy", "Overcast"
- [x] ~~"Light Drizzle"~~, "Drizzle", ~~"Heavy Drizzle"~~
- [x] "Light Rain", "Rain", "Heavy Rain", "Rain Showers"
- [x] "Light Freezing Rain", "Freezing Rain", "Heavy Freezing Rain"
- [ ] "Ice", "Hail", "Hail Showers"
- [x] "Light Snow", "Snow", "Heavy Snow", "Snow Showers"
---
- [x] "Thunderstorm"
- [ ] "Thunderstorm Without Precipitation"
- [ ] "Lightning Without Thunder"
- [ ] "Funnel Cloud/Tornado"
---
- [ ] "Dust storm", "Diamond Dust"
---
- [ ] "Squalls"
- [ ] "Mist", "Fog", "Freezing Fog"
- [ ] "Smoke Or Haze"

## Requests
- [ ] save the weather into the date in simple calendar
- [ ] set the weather for future dates
- [ ] Add a Weather Roll Tables

## Bugs
- [ ] If you dont have the "Full" SmallTime window set (with ther Sun, The Time and Day/Month) - you loose SmallWeather info "space".
If you set only Sun + Time you get not (from your example) the "Partyaly Clouded" - as the space is lost ...
If you set only the Sun - it is nothing to see more in the SmallWeather window ...