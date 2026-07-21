const express = require("express");

const router = express.Router();

const {
    createIncident,
    getAllIncidents,
    getIncidentById,
    updateIncident,
    updateIncidentStatus,
    deleteIncident,
} = require("../controllers/incidentController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// Protected Routes
router.get("/", protect, getAllIncidents);
router.get("/:id", protect, getIncidentById);

// Citizen Report Route
router.post("/", protect, createIncident);

// Authority Route
router.patch(
    "/:id/status",
    protect,
    authorize("authority", "admin"),
    updateIncidentStatus
);

// Admin Routes
router.put("/:id", protect, authorize("admin"), updateIncident);
router.delete("/:id", protect, authorize("admin"), deleteIncident);

module.exports = router;