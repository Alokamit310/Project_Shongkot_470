import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AlertTriangle,
    Clock,
    Filter,
    MapPin,
    RefreshCw,
    Send,
} from "lucide-react";

import {
    CircleMarker,
    MapContainer,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import api from "../services/api";
import {
    getCurrentUser,
} from "../utils/auth";


// =====================================================
// DISTRICT NAME NORMALIZER
// Old data aliases are handled here
// =====================================================

const normalizeDistrictName = (name = "") => {

    const cleaned =
        name
            .trim()
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/\s+/g, " ");

    const aliases = {
        "bbaria": "brahmanbaria",
        "brahman baria": "brahmanbaria",
        "ctg": "chattogram",
        "chittagong": "chattogram",
        "cox bazar": "coxs bazar",
        "cox's bazar": "coxs bazar",
        "moulvibazar": "moulvibazar",
    };

    return aliases[cleaned] || cleaned;

};


// =====================================================
// GET INCIDENT COORDINATES
// Exact GPS first, district fallback second
// =====================================================

const getIncidentCoordinates = (
    incident,
    districtMap
) => {

    const exactLat =
        Number(
            incident.latitude
        );

    const exactLng =
        Number(
            incident.longitude
        );


    // Exact incident GPS
    if (
        Number.isFinite(exactLat) &&
        Number.isFinite(exactLng)
    ) {

        return {
            lat: exactLat,
            lng: exactLng,
            source: "exact",
        };

    }


    // Old incident fallback
    const districtKey =
        normalizeDistrictName(
            incident.district
        );

    const district =
        districtMap.get(
            districtKey
        );

    if (!district) {
        return null;
    }


    const districtLat =
        Number(
            district.lat
        );

    const districtLng =
        Number(
            district.long
        );


    if (
        !Number.isFinite(
            districtLat
        ) ||
        !Number.isFinite(
            districtLng
        )
    ) {

        return null;

    }


    return {
        lat: districtLat,
        lng: districtLng,
        source: "district",
    };

};


// =====================================================
// MAP FOCUS
// =====================================================

function IncidentMapFocus({
    incident,
    districtMap,
}) {

    const map =
        useMap();


    useEffect(() => {

        if (!incident) {
            return;
        }


        const coordinates =
            getIncidentCoordinates(
                incident,
                districtMap
            );


        if (!coordinates) {
            return;
        }


        map.flyTo(
            [
                coordinates.lat,
                coordinates.lng,
            ],
            coordinates.source ===
                "exact"
                ? 14
                : 10,
            {
                duration: 1.2,
            }
        );

    }, [
        incident,
        districtMap,
        map,
    ]);


    return null;

}


// =====================================================
// MAIN COMPONENT
// =====================================================

