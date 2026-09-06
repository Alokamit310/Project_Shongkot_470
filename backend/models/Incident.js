const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reporterName: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
        },

        district: {
            type: String,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        latitude: {
            type: Number,
            default: null,
        },

        longitude: {
            type: Number,
            default: null,
        },

        incidentType: {
            type: String,
            enum: [
                "Road Blockage",
                "Flooded Area",
                "Rescue Request",
                "Shelter Needed",
                "Medical Emergency",
                "Flood",
                "Road Damage",
                "Bridge Collapse",
                "Food Shortage",
                "Other",
            ],
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        severity: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical",
            ],
            default: "High",
        },

        status: {
            type: String,
            enum: [
                "Open",
                "In Progress",
                "Resolved",
            ],
            default: "Open",
        },

        authorityComment: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.model(
        "Incident",
        incidentSchema
    );