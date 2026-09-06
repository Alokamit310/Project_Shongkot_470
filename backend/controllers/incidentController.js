const Incident = require("../models/Incident");
const Notification = require("../models/Notification");


// =====================================================
// NORMALIZE STATUS
// =====================================================

const normalizeStatus = (value) => {

    if (!value) return "Open";

    if (value === "Pending") {
        return "Open";
    }

    return value;

};


// =====================================================
// CREATE INCIDENT
// =====================================================

const createIncident = async (req, res) => {

    try {

        const payload = {
            ...req.body,
            status: normalizeStatus(
                req.body.status
            ),
        };


        if (req.user) {

            payload.reporterId =
                req.user._id;


            if (!payload.reporterName) {

                payload.reporterName =
                    req.user.fullName ||
                    "Citizen";

            }


            if (!payload.phone) {

                payload.phone =
                    req.user.phone ||
                    "";

            }


            if (!payload.district) {

                payload.district =
                    req.user.district ||
                    "";

            }

        }


        const incident =
            await Incident.create(
                payload
            );


        return res.status(201).json({

            success: true,

            message:
                "Incident Report Submitted Successfully",

            data: incident,

        });


    } catch (error) {

        console.error(
            "[Incident] Create error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// GET ALL INCIDENTS
// Citizen sees only own incidents
// Authority/Admin sees all incidents
// =====================================================

const getAllIncidents = async (
    req,
    res
) => {

    try {

        const query = {};


        // Citizen can only see own reports
        if (
            req.user?.role ===
            "citizen"
        ) {

            query.reporterId =
                req.user._id;

        }


        // Status filter
        if (req.query.status) {

            query.status =
                normalizeStatus(
                    req.query.status
                );

        }


        // District filter
        if (req.query.district) {

            query.district = {
                $regex:
                    req.query.district,

                $options: "i",
            };

        }


        // Incident type filter
        if (req.query.type) {

            query.incidentType = {
                $regex:
                    req.query.type,

                $options: "i",
            };

        }


        const incidents =
            await Incident.find(
                query
            ).sort({
                createdAt: -1,
            });


        return res.status(200).json({

            success: true,

            count:
                incidents.length,

            data: incidents,

        });


    } catch (error) {

        console.error(
            "[Incident] Get all error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// GET INCIDENT BY ID
// =====================================================

const getIncidentById = async (
    req,
    res
) => {

    try {

        const incident =
            await Incident.findById(
                req.params.id
            );


        if (!incident) {

            return res.status(404).json({

                success: false,

                message:
                    "Incident Not Found",

            });

        }


        // Citizen can only view own incident
        if (
            req.user?.role ===
                "citizen" &&

            String(
                incident.reporterId
            ) !==
                String(
                    req.user._id
                )
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only view your own incidents",

            });

        }


        return res.status(200).json({

            success: true,

            data: incident,

        });


    } catch (error) {

        console.error(
            "[Incident] Get by ID error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// UPDATE INCIDENT
// Admin general update
// =====================================================

const updateIncident = async (
    req,
    res
) => {

    try {

        const incident =
            await Incident
                .findByIdAndUpdate(
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

                message:
                    "Incident Not Found",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Incident Updated Successfully",

            data: incident,

        });


    } catch (error) {

        console.error(
            "[Incident] General update error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// AUTHORITY / ADMIN UPDATE STATUS & COMMENT
// Also creates notification for reporter
// =====================================================

const updateIncidentStatus =
    async (req, res) => {

        try {

            const {
                status,
                authorityComment,
            } = req.body;


            const incident =
                await Incident.findById(
                    req.params.id
                );


            if (!incident) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Incident Not Found",

                });

            }


            // Keep previous status
            // so we know whether the status actually changed
            const previousStatus =
                incident.status;


            // -----------------------------------------
            // UPDATE STATUS
            // -----------------------------------------

            if (status) {

                incident.status =
                    normalizeStatus(
                        status
                    );

            }


            // -----------------------------------------
            // UPDATE AUTHORITY COMMENT
            // -----------------------------------------

            if (
                authorityComment !==
                undefined
            ) {

                incident.authorityComment =
                    authorityComment;

            }


            await incident.save();


            // =================================================
            // CREATE NOTIFICATION FOR REPORTER
            // =================================================

            const statusChanged =
                previousStatus !==
                incident.status;


            if (
                incident.reporterId &&
                statusChanged
            ) {

                try {

                    let title =
                        "Incident Status Updated";


                    if (
                        incident.status ===
                        "In Progress"
                    ) {

                        title =
                            "Your Incident Is In Progress";

                    }


                    if (
                        incident.status ===
                        "Resolved"
                    ) {

                        title =
                            "Your Incident Has Been Resolved";

                    }


                    if (
                        incident.status ===
                        "Open"
                    ) {

                        title =
                            "Your Incident Status Is Open";

                    }


                    let notificationMessage =
                        `Your ${incident.incidentType} incident in ${incident.location}, ${incident.district} is now "${incident.status}".`;


                    if (
                        incident.authorityComment
                    ) {

                        notificationMessage +=
                            ` Authority note: ${incident.authorityComment}`;

                    }


                    await Notification.create({

                        user:
                            incident.reporterId,

                        title,

                        message:
                            notificationMessage,

                        isRead: false,

                    });


                    console.log(
                        `[Notification] Created for incident ${incident._id} -> ${incident.status}`
                    );


                } catch (
                    notificationError
                ) {

                    // Important:
                    // incident update should still succeed
                    // even if notification creation fails

                    console.error(
                        "[Notification] Creation failed:",
                        notificationError
                    );

                }

            }


            return res.status(200).json({

                success: true,

                message:
                    "Incident Updated by Authority",

                data: incident,

                notificationCreated:
                    Boolean(
                        incident.reporterId &&
                        statusChanged
                    ),

            });


        } catch (error) {

            console.error(
                "[Incident] Status update error:",
                error
            );


            return res.status(500).json({

                success: false,

                message: error.message,

            });

        }

    };


// =====================================================
// DELETE INCIDENT
// Currently admin-only through route middleware
// =====================================================

const deleteIncident = async (
    req,
    res
) => {

    try {

        const incident =
            await Incident
                .findByIdAndDelete(
                    req.params.id
                );


        if (!incident) {

            return res.status(404).json({

                success: false,

                message:
                    "Incident Not Found",

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Incident Deleted Successfully",

        });


    } catch (error) {

        console.error(
            "[Incident] Delete error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createIncident,

    getAllIncidents,

    getIncidentById,

    updateIncident,

    updateIncidentStatus,

    deleteIncident,

};