const Hospital = require("../models/Hospital");


// =====================================================
// HELPER: CALCULATE DISTANCE USING HAVERSINE FORMULA
// Returns distance in kilometers
// =====================================================

const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
) => {

    const toRadians = (degree) =>
        degree * (Math.PI / 180);

    const earthRadius = 6371;


    const dLat =
        toRadians(lat2 - lat1);

    const dLon =
        toRadians(lon2 - lon1);


    const a =
        Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
            Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;
};


// =====================================================
// HELPER: CALCULATE HOSPITAL RECOMMENDATION SCORE
// =====================================================

const calculateHospitalScore = (
    hospital,
    distance = null
) => {

    let score = 0;

    const reasons = [];


    // -------------------------------------------------
    // OPEN STATUS
    // -------------------------------------------------

    if (hospital.status === "Open") {

        score += 25;

        reasons.push(
            "Hospital is currently open"
        );

    } else {

        // Closed hospitals should not become
        // the best recommendation.

        score -= 100;

    }


    // -------------------------------------------------
    // EMERGENCY SERVICE
    // -------------------------------------------------

    if (hospital.emergencyAvailable) {

        score += 20;

        reasons.push(
            "Emergency service available"
        );

    }


    // -------------------------------------------------
    // AVAILABLE BEDS
    // -------------------------------------------------

    const availableBeds =
        Number(hospital.availableBeds) || 0;


    if (availableBeds > 0) {

        // Maximum 20 points from beds.

        const bedScore =
            Math.min(
                availableBeds,
                20
            );

        score += bedScore;


        reasons.push(
            `${availableBeds} beds available`
        );

    }


    // -------------------------------------------------
    // ICU
    // -------------------------------------------------

    const icuBeds =
        Number(hospital.icuBeds) || 0;


    if (icuBeds > 0) {

        // Maximum 15 points from ICU.

        const icuScore =
            Math.min(
                icuBeds * 3,
                15
            );

        score += icuScore;


        reasons.push(
            `${icuBeds} ICU beds available`
        );

    }


    // -------------------------------------------------
    // AMBULANCE
    // -------------------------------------------------

    if (hospital.ambulanceAvailable) {

        score += 10;

        reasons.push(
            "Ambulance available"
        );

    }


    // -------------------------------------------------
    // DISTANCE
    // -------------------------------------------------

    if (
        distance !== null &&
        Number.isFinite(distance)
    ) {

        if (distance <= 2) {

            score += 20;

        } else if (distance <= 5) {

            score += 16;

        } else if (distance <= 10) {

            score += 12;

        } else if (distance <= 20) {

            score += 8;

        } else if (distance <= 50) {

            score += 4;

        }


        reasons.push(
            `${distance.toFixed(2)} km away`
        );

    }


    return {
        score,
        reasons,
    };
};


// =====================================================
// CREATE HOSPITAL
// =====================================================

const createHospital = async (req, res) => {

    try {

        const hospital =
            await Hospital.create(
                req.body
            );


        res.status(201).json({

            success: true,

            message:
                "Hospital Created Successfully",

            data: hospital,

        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message,

        });

    }

};


// =====================================================
// GET ALL HOSPITALS
// =====================================================

