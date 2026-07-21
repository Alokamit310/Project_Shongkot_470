const fetch = require('node-fetch');
const District = require('../models/District');
const WeatherHistory = require('../models/WeatherHistory');
const { seedDistricts } = require('../scripts/seedDistricts');

function calculateRisk(rainfall, humidity, temperature) {
  if (rainfall > 80 || humidity > 95) return 'High';
  if (rainfall > 20 || humidity > 85) return 'Medium';
  return 'Low';
}

async function fetchWeatherForDistrict(district) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${district.latitude}&longitude=${district.longitude}&hourly=precipitation,relative_humidity_2m,temperature_2m&forecast_days=1`;

  console.log(`[weather] updating district=${district.name}`);
  console.log(`[weather] request=${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = await response.json();
  const hourly = data?.hourly || {};
  const rainfall = Number(hourly.precipitation?.[0] ?? 0);
  const humidity = Number(hourly.relative_humidity_2m?.[0] ?? 0);
  const temperature = Number(hourly.temperature_2m?.[0] ?? 0);
  const riskLevel = calculateRisk(rainfall, humidity, temperature);

  console.log(`[weather] response district=${district.name} rainfall=${rainfall} humidity=${humidity} temperature=${temperature}`);

  const updatedDistrict = await District.findOneAndUpdate(
    { name: district.name },
    {
      name: district.name,
      division: district.division,
      latitude: district.latitude,
      longitude: district.longitude,
      floodRisk: riskLevel,
      rainfall,
      temperature,
      humidity,
      weatherSummary: `${rainfall.toFixed(1)} mm rain • ${temperature.toFixed(1)}°C • ${humidity.toFixed(0)}% humidity`,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  await WeatherHistory.create({
    district: district.name,
    rainfall,
    temperature,
    humidity,
    floodRisk: riskLevel,
  });

  console.log(`[weather] success district=${district.name} saved id=${updatedDistrict._id}`);

  return {
    district: district.name,
    floodRisk: riskLevel,
    rainfall,
    temperature,
    humidity,
    lastUpdated: updatedDistrict.lastUpdated,
  };
}

async function fetchAllDistricts() {
  console.log('[weather] starting batch update');
  await seedDistricts();

  const districts = await District.find({}, { name: 1, division: 1, latitude: 1, longitude: 1 }).sort({ name: 1 }).lean();

  const results = [];
  for (const district of districts) {
    try {
      const result = await fetchWeatherForDistrict(district);
      results.push(result);
    } catch (error) {
      console.error(`[weather] failed district=${district.name} error=${error.message}`);
    }
  }

  console.log(`[weather] batch complete updated=${results.length}`);
  return results;
}

module.exports = { fetchAllDistricts, fetchWeatherForDistrict };