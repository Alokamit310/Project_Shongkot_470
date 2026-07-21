const express = require("express");

const router = express.Router();

const { getDashboard } = require("../controllers/authorityController");

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================
// Authority Dashboard
// =====================================

router.get(
    "/dashboard",
    protect,
    authorize("admin", "authority"),
    getDashboard
);

module.exports = router;