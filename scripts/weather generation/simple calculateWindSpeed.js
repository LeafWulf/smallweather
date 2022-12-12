function calculateWindSpeed(currentWindSpeed, location, climate) {
  // calculate new wind speed based on current wind speed, location, and climate
  var windSpeed = currentWindSpeed;

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

  return windSpeed;
}
