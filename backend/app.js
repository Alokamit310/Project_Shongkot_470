const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ==========================
// Global Middleware
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        project: "Shonkot",
        message: "Backend Server is Running Successfully 🚀"
    });
});

// ==========================
// Route Debugging
// ==========================

try {
    const districtRoutes = require("./routes/districtRoutes");
    console.log("✅ districtRoutes loaded");
    app.use("/api/districts", districtRoutes);
} catch (err) {
    console.log("❌ districtRoutes failed");
    console.error(err);
}

try {
    const hospitalRoutes = require("./routes/hospitalRoutes");
    console.log("✅ hospitalRoutes loaded");
    app.use("/api/hospitals", hospitalRoutes);
} catch (err) {
    console.log("❌ hospitalRoutes failed");
    console.error(err);
}

try {
    const incidentRoutes = require("./routes/incidentRoutes");
    console.log("✅ incidentRoutes loaded");
    app.use("/api/incidents", incidentRoutes);
} catch (err) {
    console.log("❌ incidentRoutes failed");
    console.error(err);
}

try {
    const authRoutes = require("./routes/authRoutes");
    console.log("✅ authRoutes loaded");
    app.use("/api/auth", authRoutes);
} catch (err) {
    console.log("❌ authRoutes failed");
    console.error(err);
}

try {
    const authorityRoutes = require("./routes/authorityRoutes");
    console.log("✅ authorityRoutes loaded");
    app.use("/api/authority", authorityRoutes);
} catch (err) {
    console.log("❌ authorityRoutes failed");
    console.error(err);
}

try {
    const broadcastRoutes = require("./routes/broadcastRoutes");
    console.log("✅ broadcastRoutes loaded");
    app.use("/api/broadcasts", broadcastRoutes);
} catch (err) {
    console.log("❌ broadcastRoutes failed");
    console.error(err);
}

try {
    const notificationRoutes = require("./routes/notificationRoutes");
    console.log("✅ notificationRoutes loaded");
    app.use("/api/notifications", notificationRoutes);
} catch (err) {
    console.log("❌ notificationRoutes failed");
    console.error(err);
}

try {
    const analyticsRoutes = require("./routes/analyticsRoutes");
    console.log("✅ analyticsRoutes loaded");
    app.use("/api/analytics", analyticsRoutes);
} catch (err) {
    console.log("❌ analyticsRoutes failed");
    console.error(err);
}

// ==========================
// Health Check
// ==========================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "OK",
        project: "Shonkot"
    });
});

// ==========================
// 404 Handler
// ==========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

module.exports = app;