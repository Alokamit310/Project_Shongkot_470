const Incident = require("../models/Incident");

const normalizeStatus = (value) => {
    if (!value) return "Open";
    if (value === "Pending") return "Open";
    return value;
};

// Create Incident
const createIncident = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            status: normalizeStatus(req.body.status),
        };

        if (req.user) {
            payload.reporterId = req.user._id;

            if (!payload.reporterName) {
                payload.reporterName = req.user.fullName || "Citizen";
            }

            if (!payload.phone) {
                payload.phone = req.user.phone || "";
            }

            if (!payload.district) {
                payload.district = req.user.district || "";
            }
        }

        const incident = await Incident.create(payload);

        res.status(201).json({
            success: true,
            message: "Incident Report Submitted Successfully",
            data: incident,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Incidents
const getAllIncidents = async (req, res) => {
    try {
        const query = {};

        if (req.user?.role === "citizen") {
            query.reporterId = req.user._id;
        }

        if (req.query.status) {
            query.status = normalizeStatus(req.query.status);
        }

        if (req.query.district) {
            query.district = { $regex: req.query.district, $options: "i" };
        }

        if (req.query.type) {
            query.incidentType = { $regex: req.query.type, $options: "i" };
        }

        const incidents = await Incident.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: incidents.length,
            data: incidents,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Incident By ID
const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident Not Found",
            });
        }

        if (req.user?.role === "citizen" && String(incident.reporterId) !== String(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own incidents",
            });
        }

        res.status(200).json({
            success: true,
            data: incident,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Incident (General)
const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Incident Updated Successfully",
            data: incident,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Authority Update Incident Status & Comment
const updateIncidentStatus = async (req, res) => {
    // TODO: Moon — Feature 14 (Status/Comment update)
};

// Delete Incident
const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident Not Found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Incident Deleted Successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident,
    updateIncidentStatus,
    deleteIncident,
};