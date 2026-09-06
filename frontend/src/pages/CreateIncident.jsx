import { useState } from "react";

import {
    AlertTriangle,
    Send,
    MapPin,
    Phone,
    User,
    FileText,
    ShieldAlert,
    Navigation,
} from "lucide-react";

import api from "../services/api";


function CreateIncident() {

    const [formData, setFormData] =
        useState({
            reporterName: "",
            phone: "",
            district: "",
            location: "",
            incidentType: "",
            description: "",
            severity: "",
            latitude: null,
            longitude: null,
        });


    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    const [
        locationLoading,
        setLocationLoading,
    ] = useState(false);

    const [
        locationMessage,
        setLocationMessage,
    ] = useState("");


    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (event) => {

        setFormData({
            ...formData,

            [event.target.name]:
                event.target.value,
        });

    };


    // =====================================================
    // GET CURRENT LOCATION
    // =====================================================

    const useCurrentLocation =
        () => {

            setLocationMessage(
                ""
            );

            setError(
                ""
            );

            setFormData(
                (previous) => ({
                    ...previous,
                    latitude: null,
                    longitude: null,
                })
            );

            if (
                !navigator.geolocation
            ) {

                setError(
                    "Geolocation is not supported by this browser."
                );

                return;
            }

            setLocationLoading(
                true
            );

            navigator.geolocation
                .getCurrentPosition(

                    (position) => {

                        const latitude =
                            position.coords.latitude;

                        const longitude =
                            position.coords.longitude;


                        setFormData(
                            (previous) => ({
                                ...previous,

                                latitude,

                                longitude,
                            })
                        );


                        setLocationMessage(
                            `Location captured successfully (${latitude.toFixed(
                                5
                            )}, ${longitude.toFixed(
                                5
                            )})`
                        );

                        setError(
                            ""
                        );


                        setLocationLoading(
                            false
                        );

                    },


                    (locationError) => {

                        console.error(
                            "Location error:",
                            locationError
                        );

                        setFormData(
                            (previous) => ({
                                ...previous,
                                latitude: null,
                                longitude: null,
                            })
                        );

                        setLocationMessage(
                            ""
                        );

                        setError(
                            "Unable to access your location. Please allow location permission in your browser."
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
    // SUBMIT INCIDENT
    // =====================================================

    const handleSubmit =
        async (event) => {

            event.preventDefault();

            try {

                setLoading(true);

                setMessage("");

                setError("");


                const response =
                    await api.post(
                        "/incidents",
                        formData
                    );


                console.log(
                    "[CreateIncident] API response:",
                    response.data
                );


                setMessage(
                    "Incident report submitted successfully."
                );


                setFormData({
                    reporterName: "",
                    phone: "",
                    district: "",
                    location: "",
                    incidentType: "",
                    description: "",
                    severity: "",
                    latitude: null,
                    longitude: null,
                });


                setLocationMessage("");


            } catch (error) {

                console.error(
                    "[CreateIncident] API error:",
                    error.response ||
                        error
                );


                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to submit incident report."
                );


            } finally {

                setLoading(false);

            }

        };


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="create-incident-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="create-incident-hero">

                <div className="create-incident-hero-content">

                    <div className="incident-hero-icon">

                        <AlertTriangle
                            size={30}
                        />

                    </div>


                    <div>

                        <p className="page-eyebrow">
                            CITIZEN EMERGENCY REPORTING
                        </p>

                        <h1>
                            Report an Incident
                        </h1>

                        <p>
                            Send an emergency report
                            directly to the response
                            team. Accurate information
                            helps authorities act faster.
                        </p>

                    </div>

                </div>


                <div className="incident-emergency-badge">

                    <ShieldAlert
                        size={18}
                    />

                    Emergency Report

                </div>

            </div>


            {/* ==========================================
                FORM CARD
            ========================================== */}

            <div className="incident-form-card modern">

                <div className="incident-form-heading">

                    <div>

                        <p className="section-eyebrow">
                            Incident Information
                        </p>

                        <h2>
                            Emergency Report Details
                        </h2>

                        <p>
                            Please provide as much
                            accurate information as
                            possible.
                        </p>

                    </div>

                </div>


                <form
                    onSubmit={
                        handleSubmit
                    }
                >


                    {/* ==================================
                        REPORTER INFO
                    ================================== */}

                    <div className="incident-form-section">

                        <h3>
                            Reporter Information
                        </h3>


                        <div className="form-grid">


                            <div className="form-group">

                                <label>
                                    Your Name
                                </label>

                                <div className="incident-input-wrapper">

                                    <User
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="reporterName"
                                        value={
                                            formData.reporterName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Enter your name"
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>

                                <div className="incident-input-wrapper">

                                    <Phone
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="e.g. 017XXXXXXXX"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        LOCATION
                    ================================== */}

                    <div className="incident-form-section">

                        <div
                            style={{
                                display:
                                    "flex",

                                justifyContent:
                                    "space-between",

                                alignItems:
                                    "center",

                                gap:
                                    "12px",

                                flexWrap:
                                    "wrap",

                                marginBottom:
                                    "16px",
                            }}
                        >

                            <h3
                                style={{
                                    margin: 0,
                                }}
                            >
                                Incident Location
                            </h3>


                            <button
                                type="button"
                                className="hospital-location-button"
                                onClick={
                                    useCurrentLocation
                                }
                                disabled={
                                    locationLoading
                                }
                            >

                                <Navigation
                                    size={17}
                                />

                                {locationLoading
                                    ? "Getting Location..."
                                    : "Use My Current Location"}

                            </button>

                        </div>


                        {locationMessage && (

                            <div className="success-message">

                                {
                                    locationMessage
                                }

                            </div>

                        )}


                        <div className="form-grid">


                            <div className="form-group">

                                <label>
                                    District
                                </label>

                                <div className="incident-input-wrapper">

                                    <MapPin
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="district"
                                        value={
                                            formData.district
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="e.g. Dhaka"
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Specific Location
                                </label>

                                <div className="incident-input-wrapper">

                                    <MapPin
                                        size={18}
                                    />

                                    <input
                                        type="text"
                                        name="location"
                                        value={
                                            formData.location
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="e.g. Mirpur 10"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        INCIDENT DETAILS
                    ================================== */}

                    <div className="incident-form-section">

                        <h3>
                            Incident Details
                        </h3>


                        <div className="form-grid">


                            <div className="form-group">

                                <label>
                                    Incident Type
                                </label>

                                <select
                                    name="incidentType"
                                    value={
                                        formData.incidentType
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select incident type
                                    </option>

                                    <option value="Flood">
                                        Flood
                                    </option>

                                    <option value="Rescue Request">
                                        Rescue Request
                                    </option>

                                    <option value="Medical Emergency">
                                        Medical Emergency
                                    </option>

                                    <option value="Road Blockage">
                                        Road Blockage
                                    </option>

                                    <option value="Shelter Needed">
                                        Shelter Needed
                                    </option>

                                </select>

                            </div>


                            <div className="form-group">

                                <label>
                                    Severity
                                </label>

                                <select
                                    name="severity"
                                    value={
                                        formData.severity
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                >

                                    <option value="">
                                        Select severity
                                    </option>

                                    <option value="Low">
                                        Low
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Critical">
                                        Critical
                                    </option>

                                </select>

                            </div>

                        </div>


                        <div className="form-group incident-description-field">

                            <label>
                                Description
                            </label>

                            <div className="incident-textarea-wrapper">

                                <FileText
                                    size={18}
                                />

                                <textarea
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    rows="5"
                                    placeholder="Describe what happened, affected people, road condition, water level or any urgent assistance needed..."
                                />

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        MESSAGES
                    ================================== */}

                    {message && (

                        <div className="success-message">

                            {message}

                        </div>

                    )}


                    {error && (

                        <div className="error-message">

                            {error}

                        </div>

                    )}


                    {/* ==================================
                        SUBMIT
                    ================================== */}

                    <button
                        type="submit"
                        className="submit-button incident-submit-button"
                        disabled={
                            loading
                        }
                    >

                        <Send
                            size={18}
                        />

                        {loading
                            ? "Submitting Report..."
                            : "Submit Emergency Report"}

                    </button>

                </form>

            </div>

        </div>

    );

}


export default CreateIncident;