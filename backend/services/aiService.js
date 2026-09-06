const fetch = require("node-fetch");

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

async function predictFloodRisk({
  rainfall,
  relative_humidity,
  max_temp,
  min_temp,
  cloud_coverage,
  month,
}) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        rainfall,
        relative_humidity,
        max_temp,
        min_temp,
        cloud_coverage,
        month,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `AI service responded with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!["Low", "Medium", "High"].includes(data.floodRisk)) {
      throw new Error("AI service returned invalid flood risk");
    }

    return {
      floodRisk: data.floodRisk,
      floodProbability: data.floodProbability,
      source: data.source || "unknown",
    };
  } catch (error) {
    console.error(`❌ AI prediction failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  predictFloodRisk,
};