const Incident = require("../models/Incident");
const District = require("../models/District");
const Hospital = require("../models/Hospital");


// =====================================================
// GET ANALYTICS SUMMARY
// =====================================================

const getAnalyticsSummary = async (req, res) => {

    try {

        // -------------------------------------------------
        // BASIC TOTALS
        // -------------------------------------------------

        const [
            totalIncidents,
            totalDistricts,
            totalHospitals,
        ] = await Promise.all([

            Incident.countDocuments(),

            District.countDocuments(),

            Hospital.countDocuments(),

        ]);


        // -------------------------------------------------
        // INCIDENT STATUS
        // -------------------------------------------------

        const incidentsByStatus =
            await Incident.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);


        // -------------------------------------------------
        // INCIDENT SEVERITY
        // -------------------------------------------------

        const incidentsBySeverity =
            await Incident.aggregate([
                {
                    $group: {
                        _id: "$severity",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);


        // -------------------------------------------------
        // INCIDENT TYPE
        // -------------------------------------------------

        const incidentsByType =
            await Incident.aggregate([
                {
                    $group: {
                        _id: "$incidentType",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);


        // -------------------------------------------------
        // INCIDENTS BY DISTRICT
        // -------------------------------------------------

        const incidentsByDistrict =
            await Incident.aggregate([
                {
                    $group: {
                        _id: "$district",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);


        // -------------------------------------------------
        // FLOOD RISK DISTRIBUTION
        // -------------------------------------------------

        const districtsByRisk =
            await District.aggregate([
                {
                    $group: {
                        _id: "$floodRisk",
                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
            ]);


        // -------------------------------------------------
        // HOSPITAL SUMMARY
        // -------------------------------------------------

        const hospitalStats =
            await Hospital.aggregate([
                {
                    $group: {
                        _id: null,

                        totalBeds: {
                            $sum: "$totalBeds",
                        },

                        availableBeds: {
                            $sum: "$availableBeds",
                        },

                        icuBeds: {
                            $sum: "$icuBeds",
                        },

                        openHospitals: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$status",
                                            "Open",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        emergencyHospitals: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$emergencyAvailable",
                                            true,
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]);


        // -------------------------------------------------
        // LAST 7 DAYS INCIDENT COUNT
        // -------------------------------------------------

        const sevenDaysAgo =
            new Date();

        sevenDaysAgo.setDate(
            sevenDaysAgo.getDate() - 6
        );

        sevenDaysAgo.setHours(
            0,
            0,
            0,
            0
        );


        const recentIncidentTrend =
            await Incident.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: sevenDaysAgo,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                            },
                        },

                        count: {
                            $sum: 1,
                        },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]);


        // -------------------------------------------------
        // BUILD FULL 7-DAY SERIES
        // Include zero-count days too
        // -------------------------------------------------

        const trendMap =
            new Map(
                recentIncidentTrend.map(
                    (item) => [
                        item._id,
                        item.count,
                    ]
                )
            );


        const last7Days = [];


        for (let i = 0; i < 7; i++) {

            const date =
                new Date(
                    sevenDaysAgo
                );

            date.setDate(
                sevenDaysAgo.getDate() + i
            );


            const key =
                date
                    .toISOString()
                    .slice(0, 10);


            last7Days.push({
                date: key,

                count:
                    trendMap.get(key) ||
                    0,
            });

        }


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            generatedAt:
                new Date(),

            totals: {

                incidents:
                    totalIncidents,

                districts:
                    totalDistricts,

                hospitals:
                    totalHospitals,

            },

            incidents: {

                byStatus:
                    incidentsByStatus.map(
                        (item) => ({
                            status:
                                item._id ||
                                "Unknown",

                            count:
                                item.count,
                        })
                    ),

                bySeverity:
                    incidentsBySeverity.map(
                        (item) => ({
                            severity:
                                item._id ||
                                "Unknown",

                            count:
                                item.count,
                        })
                    ),

                byType:
                    incidentsByType.map(
                        (item) => ({
                            type:
                                item._id ||
                                "Unknown",

                            count:
                                item.count,
                        })
                    ),

                byDistrict:
                    incidentsByDistrict.map(
                        (item) => ({
                            district:
                                item._id ||
                                "Unknown",

                            count:
                                item.count,
                        })
                    ),

                last7Days,

            },

            floodRisk: {

                distribution:
                    districtsByRisk.map(
                        (item) => ({
                            risk:
                                item._id ||
                                "Unknown",

                            count:
                                item.count,
                        })
                    ),

            },

            hospitals:
                hospitalStats[0] || {

                    totalBeds: 0,

                    availableBeds: 0,

                    icuBeds: 0,

                    openHospitals: 0,

                    emergencyHospitals: 0,

                },

        });


    } catch (error) {

        console.error(
            "[Analytics] Summary error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to generate analytics.",

        });

    }

};


// =====================================================
// CSV ESCAPE HELPER
// =====================================================

const escapeCSV = (value) => {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const stringValue =
        String(value);


    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {

        return `"${stringValue.replace(
            /"/g,
            '""'
        )}"`;

    }


    return stringValue;

};


// =====================================================
// EXPORT INCIDENTS AS CSV
// =====================================================

const exportIncidentsCSV =
    async (req, res) => {

        try {

            const incidents =
                await Incident.find()
                    .sort({
                        createdAt: -1,
                    })
                    .lean();


            const headers = [
                "Incident ID",
                "Reporter Name",
                "Phone",
                "District",
                "Location",
                "Incident Type",
                "Severity",
                "Status",
                "Authority Comment",
                "Latitude",
                "Longitude",
                "Created At",
                "Updated At",
            ];


            const rows =
                incidents.map(
                    (incident) => [

                        incident._id,

                        incident.reporterName,

                        incident.phone,

                        incident.district,

                        incident.location,

                        incident.incidentType,

                        incident.severity,

                        incident.status,

                        incident.authorityComment ||
                            "",

                        incident.latitude ??
                            "",

                        incident.longitude ??
                            "",

                        incident.createdAt
                            ? new Date(
                                  incident.createdAt
                              ).toISOString()
                            : "",

                        incident.updatedAt
                            ? new Date(
                                  incident.updatedAt
                              ).toISOString()
                            : "",

                    ]
                );


            const csv =
                [
                    headers,
                    ...rows,
                ]
                    .map(
                        (row) =>
                            row
                                .map(
                                    escapeCSV
                                )
                                .join(",")
                    )
                    .join("\n");


            const fileName =
                `shongkot-incidents-${new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    )}.csv`;


            res.setHeader(
                "Content-Type",
                "text/csv; charset=utf-8"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName}"`
            );


            // UTF-8 BOM helps Excel display text correctly
            return res.status(200).send(
                "\uFEFF" + csv
            );


        } catch (error) {

            console.error(
                "[Analytics] CSV export error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to export incident data.",

            });

        }

    };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    getAnalyticsSummary,

    exportIncidentsCSV,

};