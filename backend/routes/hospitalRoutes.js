const express = require("express");

const router = express.Router();

const {
    createHospital,
    getAllHospitals,
    getHospitalById,
    updateHospital,
    deleteHospital,
} = require("../controllers/hospitalController");

// ==========================
// Public Routes
// ==========================

router.get("/", getAllHospitals);
router.get("/:id", getHospitalById);

// ==========================
// TEMPORARY (No Authentication)
// ==========================

router.post("/", createHospital);
router.put("/:id", updateHospital);
router.delete("/:id", deleteHospital);

module.exports = router;