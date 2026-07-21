const cron = require("node-cron");
const { fetchAllDistricts } = require("../services/weatherService");

const updateWeather = async () => {
    console.log("🔄 Fetching live weather for all districts...");

    try {
        const results = await fetchAllDistricts();

        console.log(
            `✅ Live weather update completed for ${results.length} districts`
        );
    } catch (error) {
        console.error(`❌ Weather update failed: ${error.message}`);
    }
};

const startWeatherCron = () => {
    console.log("⏰ Weather cron job started — runs every 30 minutes");

    // Fetch immediately when backend starts
    updateWeather();

    // Then fetch every 30 minutes
    cron.schedule("*/30 * * * *", updateWeather);
};

module.exports = startWeatherCron;