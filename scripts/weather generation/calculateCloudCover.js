function calculateCloudCover(currentCloudCover, time, season, latitude, longitude, climate) {
    // calculate new cloud cover based on current cloud cover, time, season, latitude, longitude, and climate
    var cloudCover = currentCloudCover;

    // account for time of day
    var hour = time.getHours();
    if (hour >= 6 && hour <= 18) {
        cloudCover += (Math.random() * 2); // more clouds during the day
    } else {
        cloudCover -= (Math.random() * 2); // fewer clouds at night
    }

    // account for season
    if (season == "Spring") {
        cloudCover += (Math.random() * 2); // more clouds in spring
    } else if (season == "Summer") {
        cloudCover += (Math.random() * 3); // more clouds in summer
    } else if (season == "Autumn") {
        cloudCover += (Math.random() * 2); // more clouds in autumn
    } else if (season == "Winter") {
        cloudCover -= (Math.random() * 3); // fewer clouds in winter
    }

    // account for latitude
    cloudCover += (latitude * 0.5); // more clouds at higher latitudes

    // account for longitude
    cloudCover += (longitude * 0.5); // more clouds at higher longitudes

    // account for climate
    if (climate == "Tropical") {
        cloudCover += (Math.random() * 10); // larger random variation in tropical climates
    } else if (climate == "Temperate") {
        cloudCover += (Math.random() * 5); // larger random variation in temperate climates
    } else if (climate == "Arctic") {
        cloudCover += (Math.random() * 15); // larger random variation in arctic climates
    } else if (climate == "Desert") {
        cloudCover += (Math.random() * 3); // larger random variation in desert climates
    } else if (climate == "Mountain") {
        cloudCover += (Math.random() * 10); // larger random variation in mountain climates
    } else if (climate == "Coastal") {
        cloudCover += (Math.random() * 7); // larger random variation in coastal climates
    } else if (climate == "Rainforest") {
        cloudCover += (Math.random() * 15); // larger random variation in rainforest climates
    }

    // limit cloud cover to a minimum of 0 and a maximum of 100
    cloudCover = Math.max(0, cloudCover);
    cloudCover = Math.min(100, cloudCover);

    return cloudCover;
}
