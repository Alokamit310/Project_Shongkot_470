const District = require("../models/District");
const Hospital = require("../models/Hospital");
const Incident = require("../models/Incident");
const Broadcast = require("../models/Broadcast");
const User = require("../models/User");

// =====================================
// Authority Dashboard
// =====================================
const getDashboard = async (req, res) => {
    try {

        // District Statistics
        const totalDistricts = await District.countDocuments();

        const highRiskDistricts = await District.countDocuments({
            floodRisk: "High",
        });

        const mediumRiskDistricts = await District.countDocuments({
            floodRisk: "Medium",
        });

        // Hospital Statistics
        const totalHospitals = await Hospital.countDocuments();

        const hospitals = await Hospital.find();

        let totalAvailableBeds = 0;

        hospitals.forEach((hospital) => {
            totalAvailableBeds += hospital.availableBeds;
        });

        // Incident Statistics
        const totalIncidents = await Incident.countDocuments();

        const pendingIncidents = await Incident.countDocuments({
            status: "Open",
        });

        const inProgressIncidents = await Incident.countDocuments({
            status: "In Progress",
        });

        const resolvedIncidents = await Incident.countDocuments({
            status: "Resolved",
        });

        // User Statistics
        const totalUsers = await User.countDocuments();

        const recentIncidents = await Incident.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentBroadcasts = await Broadcast.find()
            .populate("sentBy", "fullName")
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        res.status(200).json({
            success: true,

            dashboard: {
                totalDistricts,
                highRiskDistricts,
                mediumRiskDistricts,

                totalHospitals,
                totalAvailableBeds,

                totalIncidents,
                pendingIncidents,
                inProgressIncidents,
                resolvedIncidents,

                totalUsers,
                recentIncidents,
                recentBroadcasts,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

module.exports = {
    getDashboard,
};