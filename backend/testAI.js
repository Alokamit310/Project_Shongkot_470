const { predictFloodRisk } = require("./services/aiService");

async function test() {
  try {
    const result = await predictFloodRisk({
      rainfall: 90,
      rain_3day: 180,
      rain_7day: 350,
      month: 7,
    });

    console.log("AI RESULT:", result);
  } catch (error) {
    console.error("TEST FAILED:", error.message);
  }
}

test();