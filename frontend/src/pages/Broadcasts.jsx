import { useEffect, useState } from "react";
import {
    Clock,
    Megaphone,
    MapPin,
    RefreshCw,
    Send,
    User,
} from "lucide-react";

import api from "../services/api";
import { getCurrentUser } from "../utils/auth";

function Broadcasts() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [districtsLoading, setDistrictsLoading] = useState(true);

    const [error, setError] = useState("");
    const [districtError, setDistrictError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        district: "All Districts",
        message: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState("");

    const user = getCurrentUser();

    const isAuthority =
        user?.role === "authority" ||
        user?.role === "admin";

    // =====================================================
    // FETCH BROADCASTS
    // =====================================================

    const fetchBroadcasts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/broadcasts");

            setBroadcasts(response.data.data || []);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load broadcasts."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH ALL 64 DISTRICTS
    // =====================================================

    const fetchDistricts = async () => {
        try {
            setDistrictsLoading(true);
            setDistrictError("");

            const response = await api.get("/districts");

            const districtData =
                response.data.data ||
                response.data.districts ||
                response.data ||
                [];

            setDistricts(districtData);

        } catch (error) {
            console.error("Failed to load districts:", error);

            setDistrictError(
                error.response?.data?.message ||
                "Failed to load districts."
            );
        } finally {
            setDistrictsLoading(false);
        }
    };

    // =====================================================
    // INITIAL DATA LOAD
    // =====================================================

    useEffect(() => {
        fetchBroadcasts();
        fetchDistricts();
    }, []);

    // =====================================================
    // SUBMIT BROADCAST
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            await api.post("/broadcasts", formData);

            setSuccess(
                "Emergency broadcast published successfully."
            );

            setFormData({
                title: "",
                district: "All Districts",
                message: "",
            });

            await fetchBroadcasts();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to publish broadcast."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {
        return (
            <div className="page-state">
                <p>Loading emergency broadcasts...</p>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div className="broadcasts-page">

            {/* ================= HEADER ================= */}

            <div className="page-header">

                <div>

                    <p className="page-eyebrow">
                        EMERGENCY COMMUNICATION
                    </p>

                    <h1>
                        {isAuthority
                            ? "Authority Broadcast Center"
                            : "Emergency Alerts"}
                    </h1>

                    <p>
                        {isAuthority
                            ? "Create and publish district-specific emergency alerts for citizens and responders."
                            : "View broadcasts relevant to your district and all-district alerts."}
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={() => {
                        fetchBroadcasts();

                        if (isAuthority) {
                            fetchDistricts();
                        }
                    }}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>

            </div>


            {/* ================= AUTHORITY FORM ================= */}

            {isAuthority && (

                <div className="info-panel authority-panel broadcast-form-card">

                    <div className="panel-header">

                        <div>

                            <p className="page-eyebrow">
                                AUTHORITY WORKFLOW
                            </p>

                            <h2>
                                Create Broadcast
                            </h2>

                        </div>

                        <Megaphone size={20} />

                    </div>


                    <form
                        onSubmit={handleSubmit}
                        className="broadcast-form"
                    >

                        {/* TITLE */}

                        <div className="form-group">

                            <label>
                                Title
                            </label>

                            <input
                                value={formData.title}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        title: event.target.value,
                                    })
                                }
                                placeholder="Emergency Flood Warning"
                                required
                            />

                        </div>


                        {/* DISTRICT */}

                        <div className="form-group">

                            <label>
                                District
                            </label>

                            <select
                                value={formData.district}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        district: event.target.value,
                                    })
                                }
                                required
                            >

                                {/* ALL DISTRICTS */}

                                <option value="All Districts">
                                    All Districts
                                </option>


                                {/* LOADING */}

                                {districtsLoading && (

                                    <option disabled>
                                        Loading districts...
                                    </option>

                                )}


                                {/* ERROR */}

                                {districtError && (

                                    <option disabled>
                                        Failed to load districts
                                    </option>

                                )}


                                {/* ALL 64 DISTRICTS */}

                                {!districtsLoading &&
                                    !districtError &&
                                    districts.map((district) => (

                                        <option
                                            key={district._id}
                                            value={district.name}
                                        >
                                            {district.name}
                                        </option>

                                    ))}

                            </select>

                        </div>


                        {/* MESSAGE */}

                        <div className="form-group">

                            <label>
                                Message
                            </label>

                            <textarea
                                value={formData.message}
                                onChange={(event) =>
                                    setFormData({
                                        ...formData,
                                        message: event.target.value,
                                    })
                                }
                                rows="4"
                                placeholder="Heavy rainfall expected. Avoid low-lying areas."
                                required
                            />

                        </div>


                        {/* SUCCESS */}

                        {success && (

                            <div className="success-message">
                                {success}
                            </div>

                        )}


                        {/* ERROR */}

                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* SUBMIT */}

                        <button
                            className="submit-button compact"
                            type="submit"
                            disabled={submitting}
                        >

                            <Send size={16} />

                            {submitting
                                ? "Publishing..."
                                : "Publish Broadcast"}

                        </button>

                    </form>

                </div>

            )}


            {/* ================= SUMMARY ================= */}

            <div className="broadcast-summary">

                <div>

                    <strong>
                        {broadcasts.length}
                    </strong>

                    <span>
                        Total Broadcasts
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            new Set(
                                broadcasts.map(
                                    (broadcast) =>
                                        broadcast.district
                                )
                            ).size
                        }
                    </strong>

                    <span>
                        Target Areas
                    </span>

                </div>

            </div>


            {/* ================= BROADCAST LIST ================= */}

            <div className="broadcast-list">

                {broadcasts.length === 0 ? (

                    <div className="empty-state">

                        <Megaphone size={40} />

                        <h2>
                            No emergency broadcasts
                        </h2>

                        <p>
                            Authorities will publish updates here as conditions change.
                        </p>

                    </div>

                ) : (

                    broadcasts.map((broadcast) => (

                        <div
                            className="broadcast-card"
                            key={broadcast._id}
                        >

                            <div className="broadcast-card-header">

                                <div className="broadcast-title">

                                    <div className="broadcast-icon">

                                        <Megaphone size={22} />

                                    </div>


                                    <div>

                                        <h2>
                                            {broadcast.title}
                                        </h2>


                                        <div className="broadcast-meta">

                                            <span>

                                                <MapPin size={14} />

                                                {broadcast.district}

                                            </span>


                                            <span>

                                                <Clock size={14} />

                                                {new Date(
                                                    broadcast.createdAt
                                                ).toLocaleString()}

                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            <p className="broadcast-message">

                                {broadcast.message}

                            </p>


                            {broadcast.sentBy && (

                                <div className="broadcast-sender">

                                    <User size={15} />

                                    Sent by{" "}

                                    <strong>
                                        {broadcast.sentBy.fullName}
                                    </strong>

                                </div>

                            )}

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default Broadcasts;