function Incidents() {

    const [
        incidents,
        setIncidents,
    ] = useState([]);

    const [
        districts,
        setDistricts,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        filters,
        setFilters,
    ] = useState({
        status: "",
        district: "",
        type: "",
    });

    const [
        selectedIncident,
        setSelectedIncident,
    ] = useState(null);

    const [
        focusedIncident,
        setFocusedIncident,
    ] = useState(null);

    const [
        comment,
        setComment,
    ] = useState("");

    const [
        updating,
        setUpdating,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState("");


    // =================================================
    // AUTH
    // =================================================

    const user =
        getCurrentUser();

    const isAuthority =
        user?.role ===
            "authority" ||
        user?.role ===
            "admin";


    // =================================================
    // FETCH DISTRICTS
    // =================================================

    const fetchDistricts =
        async () => {

            try {

                const response =
                    await api.get(
                        "/districts"
                    );


                const districtData =
                    response.data?.data ||
                    response.data?.districts ||
                    [];


                setDistricts(
                    districtData
                );


            } catch (err) {

                console.error(
                    "District fetch failed:",
                    err
                );

            }

        };


    // =================================================
    // FETCH INCIDENTS
    // =================================================

    const fetchIncidents =
        async (
            customFilters =
                filters
        ) => {

            try {

                setLoading(true);

                setError("");


                const params =
                    new URLSearchParams();


                if (
                    customFilters.status
                ) {

                    params.set(
                        "status",
                        customFilters.status
                    );

                }


                if (
                    customFilters.district
                ) {

                    params.set(
                        "district",
                        customFilters.district
                    );

                }


                if (
                    customFilters.type
                ) {

                    params.set(
                        "type",
                        customFilters.type
                    );

                }


                const query =
                    params.toString();


                const response =
                    await api.get(
                        `/incidents${
                            query
                                ? `?${query}`
                                : ""
                        }`
                    );


                setIncidents(
                    response.data?.data ||
                    []
                );


            } catch (err) {

                setError(
                    err.response?.data
                        ?.message ||
                        "Failed to load incidents."
                );


            } finally {

                setLoading(false);

            }

        };


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        const loadPage =
            async () => {

                await Promise.all([
                    fetchIncidents({
                        status: "",
                        district: "",
                        type: "",
                    }),

                    fetchDistricts(),
                ]);

            };


        loadPage();

    }, []);


    // =================================================
    // DISTRICT MAP LOOKUP
    // =================================================

    const districtMap =
        useMemo(() => {

            const map =
                new Map();


            districts.forEach(
                (district) => {

                    const name =
                        district.name ||
                        district.district;


                    if (!name) {
                        return;
                    }


                    map.set(
                        normalizeDistrictName(
                            name
                        ),
                        district
                    );

                }
            );


            return map;

        }, [districts]);


    // =================================================
    // FILTER CHANGE
    // =================================================

    const handleFilterChange =
        async (event) => {

            const nextFilters = {
                ...filters,

                [event.target.name]:
                    event.target.value,
            };


            setFilters(
                nextFilters
            );

            setFocusedIncident(
                null
            );


            await fetchIncidents(
                nextFilters
            );

        };


    // =================================================
    // PREPARE AUTHORITY UPDATE
    // =================================================

    const prepareUpdate =
        (incident) => {

            setSelectedIncident({
                ...incident,
            });

            setComment(
                incident.authorityComment ||
                ""
            );

            setMessage("");

            setError("");

        };


    // =================================================
    // UPDATE INCIDENT STATUS
    // =================================================

    const updateStatus =
        async (incidentId) => {

            if (
                !isAuthority ||
                !selectedIncident
            ) {
                return;
            }


            try {

                setUpdating(
                    true
                );

                setMessage("");

                setError("");


                const response =
                    await api.patch(
                        `/incidents/${incidentId}/status`,
                        {
                            status:
                                selectedIncident.status,

                            authorityComment:
                                comment,
                        }
                    );


                setMessage(
                    response.data
                        ?.message ||
                        "Incident updated successfully."
                );


                setComment("");

                setSelectedIncident(
                    null
                );


                await fetchIncidents();


            } catch (err) {

                setError(
                    err.response?.data
                        ?.message ||
                        "Unable to update incident."
                );


            } finally {

                setUpdating(
                    false
                );

            }

        };


    // =================================================
    // FOCUS INCIDENT
    // =================================================

    const focusIncident =
        (incident) => {

            setFocusedIncident(
                incident
            );

        };


    // =================================================
    // SEVERITY STYLE
    // =================================================

    const getSeverityClass =
        (severity) => {

            if (
                severity === "High" ||
                severity === "Critical"
            ) {
                return "severity-high";
            }

            if (
                severity === "Medium"
            ) {
                return "severity-medium";
            }

            return "severity-low";

        };


    const getSeverityColor =
        (severity) => {

            if (
                severity ===
                "Critical"
            ) {
                return "#991b1b";
            }

            if (
                severity ===
                "High"
            ) {
                return "#dc2626";
            }

            if (
                severity ===
                "Medium"
            ) {
                return "#f59e0b";
            }

            return "#16a34a";

        };


    // =================================================
    // STATUS STYLE
    // =================================================

    const getStatusClass =
        (status) => {

            if (
                status ===
                "Resolved"
            ) {
                return "status-resolved";
            }

            if (
                status ===
                "In Progress"
            ) {
                return "status-progress";
            }

            return "status-pending";

        };


    // =================================================
    // MAPPABLE INCIDENTS
    // =================================================

    const mappableIncidents =
        incidents
            .map(
                (incident) => {

                    const coordinates =
                        getIncidentCoordinates(
                            incident,
                            districtMap
                        );


                    if (!coordinates) {
                        return null;
                    }


                    return {
                        ...incident,
                        mapCoordinates:
                            coordinates,
                    };

                }
            )
            .filter(Boolean);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div className="page-state">

                <p>
                    Loading incident reports...
                </p>

            </div>

        );

    }


    // =================================================
    // MAIN ERROR
    // =================================================

    if (
        error &&
        incidents.length === 0
    ) {

        return (

            <div className="page-state error-state">

                <p>
                    {error}
                </p>


                <button
                    className="retry-button"
                    onClick={() =>
                        fetchIncidents()
                    }
                >

                    <RefreshCw
                        size={16}
                    />

                    Try Again

                </button>

            </div>

        );

    }


    // =================================================
    // PAGE
    // =================================================

    return (

        <div className="incidents-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="page-header">

                <div>

                    <p className="page-eyebrow">
                        EMERGENCY RESPONSE
                    </p>

                    <h1>
                        Incident Management
                    </h1>

                    <p>
                        Track citizen reports,
                        monitor incident locations,
                        update response progress,
                        and review authority notes.
                    </p>

                </div>


                <button
                    className="refresh-button"
                    onClick={() =>
                        fetchIncidents()
                    }
                >

                    <RefreshCw
                        size={17}
                    />

                    Refresh

                </button>

            </div>


            {/* ==========================================
                MESSAGES
            ========================================== */}

            {message && (

                <div className="hospital-message success">

                    {message}

                </div>

            )}


            {error && (

                <div className="hospital-message warning">

                    {error}

                </div>

            )}


            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="incident-summary">

                <div>

                    <strong>
                        {incidents.length}
                    </strong>

                    <span>
                        Total Incidents
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            incidents.filter(
                                (incident) =>
                                    incident.status ===
                                    "Open"
                            ).length
                        }
                    </strong>

                    <span>
                        Open
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            incidents.filter(
                                (incident) =>
                                    incident.status ===
                                    "In Progress"
                            ).length
                        }
                    </strong>

                    <span>
                        In Progress
                    </span>

                </div>


                <div>

                    <strong>
                        {
                            incidents.filter(
                                (incident) =>
                                    incident.status ===
                                    "Resolved"
                            ).length
                        }
                    </strong>

                    <span>
                        Resolved
                    </span>

                </div>

            </div>


            {/* ==========================================
                FILTERS
            ========================================== */}

            <div className="incident-filters">

                <div className="filter-group">

                    <Filter
                        size={16}
                    />

                    <select
                        name="status"
                        value={
                            filters.status
                        }
                        onChange={
                            handleFilterChange
                        }
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="Open">
                            Open
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Resolved">
                            Resolved
                        </option>

                    </select>

                </div>


                <div className="filter-group">

                    <MapPin
                        size={16}
                    />

                    <input
                        name="district"
                        value={
                            filters.district
                        }
                        onChange={
                            handleFilterChange
                        }
                        placeholder="Filter district"
                    />

                </div>


                <div className="filter-group">

                    <AlertTriangle
                        size={16}
                    />

                    <input
                        name="type"
                        value={
                            filters.type
                        }
                        onChange={
                            handleFilterChange
                        }
                        placeholder="Filter type"
                    />

                </div>

            </div>


            {/* ==========================================
                INCIDENT MAP
            ========================================== */}

            <section className="hospital-map-section">

                <div className="hospital-map-header">

                    <div>

                        <p className="section-eyebrow">
                            Incident Map Layer
                        </p>

                        <h2>
                            Reported Incidents
                        </h2>

                        <p>
                            New reports use exact
                            GPS coordinates when
                            available. Older reports
                            use district-level
                            locations as fallback.
                        </p>

                    </div>

                </div>


                {mappableIncidents.length ===
                0 ? (

                    <div className="hospital-message">

                        No incident locations
                        available for the current
                        filter.

                    </div>

                ) : (

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


                            <IncidentMapFocus
                                incident={
                                    focusedIncident
                                }
                                districtMap={
                                    districtMap
                                }
                            />


                            {mappableIncidents.map(
                                (incident) => {

                                    const {
                                        lat,
                                        lng,
                                        source,
                                    } =
                                        incident.mapCoordinates;


                                    return (

                                        <CircleMarker
                                            key={
                                                incident._id
                                            }
                                            center={[
                                                lat,
                                                lng,
                                            ]}
                                            radius={
                                                focusedIncident?._id ===
                                                incident._id
                                                    ? 14
                                                    : source ===
                                                      "exact"
                                                    ? 10
                                                    : 8
                                            }
                                            pathOptions={{
                                                color:
                                                    getSeverityColor(
                                                        incident.severity
                                                    ),

                                                fillColor:
                                                    getSeverityColor(
                                                        incident.severity
                                                    ),

                                                fillOpacity:
                                                    source ===
                                                    "exact"
                                                        ? 0.8
                                                        : 0.55,

                                                weight:
                                                    focusedIncident?._id ===
                                                    incident._id
                                                        ? 4
                                                        : 2,
                                            }}
                                            eventHandlers={{
                                                click: () =>
                                                    focusIncident(
                                                        incident
                                                    ),
                                            }}
                                        >

                                            <Popup>

                                                <div className="hospital-map-popup">

                                                    <strong>
                                                        {
                                                            incident.incidentType
                                                        }
                                                    </strong>


                                                    <span>
                                                        District:{" "}
                                                        {
                                                            incident.district
                                                        }
                                                    </span>


                                                    <span>
                                                        Location:{" "}
                                                        {
                                                            incident.location
                                                        }
                                                    </span>


                                                    <span>
                                                        Severity:{" "}
                                                        {
                                                            incident.severity
                                                        }
                                                    </span>


                                                    <span>
                                                        Status:{" "}
                                                        {
                                                            incident.status
                                                        }
                                                    </span>


                                                    <span>
                                                        Reporter:{" "}
                                                        {
                                                            incident.reporterName
                                                        }
                                                    </span>


                                                    <span>
                                                        Map Source:{" "}
                                                        {source ===
                                                        "exact"
                                                            ? "Exact GPS location"
                                                            : "District location fallback"}
                                                    </span>

                                                </div>

                                            </Popup>

                                        </CircleMarker>

                                    );

                                }
                            )}

                        </MapContainer>

                    </div>

                )}

            </section>


            {/* ==========================================
                INCIDENT LIST
            ========================================== */}

            <div className="incident-list">

                {incidents.length ===
                0 ? (

                    <div className="empty-state">

                        <AlertTriangle
                            size={40}
                        />

                        <h2>
                            No incidents found
                        </h2>

                        <p>
                            Try broadening your
                            filters or wait for
                            new reports.
                        </p>

                    </div>

                ) : (

                    incidents.map(
                        (incident) => {

                            const isBeingEdited =
                                selectedIncident?._id ===
                                incident._id;


                            return (

                                <div
                                    className="incident-card"
                                    key={
                                        incident._id
                                    }
                                    onClick={() =>
                                        focusIncident(
                                            incident
                                        )
                                    }
                                >

                                    <div className="incident-card-header">

                                        <div className="incident-title">

                                            <AlertTriangle
                                                size={22}
                                            />

                                            <div>

                                                <h2>
                                                    {
                                                        incident.incidentType
                                                    }
                                                </h2>

                                                <p>
                                                    Reported by{" "}
                                                    {
                                                        incident.reporterName
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        <span
                                            className={`severity-badge ${getSeverityClass(
                                                incident.severity
                                            )}`}
                                        >
                                            {
                                                incident.severity
                                            }
                                        </span>

                                    </div>


                                    <div className="incident-details">

                                        <div>

                                            <MapPin
                                                size={16}
                                            />

                                            <span>
                                                {
                                                    incident.location
                                                }
                                                ,{" "}
                                                {
                                                    incident.district
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <Clock
                                                size={16}
                                            />

                                            <span>
                                                {
                                                    new Date(
                                                        incident.createdAt
                                                    ).toLocaleString()
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    <p className="incident-description">

                                        {
                                            incident.description
                                        }

                                    </p>


                                    <div className="incident-card-footer">

                                        <span
                                            className={`status-badge ${getStatusClass(
                                                incident.status
                                            )}`}
                                        >
                                            {
                                                incident.status
                                            }
                                        </span>


                                        {incident.authorityComment && (

                                            <p className="authority-note">

                                                Authority:{" "}
                                                {
                                                    incident.authorityComment
                                                }

                                            </p>

                                        )}

                                    </div>


                                    {/* AUTHORITY CONTROLS */}

                                    {isAuthority && (

                                        <div
                                            className="comment-panel"
                                            onClick={(
                                                event
                                            ) =>
                                                event.stopPropagation()
                                            }
                                        >

                                            {!isBeingEdited ? (

                                                <button
                                                    className="submit-button compact"
                                                    onClick={() =>
                                                        prepareUpdate(
                                                            incident
                                                        )
                                                    }
                                                >

                                                    <Send
                                                        size={16}
                                                    />

                                                    Update Incident

                                                </button>

                                            ) : (

                                                <>

                                                    <label>
                                                        Update Status
                                                    </label>


                                                    <select
                                                        value={
                                                            selectedIncident.status
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setSelectedIncident(
                                                                (
                                                                    previous
                                                                ) => ({
                                                                    ...previous,

                                                                    status:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                    >

                                                        <option value="Open">
                                                            Open
                                                        </option>

                                                        <option value="In Progress">
                                                            In Progress
                                                        </option>

                                                        <option value="Resolved">
                                                            Resolved
                                                        </option>

                                                    </select>


                                                    <label>
                                                        Authority Comment
                                                    </label>


                                                    <textarea
                                                        value={
                                                            comment
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setComment(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        placeholder="Add operational response note..."
                                                        rows="3"
                                                    />


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

                                                        <button
                                                            className="submit-button compact"
                                                            onClick={() =>
                                                                updateStatus(
                                                                    incident._id
                                                                )
                                                            }
                                                            disabled={
                                                                updating
                                                            }
                                                        >

                                                            {updating
                                                                ? "Updating..."
                                                                : "Save Update"}

                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="submit-button compact secondary"
                                                            onClick={() => {

                                                                setSelectedIncident(
                                                                    null
                                                                );

                                                                setComment(
                                                                    ""
                                                                );

                                                            }}
                                                        >

                                                            Cancel

                                                        </button>

                                                    </div>

                                                </>

                                            )}

                                        </div>

                                    )}

                                </div>

                            );

                        }
                    )

                )}

            </div>

        </div>

    );

}


export default Incidents;