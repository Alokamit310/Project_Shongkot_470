import { useEffect, useState } from "react";
import {
    Activity,
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Clock3,
    Hospital,
    Map,
    ShieldCheck,
    Users,
} from "lucide-react";

import api from "../services/api";
import { getCurrentUser, getStoredToken } from "../utils/auth";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const user = getCurrentUser();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        const fetchDashboard = async () => {
            const token = getStoredToken();

            if (!token) {
                setError("No authentication token found. Please sign in again.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/authority/dashboard");
                setDashboard(response.data?.dashboard || null);
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="page-state"><p>Loading operations center...</p></div>;
    }

    if (error) {
        return <div className="page-state error-state"><p>{error}</p></div>;
    }

    const stats = [
        { label: "Monitored Districts", value: dashboard?.totalDistricts || 0, icon: <Map size={18} />, tone: "navy" },
        { label: "High Risk Districts", value: dashboard?.highRiskDistricts || 0, icon: <AlertTriangle size={18} />, tone: "danger" },
        { label: "Medium Risk Districts", value: dashboard?.mediumRiskDistricts || 0, icon: <Activity size={18} />, tone: "amber" },
        { label: "Total Incidents", value: dashboard?.totalIncidents || 0, icon: <ShieldCheck size={18} />, tone: "blue" },
        { label: "Pending Incidents", value: dashboard?.pendingIncidents || 0, icon: <Clock3 size={18} />, tone: "amber" },
        { label: "In Progress", value: dashboard?.inProgressIncidents || 0, icon: <AlertTriangle size={18} />, tone: "danger" },
        { label: "Resolved", value: dashboard?.resolvedIncidents || 0, icon: <CheckCircle2 size={18} />, tone: "green" },
        { label: "Hospitals", value: dashboard?.totalHospitals || 0, icon: <Hospital size={18} />, tone: "teal" },
        { label: "Available Beds", value: dashboard?.totalAvailableBeds || 0, icon: <Hospital size={18} />, tone: "teal" },
    ];

    return (
        <div className="ops-dashboard-page">
            <div className="page-header ops-header">
                <div>
                    <p className="page-eyebrow">EMERGENCY OPERATIONS CENTER</p>
                    <h1>{isAdmin ? "Admin Command Center" : "Authority Dashboard"}</h1>
                    <p>Coordinate flood response, incident triage, hospital readiness, and public alerts from a single professional operations workspace.</p>
                </div>
                <div className="ops-status-pill"><span className="status-dot"></span>Live System Status</div>
            </div>

            <div className="stats-grid ops-grid">
                {stats.map((stat) => (
                    <div className={`stat-card ${stat.tone}`} key={stat.label}>
                        <div className="stat-card-top">
                            <div className="stat-icon">{stat.icon}</div>
                            <span className="stat-status">LIVE</span>
                        </div>
                        <h2>{stat.value}</h2>
                        <p>{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="dashboard-info-grid">
                <div className="info-panel authority-panel">
                    <div className="panel-header">
                        <div>
                            <p className="page-eyebrow">FLOOD MONITORING</p>
                            <h2>Flood Risk Distribution</h2>
                        </div>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="risk-chart">
                        <div className="risk-row"><span>High</span><div className="risk-bar high" style={{ width: `${Math.max(12, (dashboard?.highRiskDistricts || 0) / Math.max(1, dashboard?.totalDistricts || 1) * 100)}%` }}></div><strong>{dashboard?.highRiskDistricts || 0}</strong></div>
                        <div className="risk-row"><span>Medium</span><div className="risk-bar medium" style={{ width: `${Math.max(12, (dashboard?.mediumRiskDistricts || 0) / Math.max(1, dashboard?.totalDistricts || 1) * 100)}%` }}></div><strong>{dashboard?.mediumRiskDistricts || 0}</strong></div>
                        <div className="risk-row"><span>Low</span><div className="risk-bar low" style={{ width: `${Math.max(12, Math.max(0, (dashboard?.totalDistricts || 0) - (dashboard?.highRiskDistricts || 0) - (dashboard?.mediumRiskDistricts || 0)) / Math.max(1, dashboard?.totalDistricts || 1) * 100)}%` }}></div><strong>{Math.max(0, (dashboard?.totalDistricts || 0) - (dashboard?.highRiskDistricts || 0) - (dashboard?.mediumRiskDistricts || 0))}</strong></div>
                    </div>
                </div>

                <div className="info-panel authority-panel">
                    <div className="panel-header">
                        <div>
                            <p className="page-eyebrow">INCIDENT STATUS</p>
                            <h2>Incident Status Summary</h2>
                        </div>
                        <ShieldCheck size={20} />
                    </div>
                    <div className="status-summary">
                        <div><strong>{dashboard?.pendingIncidents || 0}</strong><span>Open</span></div>
                        <div><strong>{dashboard?.inProgressIncidents || 0}</strong><span>In Progress</span></div>
                        <div><strong>{dashboard?.resolvedIncidents || 0}</strong><span>Resolved</span></div>
                    </div>
                </div>
            </div>

            <div className="dashboard-info-grid lower-grid">
                <div className="info-panel authority-panel">
                    <div className="panel-header">
                        <div>
                            <p className="page-eyebrow">ACTIVE INCIDENTS</p>
                            <h2>Latest Incident Activity</h2>
                        </div>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="activity-list">
                        {(dashboard?.recentIncidents || []).length === 0 ? <p className="muted">No incidents recorded yet.</p> : dashboard.recentIncidents.map((incident) => (
                            <div className="activity-row" key={incident._id}>
                                <div>
                                    <strong>{incident.incidentType}</strong>
                                    <p>{incident.location}, {incident.district}</p>
                                </div>
                                <span className={`status-pill ${incident.status === "Resolved" ? "resolved" : incident.status === "In Progress" ? "progress" : "open"}`}>{incident.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="info-panel authority-panel">
                    <div className="panel-header">
                        <div>
                            <p className="page-eyebrow">EMERGENCY ALERTS</p>
                            <h2>Recent Broadcasts</h2>
                        </div>
                        <BellRing size={20} />
                    </div>
                    <div className="activity-list">
                        {(dashboard?.recentBroadcasts || []).length === 0 ? <p className="muted">No broadcasts published yet.</p> : dashboard.recentBroadcasts.map((broadcast) => (
                            <div className="activity-row" key={broadcast._id}>
                                <div>
                                    <strong>{broadcast.title}</strong>
                                    <p>{broadcast.message}</p>
                                </div>
                                <span className="broadcast-pill">{broadcast.district || "All Districts"}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;