const getAllHospitals = async (
    req,
    res
) => {

    try {

        const hospitals =
            await Hospital.find()
                .sort({
                    name: 1,
                });


        res.status(200).json({

            success: true,

            count:
                hospitals.length,

            data:
                hospitals,

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
// SMART HOSPITAL RECOMMENDATION
// =====================================================

const recommendHospitals = async (
    req,
    res
) => {

    try {

        const {
            district,
            lat,
            lng,
        } = req.query;


        // -------------------------------------------------
        // DISTRICT IS REQUIRED
        // -------------------------------------------------

        if (!district) {

            return res.status(400).json({

                success: false,

                message:
                    "District is required for hospital recommendation",

            });

        }


        // -------------------------------------------------
        // USER LOCATION IS OPTIONAL
        // -------------------------------------------------

        const userLatitude =
            Number(lat);

        const userLongitude =
            Number(lng);


        const hasUserLocation =

            lat !== undefined &&

            lng !== undefined &&

            Number.isFinite(
                userLatitude
            ) &&

            Number.isFinite(
                userLongitude
            );


        // -------------------------------------------------
        // FIND HOSPITALS FROM SELECTED DISTRICT
        // -------------------------------------------------

        const hospitals =
            await Hospital.find({

                district: {
                    $regex:
                        `^${district.trim()}$`,
                    $options: "i",
                },

            });


        if (
            hospitals.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    `No hospitals found in ${district}`,

                count: 0,

                data: [],

            });

        }


        // -------------------------------------------------
        // SCORE EACH HOSPITAL
        // -------------------------------------------------

        const rankedHospitals =
            hospitals.map(
                (hospital) => {

                    const hospitalObject =
                        hospital.toObject();


                    let distance = null;


                    if (
                        hasUserLocation &&
                        Number.isFinite(
                            Number(
                                hospital.latitude
                            )
                        ) &&
                        Number.isFinite(
                            Number(
                                hospital.longitude
                            )
                        )
                    ) {

                        distance =
                            calculateDistance(

                                userLatitude,

                                userLongitude,

                                Number(
                                    hospital.latitude
                                ),

                                Number(
                                    hospital.longitude
                                )

                            );

                    }


                    const {
                        score,
                        reasons,
                    } =
                        calculateHospitalScore(
                            hospital,
                            distance
                        );


                    return {

                        ...hospitalObject,

                        distanceKm:
                            distance !== null
                                ? Number(
                                    distance.toFixed(
                                        2
                                    )
                                )
                                : null,

                        recommendationScore:
                            score,

                        recommendationReasons:
                            reasons,

                    };

                }
            );


        // -------------------------------------------------
        // BEST SCORE FIRST
        // -------------------------------------------------

        rankedHospitals.sort(
            (a, b) => {

                if (
                    b.recommendationScore !==
                    a.recommendationScore
                ) {

                    return (
                        b.recommendationScore -
                        a.recommendationScore
                    );

                }


                // If scores are equal,
                // nearest hospital comes first.

                if (
                    a.distanceKm !== null &&
                    b.distanceKm !== null
                ) {

                    return (
                        a.distanceKm -
                        b.distanceKm
                    );

                }


                return (
                    b.availableBeds -
                    a.availableBeds
                );

            }
        );


        // -------------------------------------------------
        // ADD RANK + RECOMMENDED FLAG
        // -------------------------------------------------

        const finalHospitals =
            rankedHospitals.map(
                (
                    hospital,
                    index
                ) => ({

                    ...hospital,

                    recommendationRank:
                        index + 1,

                    recommended:
                        index === 0,

                })
            );


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        res.status(200).json({

            success: true,

            district:
                district.trim(),

            locationUsed:
                hasUserLocation,

            count:
                finalHospitals.length,

            recommendedHospital:
                finalHospitals[0],

            data:
                finalHospitals,

        });


    } catch (error) {

        console.error(
            "[Hospital Recommendation Error]",
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
// GET HOSPITAL BY ID
// =====================================================

const getHospitalById = async (
    req,
    res
) => {

    try {

        const hospital =
            await Hospital.findById(
                req.params.id
            );


        if (!hospital) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital Not Found",

                });

        }


        res.status(200).json({

            success: true,

            data:
                hospital,

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
// UPDATE HOSPITAL
// =====================================================

const updateHospital = async (
    req,
    res
) => {

    try {

        const hospital =
            await Hospital.findByIdAndUpdate(

                req.params.id,

                req.body,

                {
                    new: true,
                    runValidators: true,
                }

            );


        if (!hospital) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital Not Found",

                });

        }


        res.status(200).json({

            success: true,

            message:
                "Hospital Updated Successfully",

            data:
                hospital,

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
// DELETE HOSPITAL
// =====================================================

const deleteHospital = async (
    req,
    res
) => {

    try {

        const hospital =
            await Hospital.findByIdAndDelete(
                req.params.id
            );


        if (!hospital) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Hospital Not Found",

                });

        }


        res.status(200).json({

            success: true,

            message:
                "Hospital Deleted Successfully",

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
// EXPORT
// =====================================================

module.exports = {

    createHospital,

    getAllHospitals,

    recommendHospitals,

    getHospitalById,

    updateHospital,

    deleteHospital,

};