/**
 * Calculates carbon footprint based on weekly/monthly habits.
 * Returns emissions in kg CO2 per year.
 */
const calculateCarbonScore = (answers) => {
  const {
    carKm = 0,
    bikeKm = 0,
    publicTransportKm = 0,
    flightsPerYear = 0,
    electricityUnits = 0, // monthly kWh
    acHours = 0, // daily hours
    appliancesUsage = 'medium', // 'low', 'medium', 'high'
    diet = 'mixed', // 'vegetarian', 'mixed', 'non-vegetarian'
    plasticUsage = 'medium', // 'low', 'medium', 'high'
    recyclingHabits = 'none', // 'all', 'some', 'none'
    garbageGeneration = 'medium' // 'low', 'medium', 'high'
  } = answers;

  // 1. Transportation (kg CO2 / year)
  // Car: 0.18 kg CO2 per km
  const carEmissions = parseFloat(carKm) * 52 * 0.18;
  // Bike: 0.005 kg CO2 per km (mostly food calorie offset or manufacturing)
  const bikeEmissions = parseFloat(bikeKm) * 52 * 0.005;
  // Public Transport: 0.04 kg CO2 per km
  const publicTransportEmissions = parseFloat(publicTransportKm) * 52 * 0.04;
  // Flights: Average short/medium haul flight is around 500 kg CO2
  const flightEmissions = parseFloat(flightsPerYear) * 500;

  const transportScore = carEmissions + bikeEmissions + publicTransportEmissions + flightEmissions;

  // 2. Energy Usage (kg CO2 / year)
  // Electricity: 1 unit (kWh) = 0.5 kg CO2 (approx global average)
  const electricityEmissions = parseFloat(electricityUnits) * 12 * 0.5;
  // AC: ~1.2 kWh per hour of usage
  const acEmissions = parseFloat(acHours) * 365 * 1.2 * 0.5;
  // Appliances: Base appliance consumption
  let applianceEmissions = 150; // low
  if (appliancesUsage === 'medium') applianceEmissions = 400;
  if (appliancesUsage === 'high') applianceEmissions = 900;

  const energyScore = electricityEmissions + acEmissions + applianceEmissions;

  // 3. Food Habits (kg CO2 / year)
  // Standard annual food footprint estimates
  let foodScore = 1500; // Vegetarian / Vegan
  if (diet === 'mixed') foodScore = 2500; // Average mixed diet
  if (diet === 'non-vegetarian') foodScore = 3600; // Meat heavy diet

  // 4. Waste (kg CO2 / year)
  // Plastic usage
  let plasticEmissions = 50;
  if (plasticUsage === 'medium') plasticEmissions = 150;
  if (plasticUsage === 'high') plasticEmissions = 350;

  // Garbage volume
  let garbageEmissions = 100;
  if (garbageGeneration === 'medium') garbageEmissions = 300;
  if (garbageGeneration === 'high') garbageEmissions = 700;

  // Recycling reduction
  let recyclingDiscount = 1.0; // No discount
  if (recyclingHabits === 'all') recyclingDiscount = 0.5; // 50% reduction
  if (recyclingHabits === 'some') recyclingDiscount = 0.8; // 20% reduction

  const wasteScore = (plasticEmissions + garbageEmissions) * recyclingDiscount;

  // Total annual emissions in kg CO2
  const totalKgCO2 = transportScore + energyScore + foodScore + wasteScore;
  const annualEstimationTons = totalKgCO2 / 1000; // in metric tons CO2

  // Category Zones
  // Green: < 3 tons CO2/year
  // Yellow: 3 to 7 tons CO2/year
  // Red: > 7 tons CO2/year
  let category = 'yellow';
  if (annualEstimationTons < 3) {
    category = 'green';
  } else if (annualEstimationTons > 7) {
    category = 'red';
  }

  return {
    totalKgCO2: Math.round(totalKgCO2),
    annualEstimationTons: parseFloat(annualEstimationTons.toFixed(2)),
    category,
    breakdown: {
      transport: Math.round(transportScore),
      energy: Math.round(energyScore),
      food: Math.round(foodScore),
      waste: Math.round(wasteScore)
    }
  };
};

module.exports = {
  calculateCarbonScore
};
