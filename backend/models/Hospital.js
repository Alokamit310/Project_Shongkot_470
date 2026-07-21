const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            required: true,
        },

        address: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        latitude: {
            type: Number,
            required: true,
        },

        longitude: {
            type: Number,
            required: true,
        },

        totalBeds: {
            type: Number,
            default: 0,
        },

        availableBeds: {
            type: Number,
            default: 0,
        },

        icuBeds: {
            type: Number,
            default: 0,
        },

        emergencyServices: {
            type: String,
            default: "Emergency services available",
        },

        ambulanceAvailable: {
            type: Boolean,
            default: true,
        },

        emergencyAvailable: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Hospital", hospitalSchema);