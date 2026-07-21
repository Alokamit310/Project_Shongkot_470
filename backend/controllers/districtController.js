const District = require("../models/District");
const { fetchAllDistricts } = require("../services/weatherService");

// ==========================
// Create District
// ==========================
const createDistrict = async (req, res) => {
    try {
        const district = await District.create(req.body);

        res.status(201).json({
            success: true,
            message: "District Created Successfully",
            data: district,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// Get All Districts
// ==========================
const getAllDistricts = async (req, res) => {
    try {
        const districts = await District.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: districts.length,
            data: districts,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// Get Single District
// ==========================
const getDistrictById = async (req, res) => {
    try {
        const district = await District.findById(req.params.id);

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District Not Found",
            });
        }

        res.status(200).json({
            success: true,
            data: district,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// Update District
// ==========================
const updateDistrict = async (req, res) => {
    try {
        const district = await District.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "District Updated Successfully",
            data: district,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================
// Delete District
// ==========================
const deleteDistrict = async (req, res) => {
    try {
        const district = await District.findByIdAndDelete(req.params.id);

        if (!district) {
            return res.status(404).json({
                success: false,
                message: "District Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "District Deleted Successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const refreshDistrictWeather = async (req, res) => {
    try {
        const results = await fetchAllDistricts();
        res.status(200).json({
            success: true,
            message: "District weather refreshed successfully",
            count: results.length,
            data: results,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict,
    refreshDistrictWeather,
};