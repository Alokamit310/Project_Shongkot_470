const express = require("express");

const router = express.Router();

const {
    createBroadcast,
    getAllBroadcasts,
    getBroadcastsByDistrict,
    deleteBroadcast,
} = require("../controllers/broadcastController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// ======================================
// Public Routes
// ======================================

// Get all broadcasts
router.get("/", getAllBroadcasts);

// Get broadcasts by district
router.get("/district/:district", getBroadcastsByDistrict);


// ======================================
// Authority/Admin Routes
// ======================================

// Create emergency broadcast
router.post(
    "/",
    protect,
    authorize("authority", "admin"),
    createBroadcast
);

// Delete broadcast
router.delete(
    "/:id",
    protect,
    authorize("authority", "admin"),
    deleteBroadcast
);

module.exports = router;