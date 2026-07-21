import { useEffect, useState } from "react";
import {
    Ambulance,
    Bed,
    Building2,
    Hospital,
    MapPin,
    Phone,
    RefreshCw,
} from "lucide-react";

import api from "../services/api";

function Hospitals() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/hospitals");

            setHospitals(response.data.data || []);
        } catch (error) {
            console.error("Failed to load hospitals:", error);

            setError(
                error.response?.data?.message ||
                    "Failed to load hospital data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHospitals();
    }, []);

    if (loading) {
        return (
            <div className="page-state">
                <p>Loading hospital data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-state error-state">
                <p>{error}</p>

                <button
                    className="retry-button"
                    onClick={fetchHospitals}
                >
                    <RefreshCw size={16} />
                    Try Again
                </button>
            </div>
        );
    }

    const totalAvailableBeds = hospitals.reduce(
        (total, hospital) =>
            total + (hospital.availableBeds || 0),
        0
    );

    const totalICUBeds = hospitals.reduce(
        (total, hospital) =>
            total + (hospital.icuBeds || 0),
        0
    );

    return (
        <div className="hospitals-page">

            {/* PAGE HEADER */}
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">
                        HEALTH RESPONSE
                    </p>

                    <h1>
                        Emergency Hospital Network
                    </h1>

                    <p>
                        Access emergency facilities, bed availability,
                        and critical support services across the response
                        network.
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={fetchHospitals}
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>


            {/* SUMMARY CARDS */}
            <div className="hospital-summary">

                <div>
                    <strong>
                        {hospitals.length}
                    </strong>

                    <span>
                        Total Hospitals
                    </span>
                </div>


                <div>
                    <strong>
                        {totalAvailableBeds}
                    </strong>

                    <span>
                        Available Beds
                    </span>
                </div>


                <div>
                    <strong>
                        {totalICUBeds}
                    </strong>

                    <span>
                        ICU Beds
                    </span>
                </div>

            </div>


            {/* HOSPITAL GRID */}
            <div className="hospital-grid">

                {hospitals.length === 0 ? (

                    <div className="empty-state">

                        <Building2 size={40} />

                        <h2>
                            No hospitals registered
                        </h2>

                        <p>
                            Hospital information will appear here
                            once facilities are added.
                        </p>

                    </div>

                ) : (

                    hospitals.map((hospital) => (

                        <div
                            className="hospital-card"
                            key={hospital._id}
                        >

                            {/* CARD HEADER */}
                            <div className="hospital-card-header">

                                <div className="hospital-icon">
                                    <Hospital size={24} />
                                </div>

                                <div>

                                    <h2>
                                        {hospital.name}
                                    </h2>

                                    <p>
                                        {hospital.district}
                                    </p>

                                </div>

                            </div>


                            {/* CONTACT INFORMATION */}
                            <div className="hospital-info">

                                <div>
                                    <MapPin size={16} />

                                    <span>
                                        {hospital.address ||
                                            "Address not available"}
                                    </span>
                                </div>


                                <div>
                                    <Phone size={16} />

                                    <span>
                                        {hospital.phone ||
                                            "Phone not available"}
                                    </span>
                                </div>

                            </div>


                            {/* HOSPITAL METRICS */}
                            <div className="hospital-metrics">

                                <div>
                                    <Bed size={16} />

                                    <span>
                                        {hospital.availableBeds || 0}
                                        {" / "}
                                        {hospital.totalBeds || 0}
                                        {" beds available"}
                                    </span>
                                </div>


                                <div>
                                    <Ambulance size={16} />

                                    <span>
                                        {hospital.ambulanceAvailable
                                            ? "Ambulance available"
                                            : "Ambulance unavailable"}
                                    </span>
                                </div>

                            </div>


                            {/* EMERGENCY SERVICES */}
                            <div className="hospital-services">

                                <strong>
                                    Emergency Services
                                </strong>

                                <p>
                                    {hospital.emergencyServices ||
                                        "Emergency services available"}
                                </p>

                                <p>
                                    ICU beds:{" "}
                                    {hospital.icuBeds || 0}
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default Hospitals;