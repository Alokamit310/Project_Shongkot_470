const fetch = require("node-fetch");

const District = require("../models/District");
const WeatherHistory = require("../models/WeatherHistory");

const { seedDistricts } = require("../scripts/seedDistricts");
const { predictFloodRisk } = require("./aiService");


function average(values) {
  if (!values.length) return 0;

  return (
    values.reduce(
      (sum, value) => sum + Number(value || 0),
      0
    ) / values.length
  );
}


async function fetchWeatherForDistrict(district) {

  const month = new Date().getMonth() + 1;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${district.latitude}` +
    `&longitude=${district.longitude}` +
    `&daily=` +
      `temperature_2m_max,` +
      `temperature_2m_min,` +
      `precipitation_sum,` +
      `relative_humidity_2m_mean,` +
      `cloud_cover_mean` +
    `&past_days=30` +
    `&forecast_days=1` +
    `&timezone=auto`;

  console.log(
    `[weather] updating district=${district.name}`
  );

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Open-Meteo request failed with status ${response.status}`
    );
  }

  const data = await response.json();


  // ==================================================
  // Get last 30 COMPLETED days
  // Open-Meteo gives 30 past days + current day = 31
  // Current day may be incomplete, so exclude it.
  // ==================================================

  const dates =
    data?.daily?.time || [];

  const rainfallValues =
    (data?.daily?.precipitation_sum || []).slice(0, -1);

  const humidityValues =
    (data?.daily?.relative_humidity_2m_mean || []).slice(0, -1);

  const maxTempValues =
    (data?.daily?.temperature_2m_max || []).slice(0, -1);

  const minTempValues =
    (data?.daily?.temperature_2m_min || []).slice(0, -1);

  const cloudValues =
    (data?.daily?.cloud_cover_mean || []).slice(0, -1);


  if (
    rainfallValues.length !== 30 ||
    humidityValues.length !== 30 ||
    maxTempValues.length !== 30 ||
    minTempValues.length !== 30 ||
    cloudValues.length !== 30
  ) {
    throw new Error(
      `Expected 30 completed weather days, received ${rainfallValues.length}`
    );
  }


  // ==================================================
  // Convert 30-day weather into model features
  // ==================================================

  // 30-day cumulative rainfall
  const rainfall = rainfallValues.reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );


  // 30-day average relative humidity
  const relative_humidity =
    average(humidityValues);


  // Maximum temperature during 30-day window
  const max_temp = Math.max(
    ...maxTempValues.map(Number)
  );


  // Minimum temperature during 30-day window
  const min_temp = Math.min(
    ...minTempValues.map(Number)
  );


  // Open-Meteo cloud cover = 0–100%
  const cloudCoverPercent =
    average(cloudValues);


  // Training dataset Cloud_Coverage ≈ 0–8 scale
  const cloud_coverage =
    (cloudCoverPercent / 100) * 8;


  const firstDate = dates[0];
  const lastCompletedDate =
    dates[dates.length - 2];


  console.log(
    `[weather] district=${district.name} ` +
    `window=${firstDate} to ${lastCompletedDate} ` +
    `rain30=${rainfall.toFixed(2)}mm ` +
    `humidity=${relative_humidity.toFixed(2)}% ` +
    `maxTemp=${max_temp.toFixed(2)}C ` +
    `minTemp=${min_temp.toFixed(2)}C ` +
    `cloud=${cloud_coverage.toFixed(2)}/8`
  );


  // ==================================================
  // AI Prediction
  // ==================================================

  const prediction = await predictFloodRisk({
    rainfall,
    relative_humidity,
    max_temp,
    min_temp,
    cloud_coverage,
    month,
  });


  const floodRisk = prediction.floodRisk;


  console.log(
    `[AI] district=${district.name} ` +
    `risk=${floodRisk} ` +
    `probability=${prediction.floodProbability} ` +
    `source=${prediction.source}`
  );


  // ==================================================
  // Save district
  // ==================================================

  const temperature =
    (max_temp + min_temp) / 2;


  const updatedDistrict =
    await District.findOneAndUpdate(

      { name: district.name },

      {
        name: district.name,
        division: district.division,

        latitude: district.latitude,
        longitude: district.longitude,

        floodRisk,

        rainfall,
        temperature,
        humidity: relative_humidity,

        weatherSummary:
          `${rainfall.toFixed(1)} mm rain in last 30 days • ` +
          `${relative_humidity.toFixed(0)}% humidity • ` +
          `${cloud_coverage.toFixed(1)}/8 cloud cover`,

        lastUpdated: new Date(),
      },

      {
        upsert: true,
        new: true,
      }
    );


  // ==================================================
  // Save weather history
  // ==================================================

  await WeatherHistory.create({
    district: district.name,
    rainfall,
    temperature,
    humidity: relative_humidity,
    floodRisk,
  });


  console.log(
    `[weather] success district=${district.name} ` +
    `risk=${floodRisk}`
  );


  return {
    district: district.name,

    floodRisk,

    floodProbability:
      prediction.floodProbability,

    rainfall,

    relative_humidity,

    max_temp,

    min_temp,

    cloud_coverage,

    month,

    weatherWindow: {
      from: firstDate,
      to: lastCompletedDate,
      days: rainfallValues.length,
    },

    predictionSource:
      prediction.source,

    lastUpdated:
      updatedDistrict.lastUpdated,
  };
}


async function fetchAllDistricts() {

  console.log("[weather] starting batch update");

  await seedDistricts();


  const districts = await District.find(
    {},
    {
      name: 1,
      division: 1,
      latitude: 1,
      longitude: 1,
    }
  )
    .sort({ name: 1 })
    .lean();


  const results = [];


  for (const district of districts) {

    try {

      const result =
        await fetchWeatherForDistrict(district);

      results.push(result);

    } catch (error) {

      console.error(
        `[weather] failed district=${district.name} ` +
        `error=${error.message}`
      );
    }
  }


  console.log(
    `[weather] batch complete updated=${results.length}`
  );

  return results;
}


module.exports = {
  fetchAllDistricts,
  fetchWeatherForDistrict,
};