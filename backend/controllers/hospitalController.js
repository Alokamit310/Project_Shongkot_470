const Hospital = require("../models/Hospital");

// Create Hospital
const createHospital = async (req, res) => {
    try {
        const hospital = await Hospital.create(req.body);

        res.status(201).json({
            success: true,
            message: "Hospital Created Successfully",
            data: hospital,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Hospitals
const getAllHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: hospitals.length,
            data: hospitals,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Hospital By ID
const getHospitalById = async (req, res) => {
    try {

        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital Not Found",
            });
        }

        res.status(200).json({
            success: true,
            data: hospital,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Hospital
const updateHospital = async (req, res) => {
    try {

        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Hospital Updated Successfully",
            data: hospital,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Hospital
const deleteHospital = async (req, res) => {
    try {

        const hospital = await Hospital.findByIdAndDelete(req.params.id);

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Hospital Deleted Successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
};