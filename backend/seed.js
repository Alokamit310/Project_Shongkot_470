require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");
const { seedDistricts } = require("./scripts/seedDistricts");
const { seedHospitals } = require("./scripts/seedHospitals");

async function runSeed() {
    try {
        await connectDB();

        await seedDistricts();

        await seedHospitals();

        console.log("🎉 All seed data completed successfully.");

        await mongoose.connection.close();

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:");
        console.error(error);

        process.exit(1);
    }
}

runSeed();