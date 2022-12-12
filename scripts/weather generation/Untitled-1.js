// initial temperature in Celsius
var temperature = 22;

// location and climate information
var location = "Fantasy World";
var climate = "Tropical";

function updateTemperature() {
  // retrieve current temperature in location
  var currentTemperature = getCurrentTemperature(location, climate);

  // calculate new temperature based on current temperature, location, and climate
  temperature = calculateTemperature(currentTemperature, location, climate);

  // update temperature every hour
  setInterval(updateTemperature, 3600 * 1000);
}

function calculateTemperature(currentTemperature, location, climate) {
  // calculate new temperature based on current temperature, location, and climate
  var newTemperature = currentTemperature;

  // account for climate
  if (climate == "Tropical") {
    newTemperature += (Math.random() * 3); // larger random variation in tropical climates
  } else if (climate == "Temperate") {
    newTemperature += (Math.random() - 0.5); // small random variation in temperate climates
  } else if (climate == "Arctic") {
    newTemperature -= (Math.random() * 2); // larger random variation in arctic climates
  } else if (climate == "Desert") {
    newTemperature += (Math.random() * 5); // larger random variation in desert climates
  } else if (climate == "Mountain") {
    newTemperature -= (Math.random() * 3); // larger random variation in mountain climates
  } else if (climate == "Coastal") {
    newTemperature += (Math.random() - 0.5); // small random variation in coastal climates
  } else if (climate == "Rainforest") {
    newTemperature += (Math.random() * 3); // larger random variation in rainforest climates
  }

  return newTemperature;
}

function getCurrentTemperature(location, climate) {
  // retrieve current temperature in location
  var currentTemperature = 0;

  if (climate == "Tropical") {
    currentTemperature = getRandomTemperature(26, 32); // random temperature between 26 and 32 in tropical climates
  } else if (climate == "Temperate") {
    currentTemperature = getRandomTemperature(15, 21); // random temperature between 15 and 21 in temperate climates
  } else if (climate == "Arctic") {
    currentTemperature = getRandomTemperature(-6, -17); // random temperature between -6 and -17 in arctic climates
  } else if (climate == "Desert") {
    currentTemperature = getRandomTemperature(32, 50); // random temperature between 32 and 50 in desert climates
  } else if (climate == "Mountain") {
    currentTemperature = getRandomTemperature(-1, 4); // random temperature between -1 and 4 in mountain climates
  } else if (climate == "Coastal") {
    currentTemperature = getRandomTemperature(10, 16); // random temperature between 10 and 16 in coastal climates
  } else if (climate == "Rainforest") {
    currentTemperature = getRandomTemperature(26, 32); // random temperature between 26 and 32 in rainforest climates
  }

  return currentTemperature;
}

function getRandomTemperature(min, max) {
  // return random temperature between
