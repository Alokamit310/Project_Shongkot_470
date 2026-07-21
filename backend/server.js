require('dotenv').config();
const app            = require('./app');
const connectDB      = require('./config/db');
const startWeatherCron = require('./jobs/weatherCron');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Shonkot backend running on port ${PORT}`);
    startWeatherCron();
  });
});