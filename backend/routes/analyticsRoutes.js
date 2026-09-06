const express = require("express");

const router =
    express.Router();


const {
    getAnalyticsSummary,
    exportIncidentsCSV,
} = require(
    "../controllers/analyticsController"
);


const {
    protect,
} = require(
    "../middleware/authMiddleware"
);


const authorize =
    require(
        "../middleware/roleMiddleware"
    );


// =====================================================
// AUTHORITY / ADMIN ANALYTICS SUMMARY
// =====================================================

router.get(
    "/",
    protect,
    authorize(
        "authority",
        "admin"
    ),
    getAnalyticsSummary
);


// =====================================================
// INCIDENT CSV EXPORT
// =====================================================

router.get(
    "/incidents.csv",
    protect,
    authorize(
        "authority",
        "admin"
    ),
    exportIncidentsCSV
);


module.exports = router;