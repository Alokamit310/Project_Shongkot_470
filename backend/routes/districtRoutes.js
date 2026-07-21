const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict,
    refreshDistrictWeather,
} = require("../controllers/districtController");

// ==========================
// Public Routes
// ==========================

router.get("/", getAllDistricts);
router.get("/refresh", refreshDistrictWeather);
router.get("/:id", getDistrictById);

// ==========================
// TEMPORARY (No Authentication)
// ==========================

router.post("/", protect, authorize("admin"), createDistrict);
router.put("/:id", protect, authorize("admin"), updateDistrict);
router.delete("/:id", protect, authorize("admin"), deleteDistrict);

module.exports = router;