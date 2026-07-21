const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    division: {
      type: String,
      required: true,
    },

    floodRisk: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    rainfall: {
      type: Number,
      default: 0,
    },

    temperature: {
      type: Number,
      default: 0,
    },

    humidity: {
      type: Number,
      default: 0,
    },

    weatherSummary: {
      type: String,
      default: "",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("District", districtSchema);