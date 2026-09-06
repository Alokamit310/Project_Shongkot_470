import { useEffect, useMemo, useRef, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import L from "leaflet";

import api from "../services/api";
import { getCurrentUser } from "../utils/auth";

import "leaflet/dist/leaflet.css";


// =====================================================
// LEAFLET DEFAULT MARKER FIX
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


// =====================================================
// MAP AUTO FOCUS
// =====================================================

function MapFocus({ hospital }) {
    const map = useMap();

    useEffect(() => {
        if (!hospital) return;

        const lat = Number(hospital.latitude);
        const lng = Number(hospital.longitude);

        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
        ) {
            return;
        }

        map.flyTo(
            [lat, lng],
            13,
            {
                duration: 1.2,
            }
        );

    }, [hospital, map]);

    return null;
}


// =====================================================
// EMPTY FORM
// =====================================================

const emptyHospitalForm = {
    name: "",
    district: "",
    address: "",
    phone: "",
    latitude: "",
    longitude: "",
    totalBeds: "",
    availableBeds: "",
    icuBeds: "",
    emergencyServices:
        "Emergency services available",
    ambulanceAvailable: true,
    emergencyAvailable: true,
    status: "Open",
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function Hospitals() {

    // =================================================
    // AUTH / ROLE
    // =================================================

    const currentUser =
        getCurrentUser();

    const canManageHospitals =
        currentUser?.role === "admin" ||
        currentUser?.role === "authority";


    // =================================================
    // GENERAL STATE
    // =================================================

    const [hospitals, setHospitals] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [selectedDistrict, setSelectedDistrict] =
        useState("");

    const [searchText, setSearchText] =
        useState("");

    const [selectedHospital, setSelectedHospital] =
        useState(null);

    const [focusedHospital, setFocusedHospital] =
        useState(null);

    const cardRefs =
        useRef({});


    // =================================================
    // RECOMMENDATION STATE
    // =================================================

    const [
        recommendedHospital,
        setRecommendedHospital,
    ] = useState(null);

    const [
        recommendationList,
        setRecommendationList,
    ] = useState([]);

    const [
        recommendationLoading,
        setRecommendationLoading,
    ] = useState(false);

    const [
        recommendationError,
        setRecommendationError,
    ] = useState("");


    // =================================================
    // LOCATION STATE
    // =================================================

    const [userLocation, setUserLocation] =
        useState(null);

    const [
        locationLoading,
        setLocationLoading,
    ] = useState(false);

    const [
        locationError,
        setLocationError,
    ] = useState("");

    const [
        nearestHospital,
        setNearestHospital,
    ] = useState(null);


    // =================================================
    // MANAGEMENT STATE
    // =================================================

    const [
        showHospitalForm,
        setShowHospitalForm,
    ] = useState(false);

    const [
        editingHospital,
        setEditingHospital,
    ] = useState(null);

    const [
        hospitalForm,
        setHospitalForm,
    ] = useState(emptyHospitalForm);

    const [
        managementLoading,
        setManagementLoading,
    ] = useState(false);

    const [
        managementError,
        setManagementError,
    ] = useState("");

    const [
        managementSuccess,
        setManagementSuccess,
    ] = useState("");


    // =====================================================
    // FETCH HOSPITALS
    // =====================================================

    const fetchHospitals =
        async () => {

            try {

                const response =
                    await api.get(
                        "/hospitals"
                    );

                setHospitals(
                    response.data?.data ||
                    []
                );

            } catch (err) {

                console.error(
                    "Hospital fetch failed:",
                    err
                );

                setError(
                    "Unable to load hospitals."
                );

            }

        };


    useEffect(() => {

        const loadHospitals =
            async () => {

                try {

                    setLoading(true);

                    await fetchHospitals();

                } finally {

                    setLoading(false);

                }

            };

        loadHospitals();

    }, []);


    // =====================================================
    // DISTRICT LIST
    // =====================================================

    const districts =
        useMemo(() => {

            return [
                ...new Set(
                    hospitals
                        .map(
                            (hospital) =>
                                hospital.district
                        )
                        .filter(Boolean)
                ),
            ].sort();

        }, [hospitals]);


    // =====================================================
    // FILTERED HOSPITALS
    // =====================================================

    const filteredHospitals =
        useMemo(() => {

            return hospitals.filter(
                (hospital) => {

                    const districtMatch =
                        !selectedDistrict ||
                        hospital.district ===
                            selectedDistrict;

                    const search =
                        searchText
                            .trim()
                            .toLowerCase();

                    /*
                        District filtering is handled
                        by the dropdown.

                        Text search only checks
                        hospital name + address.
                    */
                    const textMatch =
                        !search ||
                        hospital.name
                            ?.toLowerCase()
                            .includes(search) ||
                        hospital.address
                            ?.toLowerCase()
                            .includes(search);

                    return (
                        districtMatch &&
                        textMatch
                    );

                }
            );

        }, [
            hospitals,
            selectedDistrict,
            searchText,
        ]);


    // =====================================================
    // SUMMARY
    // =====================================================

    const totalHospitals =
        filteredHospitals.length;

    const totalAvailableBeds =
        filteredHospitals.reduce(
            (sum, hospital) =>
                sum +
                Number(
                    hospital.availableBeds ||
                        0
                ),
            0
        );

    const totalICUBeds =
        filteredHospitals.reduce(
            (sum, hospital) =>
                sum +
                Number(
                    hospital.icuBeds ||
                        0
                ),
            0
        );


    // =====================================================
    // DISTANCE CALCULATION
    // =====================================================

    const calculateDistance =
        (
            lat1,
            lon1,
            lat2,
            lon2
        ) => {

            const toRad =
                (value) =>
                    (value *
                        Math.PI) /
                    180;

            const earthRadiusKm =
                6371;

            const dLat =
                toRad(
                    lat2 - lat1
                );

            const dLon =
                toRad(
                    lon2 - lon1
                );

            const a =
                Math.sin(
                    dLat / 2
                ) ** 2 +
                Math.cos(
                    toRad(lat1)
                ) *
                    Math.cos(
                        toRad(lat2)
                    ) *
                    Math.sin(
                        dLon / 2
                    ) ** 2;

            const c =
                2 *
                Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(1 - a)
                );

            return (
                earthRadiusKm *
                c
            );

        };


    // =====================================================
    // SELECT HOSPITAL
    // =====================================================

    const selectHospital =
        (hospital) => {

            setSelectedHospital(
                hospital
            );

            setFocusedHospital(
                hospital
            );

            setTimeout(() => {

                const element =
                    cardRefs.current[
                        hospital._id
                    ];

                if (element) {

                    element.scrollIntoView({
                        behavior:
                            "smooth",
                        block: "center",
                    });

                }

            }, 500);

        };


    // =====================================================
    // LOAD RECOMMENDATION
    // =====================================================

    const loadRecommendation =
        async (
            district,
            location = userLocation
        ) => {

            if (!district) {

                setRecommendedHospital(
                    null
                );

                setRecommendationList(
                    []
                );

                return;

            }

            try {

                setRecommendationLoading(
                    true
                );

                setRecommendationError(
                    ""
                );

                let url =
                    `/hospitals/recommend?district=${encodeURIComponent(
                        district
                    )}`;

                if (
                    location &&
                    Number.isFinite(
                        location.lat
                    ) &&
                    Number.isFinite(
                        location.lng
                    )
                ) {

                    url +=
                        `&lat=${location.lat}&lng=${location.lng}`;

                }

                const response =
                    await api.get(url);

                setRecommendedHospital(
                    response.data
                        ?.recommendedHospital ||
                        null
                );

                setRecommendationList(
                    response.data?.data ||
                        []
                );

            } catch (err) {

                console.error(
                    "Recommendation failed:",
                    err
                );

                setRecommendedHospital(
                    null
                );

                setRecommendationList(
                    []
                );

                setRecommendationError(
                    err.response?.data
                        ?.message ||
                        "Unable to generate hospital recommendation."
                );

            } finally {

                setRecommendationLoading(
                    false
                );

            }

        };


    // =====================================================
    // RECALCULATE NEAREST
    // =====================================================

    const calculateNearestInDistrict =
        (
            district,
            location
        ) => {

            const districtHospitals =
                hospitals.filter(
                    (hospital) =>
                        hospital.district ===
                        district
                );

            let nearest = null;
            let smallestDistance =
                Infinity;

            districtHospitals.forEach(
                (hospital) => {

                    const lat =
                        Number(
                            hospital.latitude
                        );

                    const lng =
                        Number(
                            hospital.longitude
                        );

                    if (
                        !Number.isFinite(lat) ||
                        !Number.isFinite(lng)
                    ) {
                        return;
                    }

                    const distance =
                        calculateDistance(
                            location.lat,
                            location.lng,
                            lat,
                            lng
                        );

                    if (
                        distance <
                        smallestDistance
                    ) {

                        smallestDistance =
                            distance;

                        nearest = {
                            ...hospital,

                            distanceKm:
                                Number(
                                    distance.toFixed(
                                        2
                                    )
                                ),
                        };

                    }

                }
            );

            return nearest;

        };


    // =====================================================
    // DISTRICT CHANGE
    // =====================================================

    const handleDistrictChange =
        async (event) => {

            const district =
                event.target.value;

            setSelectedDistrict(
                district
            );

            setSearchText("");

            setSelectedHospital(
                null
            );

            setFocusedHospital(
                null
            );

            setNearestHospital(
                null
            );

            setRecommendedHospital(
                null
            );

            setRecommendationList(
                []
            );

            setRecommendationError(
                ""
            );

            if (!district) {
                return;
            }

            if (
                userLocation &&
                Number.isFinite(
                    userLocation.lat
                ) &&
                Number.isFinite(
                    userLocation.lng
                )
            ) {

                const nearest =
                    calculateNearestInDistrict(
                        district,
                        userLocation
                    );

                setNearestHospital(
                    nearest
                );

                setLocationError(
                    ""
                );

                if (nearest) {

                    setFocusedHospital(
                        nearest
                    );

                }

                await loadRecommendation(
                    district,
                    userLocation
                );

                return;

            }

            await loadRecommendation(
                district,
                null
            );

        };


    // =====================================================
    // FIND USER LOCATION + NEAREST
    // =====================================================

    const findNearestHospital =
        () => {

            if (
                !navigator.geolocation
            ) {

                setUserLocation(
                    null
                );

                setNearestHospital(
                    null
                );

                setLocationError(
                    "Geolocation is not supported by this browser."
                );

                return;

            }

            if (!selectedDistrict) {

                setLocationError(
                    "Please select a district first."
                );

                return;

            }

            setUserLocation(
                null
            );

            setNearestHospital(
                null
            );

            setLocationLoading(
                true
            );

            setLocationError("");

            navigator.geolocation
                .getCurrentPosition(

                    async (
                        position
                    ) => {

                        const location = {
                            lat:
                                position
                                    .coords
                                    .latitude,

                            lng:
                                position
                                    .coords
                                    .longitude,
                        };

                        setUserLocation(
                            location
                        );

                        const nearest =
                            calculateNearestInDistrict(
                                selectedDistrict,
                                location
                            );

                        setNearestHospital(
                            nearest
                        );

                        if (nearest) {

                            setFocusedHospital(
                                nearest
                            );

                        }

                        await loadRecommendation(
                            selectedDistrict,
                            location
                        );

                        setLocationLoading(
                            false
                        );

                    },

                    (locationErr) => {

                        console.error(
                            "Location error:",
                            locationErr
                        );

                        setUserLocation(
                            null
                        );

                        setNearestHospital(
                            null
                        );

                        setLocationError(
                            "Unable to access your location. Please allow browser location permission."
                        );

                        setLocationLoading(
                            false
                        );

                    },

                    {
                        enableHighAccuracy:
                            true,

                        timeout:
                            10000,

                        maximumAge:
                            60000,
                    }

                );

        };


    // =====================================================
    // RECOMMENDATION INFO
    // =====================================================

    const getRecommendationInfo =
        (hospitalId) => {

            return (
                recommendationList.find(
                    (item) =>
                        item._id ===
                        hospitalId
                ) || null
            );

        };


    // =====================================================
    // OPEN ADD FORM
    // =====================================================

    const openAddHospitalForm =
        () => {

            setEditingHospital(
                null
            );

            setHospitalForm({
                ...emptyHospitalForm,
            });

            setManagementError(
                ""
            );

            setManagementSuccess(
                ""
            );

            setShowHospitalForm(
                true
            );

            setTimeout(() => {

                document
                    .getElementById(
                        "hospital-management-form"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block: "start",
                    });

            }, 100);

        };


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    const openEditHospitalForm =
        (hospital) => {

            setEditingHospital(
                hospital
            );

            setHospitalForm({
                name:
                    hospital.name || "",

                district:
                    hospital.district || "",

                address:
                    hospital.address || "",

                phone:
                    hospital.phone || "",

                latitude:
                    hospital.latitude ?? "",

                longitude:
                    hospital.longitude ?? "",

                totalBeds:
                    hospital.totalBeds ?? 0,

                availableBeds:
                    hospital.availableBeds ??
                    0,

                icuBeds:
                    hospital.icuBeds ?? 0,

                emergencyServices:
                    hospital.emergencyServices ||
                    "Emergency services available",

                ambulanceAvailable:
                    Boolean(
                        hospital.ambulanceAvailable
                    ),

                emergencyAvailable:
                    Boolean(
                        hospital.emergencyAvailable
                    ),

                status:
                    hospital.status ||
                    "Open",
            });

            setManagementError(
                ""
            );

            setManagementSuccess(
                ""
            );

            setShowHospitalForm(
                true
            );

            setTimeout(() => {

                document
                    .getElementById(
                        "hospital-management-form"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block: "start",
                    });

            }, 100);

        };


    // =====================================================
    // CLOSE MANAGEMENT FORM
    // =====================================================

    const closeHospitalForm =
        () => {

            setShowHospitalForm(
                false
            );

            setEditingHospital(
                null
            );

            setHospitalForm({
                ...emptyHospitalForm,
            });

            setManagementError(
                ""
            );

        };


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleHospitalFormChange =
        (event) => {

            const {
                name,
                value,
                type,
                checked,
            } = event.target;

            setHospitalForm(
                (previous) => ({
                    ...previous,

                    [name]:
                        type ===
                        "checkbox"
                            ? checked
                            : value,
                })
            );

        };


    // =====================================================
    // CREATE / UPDATE HOSPITAL
    // =====================================================

    const handleHospitalSubmit =
        async (event) => {

            event.preventDefault();

            setManagementError(
                ""
            );

            setManagementSuccess(
                ""
            );

            if (
                !hospitalForm.name.trim() ||
                !hospitalForm.district.trim() ||
                !hospitalForm.address.trim() ||
                !hospitalForm.phone.trim()
            ) {

                setManagementError(
                    "Please complete all required hospital information."
                );

                return;

            }

            const latitude =
                Number(
                    hospitalForm.latitude
                );

            const longitude =
                Number(
                    hospitalForm.longitude
                );

            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                )
            ) {

                setManagementError(
                    "Please enter valid latitude and longitude."
                );

                return;

            }

            const payload = {
                name:
                    hospitalForm.name.trim(),

                district:
                    hospitalForm.district.trim(),

                address:
                    hospitalForm.address.trim(),

                phone:
                    hospitalForm.phone.trim(),

                latitude,

                longitude,

                totalBeds:
                    Math.max(
                        0,
                        Number(
                            hospitalForm.totalBeds
                        ) || 0
                    ),

                availableBeds:
                    Math.max(
                        0,
                        Number(
                            hospitalForm.availableBeds
                        ) || 0
                    ),

                icuBeds:
                    Math.max(
                        0,
                        Number(
                            hospitalForm.icuBeds
                        ) || 0
                    ),

                emergencyServices:
                    hospitalForm
                        .emergencyServices
                        .trim() ||
                    "Emergency services available",

                ambulanceAvailable:
                    hospitalForm.ambulanceAvailable,

                emergencyAvailable:
                    hospitalForm.emergencyAvailable,

                status:
                    hospitalForm.status,
            };

            if (
                payload.availableBeds >
                payload.totalBeds
            ) {

                setManagementError(
                    "Available beds cannot be greater than total beds."
                );

                return;

            }

            try {

                setManagementLoading(
                    true
                );

                if (
                    editingHospital
                ) {

                    await api.put(
                        `/hospitals/${editingHospital._id}`,
                        payload
                    );

                    setManagementSuccess(
                        "Hospital updated successfully."
                    );

                } else {

                    await api.post(
                        "/hospitals",
                        payload
                    );

                    setManagementSuccess(
                        "Hospital added successfully."
                    );

                }

                await fetchHospitals();

                setShowHospitalForm(
                    false
                );

                setEditingHospital(
                    null
                );

                setHospitalForm({
                    ...emptyHospitalForm,
                });

                setSelectedHospital(
                    null
                );

                setFocusedHospital(
                    null
                );

                setRecommendedHospital(
                    null
                );

                setRecommendationList(
                    []
                );

                setNearestHospital(
                    null
                );

            } catch (err) {

                console.error(
                    "Hospital save failed:",
                    err
                );

                setManagementError(
                    err.response?.data
                        ?.message ||
                        "Unable to save hospital."
                );

            } finally {

                setManagementLoading(
                    false
                );

            }

        };


    // =====================================================
    // DELETE HOSPITAL
    // =====================================================

    const handleDeleteHospital =
        async (hospital) => {

            const confirmed =
                window.confirm(
                    `Delete "${hospital.name}"?\n\nThis action cannot be undone.`
                );

            if (!confirmed) {
                return;
            }

            try {

                setManagementLoading(
                    true
                );

                setManagementError(
                    ""
                );

                setManagementSuccess(
                    ""
                );

                await api.delete(
                    `/hospitals/${hospital._id}`
                );

                setManagementSuccess(
                    "Hospital deleted successfully."
                );

                if (
                    selectedHospital?._id ===
                    hospital._id
                ) {

                    setSelectedHospital(
                        null
                    );

                }

                if (
                    recommendedHospital?._id ===
                    hospital._id
                ) {

                    setRecommendedHospital(
                        null
                    );

                }

                if (
                    nearestHospital?._id ===
                    hospital._id
                ) {

                    setNearestHospital(
                        null
                    );

                }

                await fetchHospitals();

            } catch (err) {

                console.error(
                    "Hospital delete failed:",
                    err
                );

                setManagementError(
                    err.response?.data
                        ?.message ||
                        "Unable to delete hospital."
                );

            } finally {

                setManagementLoading(
                    false
                );

            }

        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="hospitals-page">

                <div className="page-header">

                    <h1>
                        Hospitals
                    </h1>

                    <p>
                        Loading hospital
                        information...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="hospitals-page">

                <div className="page-header">

                    <h1>
                        Hospitals
                    </h1>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="hospitals-page">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <p className="page-eyebrow">
                        Emergency Healthcare
                    </p>

                    <h1>
                        Smart Hospital Finder
                    </h1>

                    <p>
                        Search hospitals by
                        district, view emergency
                        resources, find the nearest
                        hospital and receive a
                        smart recommendation.
                    </p>

                </div>


                {canManageHospitals && (

                    <button
                        type="button"
                        className="hospital-location-button"
                        onClick={
                            openAddHospitalForm
                        }
                    >
                        + Add Hospital
                    </button>

                )}

            </div>


            {/* =================================================
                MANAGEMENT FEEDBACK
            ================================================= */}

            {canManageHospitals &&
                managementSuccess && (

                <div className="hospital-message success">

                    {
                        managementSuccess
                    }

                </div>

            )}


            {canManageHospitals &&
                managementError &&
                !showHospitalForm && (

                <div className="hospital-message warning">

                    {
                        managementError
                    }

                </div>

            )}


            {/* =================================================
                HOSPITAL MANAGEMENT FORM
            ================================================= */}

            {canManageHospitals &&
                showHospitalForm && (

                <section
                    id="hospital-management-form"
                    className="hospital-details-section"
                >

                    <div className="hospital-details-header">

                        <div>

                            <p className="section-eyebrow">
                                Hospital Management
                            </p>

                            <h2>
                                {editingHospital
                                    ? "Edit Hospital"
                                    : "Add New Hospital"}
                            </h2>

                            <p>
                                {editingHospital
                                    ? "Update hospital information and emergency resource availability."
                                    : "Register a new hospital in the Shonkot healthcare directory."}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="hospital-close-button"
                            onClick={
                                closeHospitalForm
                            }
                        >
                            Cancel
                        </button>

                    </div>


                    {managementError && (

                        <div className="hospital-message warning">

                            {
                                managementError
                            }

                        </div>

                    )}


                    <form
                        onSubmit={
                            handleHospitalSubmit
                        }
                    >

                        <div className="hospital-details-grid">

                            <div>

                                <span>
                                    Hospital Name *
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    value={
                                        hospitalForm.name
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <span>
                                    District *
                                </span>

                                <input
                                    type="text"
                                    name="district"
                                    value={
                                        hospitalForm.district
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <span>
                                    Phone *
                                </span>

                                <input
                                    type="text"
                                    name="phone"
                                    value={
                                        hospitalForm.phone
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <span>
                                    Status
                                </span>

                                <select
                                    name="status"
                                    value={
                                        hospitalForm.status
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                >

                                    <option value="Open">
                                        Open
                                    </option>

                                    <option value="Closed">
                                        Closed
                                    </option>

                                </select>

                            </div>


                            <div>

                                <span>
                                    Latitude *
                                </span>

                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={
                                        hospitalForm.latitude
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <span>
                                    Longitude *
                                </span>

                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={
                                        hospitalForm.longitude
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                    required
                                />

                            </div>


                            <div>

                                <span>
                                    Total Beds
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    name="totalBeds"
                                    value={
                                        hospitalForm.totalBeds
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                />

                            </div>


                            <div>

                                <span>
                                    Available Beds
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    name="availableBeds"
                                    value={
                                        hospitalForm.availableBeds
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                />

                            </div>


                            <div>

                                <span>
                                    ICU Beds
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    name="icuBeds"
                                    value={
                                        hospitalForm.icuBeds
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                />

                            </div>

                        </div>


                        <div className="hospital-details-block">

                            <span>
                                Address *
                            </span>

                            <textarea
                                name="address"
                                rows="3"
                                value={
                                    hospitalForm.address
                                }
                                onChange={
                                    handleHospitalFormChange
                                }
                                required
                            />

                        </div>


                        <div className="hospital-details-block">

                            <span>
                                Emergency Services
                            </span>

                            <textarea
                                name="emergencyServices"
                                rows="3"
                                value={
                                    hospitalForm.emergencyServices
                                }
                                onChange={
                                    handleHospitalFormChange
                                }
                            />

                        </div>


                        <div className="hospital-services">

                            <label>

                                <input
                                    type="checkbox"
                                    name="ambulanceAvailable"
                                    checked={
                                        hospitalForm.ambulanceAvailable
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                />

                                {" "}
                                Ambulance Available

                            </label>


                            <label>

                                <input
                                    type="checkbox"
                                    name="emergencyAvailable"
                                    checked={
                                        hospitalForm.emergencyAvailable
                                    }
                                    onChange={
                                        handleHospitalFormChange
                                    }
                                />

                                {" "}
                                Emergency Available

                            </label>

                        </div>


                        <div
                            style={{
                                marginTop:
                                    "20px",

                                display:
                                    "flex",

                                gap:
                                    "12px",

                                flexWrap:
                                    "wrap",
                            }}
                        >

                            <button
                                type="submit"
                                className="hospital-location-button"
                                disabled={
                                    managementLoading
                                }
                            >

                                {managementLoading
                                    ? "Saving..."
                                    : editingHospital
                                    ? "Update Hospital"
                                    : "Add Hospital"}

                            </button>


                            <button
                                type="button"
                                className="hospital-close-button"
                                onClick={
                                    closeHospitalForm
                                }
                                disabled={
                                    managementLoading
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </section>

            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="hospital-summary-grid">

                <div className="hospital-summary-card">

                    <span>
                        Hospitals
                    </span>

                    <strong>
                        {totalHospitals}
                    </strong>

                </div>


                <div className="hospital-summary-card">

                    <span>
                        Available Beds
                    </span>

                    <strong>
                        {
                            totalAvailableBeds
                        }
                    </strong>

                </div>


                <div className="hospital-summary-card">

                    <span>
                        ICU Beds
                    </span>

                    <strong>
                        {
                            totalICUBeds
                        }
                    </strong>

                </div>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <section className="hospital-search-section">

                <div>

                    <p className="section-eyebrow">
                        Search
                    </p>

                    <h2>
                        Find Hospitals
                    </h2>

                </div>


                <div className="hospital-search-controls">

                    <select
                        value={
                            selectedDistrict
                        }
                        onChange={
                            handleDistrictChange
                        }
                    >

                        <option value="">
                            All Districts
                        </option>

                        {districts.map(
                            (district) => (

                                <option
                                    key={
                                        district
                                    }
                                    value={
                                        district
                                    }
                                >
                                    {
                                        district
                                    }
                                </option>

                            )
                        )}

                    </select>


                    <input
                        type="text"
                        placeholder="Search hospital name or address..."
                        value={
                            searchText
                        }
                        onChange={(
                            event
                        ) =>
                            setSearchText(
                                event
                                    .target
                                    .value
                            )
                        }
                    />


                    <button
                        type="button"
                        className="hospital-location-button"
                        onClick={
                            findNearestHospital
                        }
                        disabled={
                            locationLoading
                        }
                    >
                        {locationLoading
                            ? "Finding..."
                            : "Find Nearest"}
                    </button>

                </div>

            </section>


            {/* =================================================
                LOCATION ERROR
            ================================================= */}

            {locationError && (

                <div className="hospital-message warning">

                    {
                        locationError
                    }

                </div>

            )}


            {/* =================================================
                SMART RECOMMENDATION
            ================================================= */}

            {selectedDistrict && (

                <section className="hospital-recommendation-section">

                    <div className="hospital-recommendation-header">

                        <div>

                            <p className="section-eyebrow">
                                Smart Recommendation
                            </p>

                            <h2>
                                Recommended Hospital in{" "}
                                {
                                    selectedDistrict
                                }
                            </h2>

                        </div>

                    </div>


                    {recommendationLoading && (

                        <div className="hospital-message">

                            Calculating recommendation...

                        </div>

                    )}


                    {!recommendationLoading &&
                        recommendationError && (

                            <div className="hospital-message warning">

                                {
                                    recommendationError
                                }

                            </div>

                        )}


                    {!recommendationLoading &&
                        recommendedHospital && (

                            <div
                                className="recommended-hospital-card"
                                onClick={() =>
                                    selectHospital(
                                        recommendedHospital
                                    )
                                }
                            >

                                <div className="recommended-hospital-top">

                                    <div>

                                        <span className="recommended-badge">
                                            ★ Recommended
                                        </span>

                                        <h3>
                                            {
                                                recommendedHospital.name
                                            }
                                        </h3>

                                        <p>
                                            {
                                                recommendedHospital.address
                                            }
                                        </p>

                                    </div>


                                    <div className="recommendation-score">

                                        <span>
                                            Score
                                        </span>

                                        <strong>
                                            {
                                                recommendedHospital.recommendationScore
                                            }
                                        </strong>

                                    </div>

                                </div>


                                <div className="recommendation-facts">

                                    <span>
                                        🛏{" "}
                                        {
                                            recommendedHospital.availableBeds
                                        }{" "}
                                        beds available
                                    </span>


                                    <span>
                                        🏥{" "}
                                        {
                                            recommendedHospital.icuBeds
                                        }{" "}
                                        ICU beds
                                    </span>


                                    <span>
                                        🚑{" "}
                                        {recommendedHospital.ambulanceAvailable
                                            ? "Ambulance available"
                                            : "No ambulance"}
                                    </span>


                                    {recommendedHospital.distanceKm !==
                                        null &&
                                        recommendedHospital.distanceKm !==
                                            undefined && (

                                            <span>
                                                📍{" "}
                                                {
                                                    recommendedHospital.distanceKm
                                                }{" "}
                                                km away
                                            </span>

                                        )}

                                </div>


                                {recommendedHospital
                                    .recommendationReasons
                                    ?.length >
                                    0 && (

                                    <div className="recommendation-reasons">

                                        <strong>
                                            Why recommended
                                        </strong>

                                        <ul>

                                            {recommendedHospital.recommendationReasons.map(
                                                (
                                                    reason,
                                                    index
                                                ) => (

                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >

                                                        {reason.replace(
                                                            /(\d+)\s+ICU beds available/i,
                                                            "$1 ICU beds"
                                                        )}

                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>

                                )}

                            </div>

                        )}

                </section>

            )}


            {/* =================================================
                NEAREST
            ================================================= */}

            {nearestHospital && (

                <section className="nearest-hospital-section">

                    <div>

                        <p className="section-eyebrow">
                            Your Location
                        </p>

                        <h2>
                            Nearest Hospital
                        </h2>

                    </div>


                    <div
                        className="nearest-hospital-card"
                        onClick={() =>
                            selectHospital(
                                nearestHospital
                            )
                        }
                    >

                        <div>

                            <span className="nearest-badge">
                                📍 Nearest
                            </span>

                            <h3>
                                {
                                    nearestHospital.name
                                }
                            </h3>

                            <p>
                                {
                                    nearestHospital.address
                                }
                            </p>

                        </div>


                        <strong>
                            {
                                nearestHospital.distanceKm
                            }{" "}
                            km
                        </strong>

                    </div>

                </section>

            )}


            {/* =================================================
                MAP
            ================================================= */}

            <section className="hospital-map-section">

                <div className="hospital-map-header">

                    <div>

                        <p className="section-eyebrow">
                            Hospital Map
                        </p>

                        <h2>
                            Hospital Locations
                        </h2>

                        <p>
                            Click a marker or hospital
                            card to view details.
                        </p>

                    </div>

                </div>


                <div className="hospital-map-wrapper">

                    <MapContainer
                        center={[
                            23.685,
                            90.3563,
                        ]}
                        zoom={7}
                        scrollWheelZoom={
                            true
                        }
                        className="hospital-map"
                    >

                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />


                        <MapFocus
                            hospital={
                                focusedHospital
                            }
                        />


                        {filteredHospitals.map(
                            (hospital) => {

                                const lat =
                                    Number(
                                        hospital.latitude
                                    );

                                const lng =
                                    Number(
                                        hospital.longitude
                                    );

                                if (
                                    !Number.isFinite(
                                        lat
                                    ) ||
                                    !Number.isFinite(
                                        lng
                                    )
                                ) {
                                    return null;
                                }


                                const recommendation =
                                    getRecommendationInfo(
                                        hospital._id
                                    );


                                return (

                                    <Marker
                                        key={
                                            hospital._id
                                        }
                                        position={[
                                            lat,
                                            lng,
                                        ]}
                                        eventHandlers={{
                                            click: () =>
                                                selectHospital(
                                                    hospital
                                                ),
                                        }}
                                    >

                                        <Popup>

                                            <div className="hospital-map-popup">

                                                <strong>
                                                    {
                                                        hospital.name
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        hospital.district
                                                    }
                                                </span>

                                                <span>
                                                    Beds:{" "}
                                                    {
                                                        hospital.availableBeds
                                                    }
                                                    /
                                                    {
                                                        hospital.totalBeds
                                                    }
                                                </span>

                                                <span>
                                                    ICU:{" "}
                                                    {
                                                        hospital.icuBeds
                                                    }
                                                </span>

                                                <span>
                                                    Status:{" "}
                                                    {
                                                        hospital.status
                                                    }
                                                </span>

                                                {recommendation && (

                                                    <span>
                                                        Rank: #
                                                        {
                                                            recommendation.recommendationRank
                                                        }
                                                    </span>

                                                )}

                                            </div>

                                        </Popup>

                                    </Marker>

                                );

                            }
                        )}

                    </MapContainer>

                </div>

            </section>


            {/* =================================================
                HOSPITAL LIST
            ================================================= */}

            <section className="hospital-list-section">

                <div className="hospital-list-header">

                    <div>

                        <p className="section-eyebrow">
                            Directory
                        </p>

                        <h2>
                            Hospital List
                        </h2>

                        <p>
                            {
                                filteredHospitals.length
                            }{" "}
                            hospital
                            {filteredHospitals.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found.
                        </p>

                    </div>

                </div>


                {filteredHospitals.length ===
                0 ? (

                    <div className="hospital-message">

                        No hospitals match
                        your search.

                    </div>

                ) : (

                    <div className="hospital-grid">

                        {filteredHospitals.map(
                            (hospital) => {

                                const recommendation =
                                    getRecommendationInfo(
                                        hospital._id
                                    );

                                const isRecommended =
                                    recommendedHospital?._id ===
                                    hospital._id;

                                const isNearest =
                                    nearestHospital?._id ===
                                    hospital._id;

                                const isSelected =
                                    selectedHospital?._id ===
                                    hospital._id;


                                return (

                                    <article
                                        key={
                                            hospital._id
                                        }
                                        ref={(
                                            element
                                        ) => {

                                            cardRefs.current[
                                                hospital._id
                                            ] =
                                                element;

                                        }}
                                        className={`hospital-card ${
                                            isSelected
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            selectHospital(
                                                hospital
                                            )
                                        }
                                    >

                                        <div className="hospital-card-badges">

                                            {isRecommended && (

                                                <span className="recommended-badge small">
                                                    ★ Recommended
                                                </span>

                                            )}


                                            {isNearest && (

                                                <span className="nearest-badge small">
                                                    📍 Nearest
                                                </span>

                                            )}


                                            {recommendation && (

                                                <span className="rank-badge">
                                                    Rank #
                                                    {
                                                        recommendation.recommendationRank
                                                    }
                                                </span>

                                            )}

                                        </div>


                                        <div className="hospital-card-header">

                                            <div>

                                                <h3>
                                                    {
                                                        hospital.name
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        hospital.district
                                                    }
                                                </p>

                                            </div>


                                            <span
                                                className={`hospital-status ${
                                                    hospital.status ===
                                                    "Open"
                                                        ? "open"
                                                        : "closed"
                                                }`}
                                            >
                                                {
                                                    hospital.status
                                                }
                                            </span>

                                        </div>


                                        <p className="hospital-address">

                                            {
                                                hospital.address
                                            }

                                        </p>


                                        <div className="hospital-card-stats">

                                            <div>

                                                <span>
                                                    Available Beds
                                                </span>

                                                <strong>
                                                    {
                                                        hospital.availableBeds
                                                    }
                                                    /
                                                    {
                                                        hospital.totalBeds
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    ICU Beds
                                                </span>

                                                <strong>
                                                    {
                                                        hospital.icuBeds
                                                    }
                                                </strong>

                                            </div>

                                        </div>


                                        <div className="hospital-services">

                                            <span>
                                                🚑{" "}
                                                {hospital.ambulanceAvailable
                                                    ? "Ambulance"
                                                    : "No Ambulance"}
                                            </span>

                                            <span>
                                                🚨{" "}
                                                {hospital.emergencyAvailable
                                                    ? "Emergency"
                                                    : "No Emergency"}
                                            </span>

                                        </div>


                                        {recommendation?.distanceKm !==
                                            null &&
                                            recommendation?.distanceKm !==
                                                undefined && (

                                            <p className="hospital-distance">

                                                📍{" "}
                                                {
                                                    recommendation.distanceKm
                                                }{" "}
                                                km from your location

                                            </p>

                                        )}


                                        <button
                                            type="button"
                                            className="hospital-details-button"
                                            onClick={(
                                                event
                                            ) => {

                                                event.stopPropagation();

                                                selectHospital(
                                                    hospital
                                                );

                                            }}
                                        >
                                            View Full Details
                                        </button>


                                        {canManageHospitals && (

                                            <div
                                                style={{
                                                    display:
                                                        "flex",

                                                    gap:
                                                        "10px",

                                                    marginTop:
                                                        "10px",

                                                    flexWrap:
                                                        "wrap",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    className="hospital-details-button"
                                                    onClick={(
                                                        event
                                                    ) => {

                                                        event.stopPropagation();

                                                        openEditHospitalForm(
                                                            hospital
                                                        );

                                                    }}
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    type="button"
                                                    className="hospital-close-button"
                                                    disabled={
                                                        managementLoading
                                                    }
                                                    onClick={(
                                                        event
                                                    ) => {

                                                        event.stopPropagation();

                                                        handleDeleteHospital(
                                                            hospital
                                                        );

                                                    }}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        )}

                                    </article>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                SELECTED DETAILS
            ================================================= */}

            {selectedHospital && (

                <section className="hospital-details-section">

                    <div className="hospital-details-header">

                        <div>

                            <p className="section-eyebrow">
                                Hospital Details
                            </p>

                            <h2>
                                {
                                    selectedHospital.name
                                }
                            </h2>

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "10px",

                                flexWrap:
                                    "wrap",
                            }}
                        >

                            {canManageHospitals && (

                                <button
                                    type="button"
                                    className="hospital-details-button"
                                    onClick={() =>
                                        openEditHospitalForm(
                                            selectedHospital
                                        )
                                    }
                                >
                                    Edit Hospital
                                </button>

                            )}


                            <button
                                type="button"
                                className="hospital-close-button"
                                onClick={() =>
                                    setSelectedHospital(
                                        null
                                    )
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>


                    <div className="hospital-details-grid">

                        <div>

                            <span>
                                District
                            </span>

                            <strong>
                                {
                                    selectedHospital.district
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Status
                            </span>

                            <strong>
                                {
                                    selectedHospital.status
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>
                                {
                                    selectedHospital.phone
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total Beds
                            </span>

                            <strong>
                                {
                                    selectedHospital.totalBeds
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Available Beds
                            </span>

                            <strong>
                                {
                                    selectedHospital.availableBeds
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                ICU Beds
                            </span>

                            <strong>
                                {
                                    selectedHospital.icuBeds
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Ambulance
                            </span>

                            <strong>
                                {selectedHospital.ambulanceAvailable
                                    ? "Available"
                                    : "Not Available"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Emergency
                            </span>

                            <strong>
                                {selectedHospital.emergencyAvailable
                                    ? "Available"
                                    : "Not Available"}
                            </strong>

                        </div>

                    </div>


                    <div className="hospital-details-block">

                        <span>
                            Address
                        </span>

                        <p>
                            {
                                selectedHospital.address
                            }
                        </p>

                    </div>


                    <div className="hospital-details-block">

                        <span>
                            Emergency Services
                        </span>

                        <p>
                            {
                                selectedHospital.emergencyServices
                            }
                        </p>

                    </div>


                    <div className="hospital-details-block">

                        <span>
                            Coordinates
                        </span>

                        <p>
                            {
                                selectedHospital.latitude
                            }
                            ,{" "}
                            {
                                selectedHospital.longitude
                            }
                        </p>

                    </div>

                </section>

            )}

        </div>

    );

}