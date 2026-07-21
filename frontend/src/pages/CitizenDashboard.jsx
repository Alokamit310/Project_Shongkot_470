import { useEffect, useState } from "react";
import { AlertTriangle, Hospital, Megaphone, Map } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getCurrentUser } from "../utils/auth";

function CitizenDashboard() {
    const [broadcasts, setBroadcasts] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = getCurrentUser();
    const district = user?.district || "Dhaka";

    useEffect(() => {
        const fetchCitizenData = async () => {
            try {
                const [broadcastResponse, incidentResponse] = await Promise.all([
                    api.get(`/broadcasts/district/${encodeURIComponent(district)}`),
                    api.get("/incidents"),
                ]);
                setBroadcasts(broadcastResponse.data.data || []);
                setIncidents(incidentResponse.data.data || []);
            } catch (error) {
                console.error("Unable to load citizen dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCitizenData();
    }, [district]);

    return (
        <div className="citizen-dashboard-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">CITIZEN OVERVIEW</p>
                    <h1>Citizen Command View</h1>
                    <p>Stay informed about local flood conditions, relevant alerts, and the progress of your submitted incident reports.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card blue">
                    <div className="stat-card-top"><div className="stat-icon"><AlertTriangle size={22} /></div><span className="stat-status">LIVE</span></div>
                    <h2>Report</h2>
                    <p>Submit incident reports</p>
                </div>
                <div className="stat-card green">
                    <div className="stat-card-top"><div className="stat-icon"><Hospital size={22} /></div><span className="stat-status">LIVE</span></div>
                    <h2>Hospitals</h2>
                    <p>Find emergency support points</p>
                </div>
                <div className="stat-card amber">
                    <div className="stat-card-top"><div className="stat-icon"><Megaphone size={22} /></div><span className="stat-status">LIVE</span></div>
                    <h2>Alerts</h2>
                    <p>See district-relevant broadcasts</p>
                </div>
                <div className="stat-card navy">
                    <div className="stat-card-top"><div className="stat-icon"><Map size={22} /></div><span className="stat-status">LIVE</span></div>
                    <h2>District</h2>
                    <p>{district}</p>
                </div>
            </div>

            <div className="citizen-grid">
                <div className="citizen-card">
                    <h3>Quick Access</h3>
                    <ul>
                        <li><Link to="/report-incident">Report an incident</Link></li>
                        <li><Link to="/hospitals">View hospitals</Link></li>
                        <li><Link to="/broadcasts">Read broadcasts</Link></li>
                        <li><Link to="/districts">Check district info</Link></li>
                    </ul>
                </div>

                <div className="citizen-card">
                    <h3>Relevant Emergency Alerts</h3>
                    {loading ? <p>Loading alerts...</p> : broadcasts.length === 0 ? <p>No district alerts currently available.</p> : <ul>{broadcasts.slice(0, 3).map((broadcast) => <li key={broadcast._id}><strong>{broadcast.title}</strong> — {broadcast.message}</li>)}</ul>}
                </div>

                <div className="citizen-card">
                    <h3>Your Submitted Incidents</h3>
                    {loading ? <p>Loading incidents...</p> : incidents.length === 0 ? <p>You have not submitted any incidents yet.</p> : <ul>{incidents.slice(0, 3).map((incident) => <li key={incident._id}><strong>{incident.incidentType}</strong> — {incident.status}</li>)}</ul>}
                </div>
            </div>
        </div>
    );
}

export default CitizenDashboard;
