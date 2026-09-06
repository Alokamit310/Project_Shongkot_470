const Broadcast =
    require("../models/Broadcast");

const User =
    require("../models/User");

const {
    sendEmail,
} = require("../services/emailService");


// =====================================================
// CREATE BROADCAST
// =====================================================

const createBroadcast =
    async (req, res) => {

        try {

            const broadcast =
                await Broadcast.create({

                    title:
                        req.body.title,

                    message:
                        req.body.message,

                    district:
                        req.body.district ||
                        "All Districts",

                    sentBy:
                        req.user._id,

                });


            // =============================================
            // FIND RELEVANT CITIZENS
            // =============================================

            const userFilter = {

                role: "citizen",

                isActive: true,

                email: {
                    $exists: true,
                    $ne: "",
                },

            };


            if (
                broadcast.district !==
                "All Districts"
            ) {

                userFilter.district =
                    broadcast.district;

            }


            const recipients =
                await User.find(
                    userFilter
                )
                    .select(
                        "fullName email district"
                    )
                    .lean();


            // =============================================
            // RESPONSE FIRST
            // =============================================

            res.status(201).json({

                success: true,

                message:
                    "Broadcast Sent Successfully",

                emailRecipients:
                    recipients.length,

                data:
                    broadcast,

            });


            // =============================================
            // EMAIL IN BACKGROUND
            // =============================================

            if (
                recipients.length > 0
            ) {

                Promise.allSettled(

                    recipients.map(
                        (recipient) => {

                            const subject =
                                `[SHONGKOT ALERT] ${broadcast.title}`;


                            const text =
`Emergency Broadcast

${broadcast.title}

${broadcast.message}

Area: ${broadcast.district}

Please follow official emergency instructions and remain alert.

Shongkot Flood Intelligence Platform`;


                            const html =
`
<div style="
    font-family: Arial, sans-serif;
    max-width: 620px;
    margin: auto;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
">

    <div style="
        background: #b91c1c;
        color: white;
        padding: 20px;
    ">

        <h2 style="
            margin: 0;
        ">
            SHONGKOT Emergency Alert
        </h2>

    </div>


    <div style="
        padding: 24px;
        color: #1f2937;
    ">

        <p>
            Hello ${recipient.fullName || "Citizen"},
        </p>


        <h3 style="
            color: #b91c1c;
        ">
            ${broadcast.title}
        </h3>


        <p style="
            line-height: 1.7;
        ">
            ${broadcast.message}
        </p>


        <p>
            <strong>
                Target Area:
            </strong>

            ${broadcast.district}
        </p>


        <div style="
            margin-top: 20px;
            padding: 14px;
            background: #fef2f2;
            border-left: 4px solid #dc2626;
        ">

            Please remain alert and follow
            instructions from emergency authorities.

        </div>


        <p style="
            margin-top: 25px;
            font-size: 12px;
            color: #6b7280;
        ">

            This email was automatically generated
            by the Shongkot Flood Crisis Intelligence
            Platform.

        </p>

    </div>

</div>
`;


                            return sendEmail({

                                to:
                                    recipient.email,

                                subject,

                                text,

                                html,

                            });

                        }
                    )

                )
                    .then(
                        (results) => {

                            const successful =
                                results.filter(
                                    (result) =>
                                        result.status ===
                                            "fulfilled" &&
                                        result.value
                                            ?.success
                                ).length;


                            console.log(
                                `[Broadcast Email] ${successful}/${recipients.length} emails sent.`
                            );

                        }
                    )
                    .catch(
                        (error) => {

                            console.error(
                                "[Broadcast Email] Unexpected error:",
                                error.message
                            );

                        }
                    );

            }


        } catch (error) {

            console.error(
                "[Broadcast] Create error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message,

            });

        }

    };


// =====================================================
// GET ALL BROADCASTS
// =====================================================

const getAllBroadcasts =
    async (req, res) => {

        try {

            const broadcasts =
                await Broadcast.find()

                    .populate(
                        "sentBy",
                        "fullName role"
                    )

                    .sort({
                        createdAt: -1,
                    });


            res.status(200).json({

                success: true,

                count:
                    broadcasts.length,

                data:
                    broadcasts,

            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message,

            });

        }

    };


// =====================================================
// GET BROADCASTS BY DISTRICT
// =====================================================

const getBroadcastsByDistrict =
    async (req, res) => {

        try {

            const district =
                req.params.district;


            const broadcasts =
                await Broadcast.find({

                    $or: [

                        {
                            district:
                                district,
                        },

                        {
                            district:
                                "All Districts",
                        },

                    ],

                })

                    .populate(
                        "sentBy",
                        "fullName"
                    )

                    .sort({
                        createdAt: -1,
                    });


            res.status(200).json({

                success: true,

                count:
                    broadcasts.length,

                data:
                    broadcasts,

            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message,

            });

        }

    };


// =====================================================
// DELETE BROADCAST
// =====================================================

const deleteBroadcast =
    async (req, res) => {

        try {

            const broadcast =
                await Broadcast.findByIdAndDelete(
                    req.params.id
                );


            if (!broadcast) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Broadcast Not Found",

                    });

            }


            res.status(200).json({

                success: true,

                message:
                    "Broadcast Deleted Successfully",

            });


        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    error.message,

            });

        }

    };


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createBroadcast,

    getAllBroadcasts,

    getBroadcastsByDistrict,

    deleteBroadcast,

};