const Broadcast = require("../models/Broadcast");

// ======================================
// Create Broadcast
// ======================================
const createBroadcast = async (req, res) => {
    try {

        const broadcast = await Broadcast.create({
            title: req.body.title,
            message: req.body.message,
            district: req.body.district || "All Districts",
            sentBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            message: "Broadcast Sent Successfully",
            data: broadcast,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ======================================
// Get All Broadcasts
// ======================================
const getAllBroadcasts = async (req, res) => {
    try {

        const broadcasts = await Broadcast.find()
            .populate("sentBy", "fullName role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: broadcasts.length,
            data: broadcasts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ======================================
// Get Broadcasts By District
// ======================================
const getBroadcastsByDistrict = async (req, res) => {
    try {

        const district = req.params.district;
        const broadcasts = await Broadcast.find({
            $or: [
                { district: district },
                { district: "All Districts" },
            ],
        })
        .populate("sentBy", "fullName")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: broadcasts.length,
            data: broadcasts,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ======================================
// Delete Broadcast
// ======================================
const deleteBroadcast = async (req, res) => {

    try {

        const broadcast = await Broadcast.findByIdAndDelete(req.params.id);

        if (!broadcast) {

            return res.status(404).json({
                success: false,
                message: "Broadcast Not Found",
            });

        }

        res.status(200).json({
            success: true,
            message: "Broadcast Deleted Successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }

};

module.exports = {
    createBroadcast,
    getAllBroadcasts,
    getBroadcastsByDistrict,
    deleteBroadcast,
};