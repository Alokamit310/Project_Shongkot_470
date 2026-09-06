const express = require("express");

const router = express.Router();

const {
    getDashboard,
} = require("../controllers/authorityController");

const {
    protect,
} = require("../middleware/authMiddleware");

const authorize =
    require("../middleware/roleMiddleware");

router.get(
    "/dashboard",
    protect,
    authorize("authority", "admin"),
    getDashboard
);

module.exports = router;