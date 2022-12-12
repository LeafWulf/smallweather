function calculateWindSpeed(currentWindSpeed, time, season, latitude, longitude, climate) {
  // calculate new wind speed based on current wind speed, time, season, latitude, longitude, and climate
  var windSpeed = currentWindSpeed;

  // account for time of day
  var hour = time.getHours();
  if (hour >= 6 && hour <= 18) {
    windSpeed += (Math.random() * 2); // stronger winds during the day
  } else {
    windSpeed -= (Math.random() * 2); // weaker winds at night
  }

  // account for season
  if (season == "Spring") {
    windSpeed += (Math.random() * 2); // stronger winds in spring
  } else if (season == "Summer") {
    windSpeed += (Math.random() * 3); // stronger winds in summer
  } else if (season == "Autumn") {
    windSpeed += (Math.random() * 2); // stronger winds in autumn
  } else if (season == "Winter") {
    windSpeed -= (Math.random() * 3); // weaker winds in winter
  }

  // account for latitude
  windSpeed += (latitude * 0.5); // stronger winds at higher latitudes

  // account for longitude
  windSpeed += (longitude * 0.5); // stronger winds at higher longitudes

  // account for climate
  if (climate == "Tropical") {
    windSpeed += (Math.random() * 5); // larger random variation in tropical climates
  } else if (climate == "Temperate") {
    windSpeed += (Math.random() * 3); // larger random variation in temperate climates
  } else if (climate == "Arctic") {
    windSpeed += (Math.random() * 7); // larger random variation in arctic climates
  } else if (climate == "Desert") {
    windSpeed += (Math.random() * 2); // larger random variation in desert climates
  } else if (climate == "Mountain") {
    windSpeed += (Math.random() * 6); // larger random variation in mountain climates
  } else if (climate == "Coastal") {
    windSpeed += (Math.random() * 4); // larger random variation in coastal climates
  } else if (climate == "Rainforest") {
    windSpeed += (Math.random() * 3); // larger random variation in rainforest climates
  }

  // limit wind speed to a minimum of 0 and a maximum of 100
  windSpeed = Math.max(0, windSpeed);
  windSpeed = Math.min(100, windSpeed);

  return windSpeed;
}
