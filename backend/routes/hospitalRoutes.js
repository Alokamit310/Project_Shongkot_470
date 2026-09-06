const express = require("express");

const router = express.Router();

const {
    createHospital,
    getAllHospitals,
    recommendHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
} = require("../controllers/hospitalController");

const {
    protect,
} = require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");


// =====================================================
// PUBLIC / AUTHENTICATED READ ROUTES
// =====================================================

// Get all hospitals
router.get(
    "/",
    getAllHospitals
);


// Smart hospital recommendation
// IMPORTANT: must stay before "/:id"
router.get(
    "/recommend",
    recommendHospitals
);


// Get one hospital
router.get(
    "/:id",
    getHospitalById
);


// =====================================================
// HOSPITAL MANAGEMENT
// Authority + Admin only
// =====================================================

// Create hospital
router.post(
    "/",
    protect,
    authorize("authority", "admin"),
    createHospital
);


// Update hospital
router.put(
    "/:id",
    protect,
    authorize("authority", "admin"),
    updateHospital
);


// Delete hospital
router.delete(
    "/:id",
    protect,
    authorize("authority", "admin"),
    deleteHospital
);


module.exports = router;