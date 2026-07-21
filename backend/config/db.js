const mongoose = require("mongoose");

const connectDB = async () => {

    // Skip DB connection if MONGO_URI is empty
    if (!process.env.MONGO_URI) {
        console.log("⚠️ MongoDB URI not found.");
        console.log("⚠️ Running Backend without Database...");
        return;
    }

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB Connected Successfully");

    } catch (error) {

        console.error("❌ MongoDB Connection Failed");
        console.error(error.message);

        process.exit(1);
    }
};

module.exports = connectDB;