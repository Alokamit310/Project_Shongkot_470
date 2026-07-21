import { useEffect, useState } from "react";

import {
    MapPin,
    CloudRain,
    Thermometer,
    Droplets,
    RefreshCw,
    AlertTriangle,
    Hospital,
    Megaphone,
    Phone,
    Bed,
    Ambulance,
    Clock,
} from "lucide-react";

import api from "../services/api";


function Districts() {

    const [districts, setDistricts] = useState([]);

    const [hospitals, setHospitals] = useState([]);

    const [incidents, setIncidents] = useState([]);

    const [broadcasts, setBroadcasts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedDistrict, setSelectedDistrict] = useState(null);


    // =====================================================
    // FETCH ALL DISTRICT INFORMATION
    // =====================================================

    const fetchAllData = async () => {

        try {

            setLoading(true);

            setError("");


            const [

                districtResponse,

                hospitalResponse,

                incidentResponse,

                broadcastResponse,

            ] = await Promise.all([

                api.get("/districts"),

                api.get("/hospitals"),

                api.get("/incidents"),

                api.get("/broadcasts"),

            ]);


            const districtList =
                districtResponse.data.data || [];

            const hospitalList =
                hospitalResponse.data.data || [];

            const incidentList =
                incidentResponse.data.data || [];

            const broadcastList =
                broadcastResponse.data.data || [];


            console.log("Districts:", districtList);

            console.log("Hospitals:", hospitalList);

            console.log("Incidents:", incidentList);

            console.log("Broadcasts:", broadcastList);


            setDistricts(districtList);

            setHospitals(hospitalList);

            setIncidents(incidentList);

            setBroadcasts(broadcastList);


            if (districtList.length > 0) {

                setSelectedDistrict(districtList[0]);

            }


        } catch (error) {

            console.error(
                "[District Dashboard] API Error:",
                error.response || error
            );


            setError(

                error.response?.data?.message ||

                "Failed to load district information."

            );


        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD DATA WHEN PAGE OPENS
    // =====================================================

    useEffect(() => {

        fetchAllData();

    }, []);


    // =====================================================
    // RISK BADGE CLASS
    // =====================================================

    const getRiskClass = (risk) => {

        if (risk === "High") return "risk-high";

        if (risk === "Medium") return "risk-medium";

        return "risk-low";

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (value) => {

        if (!value) return "Not available";

        return new Date(value).toLocaleString();

    };


    // =====================================================
    // GET HOSPITALS FOR SELECTED DISTRICT
    // =====================================================

    const selectedHospitals = selectedDistrict

        ? hospitals.filter(

            (hospital) =>

                hospital.district?.toLowerCase() ===

                selectedDistrict.name?.toLowerCase()

        )

        : [];


    // =====================================================
    // GET ACTIVE INCIDENTS FOR SELECTED DISTRICT
    // =====================================================

    const selectedIncidents = selectedDistrict

        ? incidents.filter(

            (incident) => {

                const incidentDistrict =

                    incident.district ||

                    incident.location?.district;


                return (

                    incidentDistrict?.toLowerCase() ===

                    selectedDistrict.name?.toLowerCase()

                );

            }

        )

        : [];


    // =====================================================
    // GET BROADCASTS FOR SELECTED DISTRICT
    // Includes "All Districts" broadcasts
    // =====================================================

    const selectedBroadcasts = selectedDistrict

        ? broadcasts.filter(

            (broadcast) => {

                const broadcastDistrict =

                    broadcast.district?.toLowerCase();


                return (

                    broadcastDistrict ===

                    selectedDistrict.name?.toLowerCase()

                    ||

                    broadcastDistrict ===

                    "all districts"

                );

            }

        )

        : [];


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {

        return (

            <div className="page-state">

                <p>

                    Loading district information...

                </p>

            </div>

        );

    }


    // =====================================================
    // ERROR STATE
    // =====================================================

    if (error) {

        return (

            <div className="page-state error-state">

                <p>{error}</p>


                <button

                    className="retry-button"

                    onClick={fetchAllData}

                >

                    <RefreshCw size={16} />

                    Try Again

                </button>

            </div>

        );

    }


    return (

        <div className="districts-page">


            {/* =====================================================
                PAGE HEADER
            ===================================================== */}

            <div className="page-header">

                <div>

                    <p className="page-eyebrow">

                        FLOOD INTELLIGENCE

                    </p>


                    <h1>

                        District Monitoring

                    </h1>


                    <p>

                        Monitor real-time flood risk, weather,

                        hospitals, incidents, and emergency

                        broadcasts across Bangladesh.

                    </p>

                </div>


                <button

                    className="refresh-button"

                    onClick={fetchAllData}

                >

                    <RefreshCw size={17} />

                    Refresh Data

                </button>

            </div>


            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="district-summary">

                <div>

                    <strong>

                        {districts.length}

                    </strong>

                    <span>

                        Monitored Districts

                    </span>

                </div>


                <div>

                    <strong>

                        {

                            districts.filter(

                                (district) =>

                                    district.floodRisk === "High"

                            ).length

                        }

                    </strong>

                    <span>

                        High Risk Districts

                    </span>

                </div>


                <div>

                    <strong>

                        {

                            districts.filter(

                                (district) =>

                                    district.floodRisk === "Medium"

                            ).length

                        }

                    </strong>

                    <span>

                        Medium Risk Districts

                    </span>

                </div>

            </div>


            {/* =====================================================
                DISTRICT CARDS
            ===================================================== */}

            <div className="district-grid">

                {districts.map((district) => (

                    <div

                        className={`district-card ${

                            selectedDistrict?._id ===

                            district._id

                                ? "selected"

                                : ""

                        }`}

                        key={district._id}

                        onClick={() =>

                            setSelectedDistrict(district)

                        }

                    >

                        <div className="district-card-header">

                            <div>

                                <h2>

                                    {district.name}

                                </h2>


                                <p>

                                    <MapPin size={14} />

                                    {district.division}

                                </p>

                            </div>


                            <span

                                className={`risk-badge ${getRiskClass(

                                    district.floodRisk

                                )}`}

                            >

                                {district.floodRisk}

                            </span>

                        </div>


                        <div className="district-weather">

                            <div className="weather-item">

                                <CloudRain size={18} />


                                <div>

                                    <strong>

                                        {district.rainfall ?? 0}

                                    </strong>


                                    <span>

                                        Rainfall (mm)

                                    </span>

                                </div>

                            </div>


                            <div className="weather-item">

                                <Thermometer size={18} />


                                <div>

                                    <strong>

                                        {district.temperature ?? 0}°C

                                    </strong>


                                    <span>

                                        Temperature

                                    </span>

                                </div>

                            </div>


                            <div className="weather-item">

                                <Droplets size={18} />


                                <div>

                                    <strong>

                                        {district.humidity ?? 0}%

                                    </strong>


                                    <span>

                                        Humidity

                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="district-card-footer">

                            Last updated:

                            {" "}

                            {formatDate(

                                district.lastUpdated

                            )}

                        </div>

                    </div>

                ))}

            </div>


            {/* =====================================================
                SELECTED DISTRICT DETAILS
            ===================================================== */}

            {selectedDistrict && (

                <div className="district-detail-card">


                    {/* ================= HEADER ================= */}

                    <div className="district-detail-header">

                        <div>

                            <p className="page-eyebrow">

                                DISTRICT SNAPSHOT

                            </p>


                            <h2>

                                {selectedDistrict.name}

                            </h2>


                            <p>

                                {selectedDistrict.division}

                            </p>

                        </div>


                        <span

                            className={`risk-badge ${getRiskClass(

                                selectedDistrict.floodRisk

                            )}`}

                        >

                            {selectedDistrict.floodRisk}

                        </span>

                    </div>


                    {/* =====================================================
                        INFORMATION GRID
                    ===================================================== */}

                    <div className="district-detail-grid">


                        {/* ================= WEATHER ================= */}

                        <div className="info-panel">

                            <div className="panel-header">

                                <div>

                                    <p className="page-eyebrow">

                                        WEATHER

                                    </p>


                                    <h3>

                                        Current Conditions

                                    </h3>

                                </div>


                                <CloudRain size={20} />

                            </div>


                            <div className="system-status">

                                <div>

                                    <span className="status-dot"></span>

                                    Rainfall:

                                    {" "}

                                    {selectedDistrict.rainfall ?? 0}

                                    {" "}mm

                                </div>


                                <div>

                                    <span className="status-dot"></span>

                                    Temperature:

                                    {" "}

                                    {selectedDistrict.temperature ?? 0}

                                    °C

                                </div>


                                <div>

                                    <span className="status-dot"></span>

                                    Humidity:

                                    {" "}

                                    {selectedDistrict.humidity ?? 0}

                                    %

                                </div>


                                <div>

                                    <span className="status-dot"></span>

                                    Updated:

                                    {" "}

                                    {formatDate(

                                        selectedDistrict.lastUpdated

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* ================= HOSPITALS ================= */}

                        <div className="info-panel">

                            <div className="panel-header">

                                <div>

                                    <p className="page-eyebrow">

                                        SUPPORT

                                    </p>


                                    <h3>

                                        Nearby Hospitals

                                    </h3>

                                </div>


                                <Hospital size={20} />

                            </div>


                            <div className="system-status">

                                {selectedHospitals.length === 0 ? (

                                    <div>

                                        <span className="status-dot"></span>

                                        No hospitals found for this district.

                                    </div>

                                ) : (

                                    selectedHospitals.map(

                                        (hospital) => (

                                            <div

                                                key={hospital._id}

                                                className="district-list-item"

                                            >

                                                <strong>

                                                    {hospital.name}

                                                </strong>


                                                <span>

                                                    <MapPin size={13} />

                                                    {hospital.address}

                                                </span>


                                                <span>

                                                    <Bed size={13} />

                                                    Available beds:

                                                    {" "}

                                                    {hospital.availableBeds}

                                                    /

                                                    {hospital.totalBeds}

                                                </span>


                                                <span>

                                                    <Phone size={13} />

                                                    {hospital.phone}

                                                </span>


                                                <span>

                                                    <Ambulance size={13} />

                                                    {hospital.ambulanceAvailable

                                                        ? "Ambulance Available"

                                                        : "Ambulance Unavailable"}

                                                </span>

                                            </div>

                                        )

                                    )

                                )}

                            </div>

                        </div>


                        {/* ================= INCIDENTS ================= */}

                        <div className="info-panel">

                            <div className="panel-header">

                                <div>

                                    <p className="page-eyebrow">

                                        INCIDENTS

                                    </p>


                                    <h3>

                                        Active Incidents

                                    </h3>

                                </div>


                                <AlertTriangle size={20} />

                            </div>


                            <div className="system-status">

                                {selectedIncidents.length === 0 ? (

                                    <div>

                                        <span className="status-dot"></span>

                                        No active incidents reported.

                                    </div>

                                ) : (

                                    selectedIncidents.map(

                                        (incident) => (

                                            <div

                                                key={incident._id}

                                                className="district-list-item"

                                            >

                                                <strong>

                                                    {incident.title ||

                                                        incident.type ||

                                                        "Emergency Incident"}

                                                </strong>


                                                <span>

                                                    {incident.description ||

                                                        incident.details ||

                                                        "Incident reported"}

                                                </span>


                                                <span>

                                                    <Clock size={13} />

                                                    {formatDate(

                                                        incident.createdAt

                                                    )}

                                                </span>


                                                <span>

                                                    Status:

                                                    {" "}

                                                    {incident.status ||

                                                        "Active"}

                                                </span>

                                            </div>

                                        )

                                    )

                                )}

                            </div>

                        </div>


                        {/* ================= BROADCASTS ================= */}

                        <div className="info-panel">

                            <div className="panel-header">

                                <div>

                                    <p className="page-eyebrow">

                                        BROADCASTS

                                    </p>


                                    <h3>

                                        Recent Emergency Broadcasts

                                    </h3>

                                </div>


                                <Megaphone size={20} />

                            </div>


                            <div className="system-status">

                                {selectedBroadcasts.length === 0 ? (

                                    <div>

                                        <span className="status-dot"></span>

                                        No recent broadcasts for this district.

                                    </div>

                                ) : (

                                    selectedBroadcasts.map(

                                        (broadcast) => (

                                            <div

                                                key={broadcast._id}

                                                className="district-list-item"

                                            >

                                                <strong>

                                                    {broadcast.title}

                                                </strong>


                                                <span>

                                                    {broadcast.message}

                                                </span>


                                                <span>

                                                    <Clock size={13} />

                                                    {formatDate(

                                                        broadcast.createdAt

                                                    )}

                                                </span>

                                            </div>

                                        )

                                    )

                                )}

                            </div>

                        </div>


                    </div>

                </div>

            )}

        </div>

    );

}


export default Districts;