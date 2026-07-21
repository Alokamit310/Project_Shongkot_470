import { useEffect, useState } from "react";
import {
    AlertTriangle,
    Clock,
    Filter,
    MapPin,
    RefreshCw,
    Send,
} from "lucide-react";

import api from "../services/api";
import { getCurrentUser } from "../utils/auth";

function Incidents() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState({ status: "", district: "", type: "" });
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [comment, setComment] = useState("");
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState("");
    const user = getCurrentUser();
    const isAuthority = user?.role === "authority" || user?.role === "admin";

    const fetchIncidents = async () => {
        try {
            setLoading(true);
            setError("");
            const params = new URLSearchParams();
            if (filters.status) params.set("status", filters.status);
            if (filters.district) params.set("district", filters.district);
            if (filters.type) params.set("type", filters.type);
            const response = await api.get(`/incidents${params.toString() ? `?${params.toString()}` : ""}`);
            setIncidents(response.data.data || []);
        } catch (error) {
            setError(error.response?.data?.message || "Failed to load incidents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleFilterChange = (event) => {
        const nextFilters = { ...filters, [event.target.name]: event.target.value };
        setFilters(nextFilters);
        const params = new URLSearchParams();
        if (nextFilters.status) params.set("status", nextFilters.status);
        if (nextFilters.district) params.set("district", nextFilters.district);
        if (nextFilters.type) params.set("type", nextFilters.type);
        api.get(`/incidents${params.toString() ? `?${params.toString()}` : ""}`).then((response) => {
            setIncidents(response.data.data || []);
        });
    };

    const updateStatus = async (incidentId) => {
        if (!isAuthority) return;
        try {
            setUpdating(true);
            setMessage("");
            const response = await api.patch(`/incidents/${incidentId}/status`, {
                status: selectedIncident?.status,
                authorityComment: comment,
            });
            setMessage(response.data.message || "Incident updated successfully.");
            setComment("");
            setSelectedIncident(null);
            fetchIncidents();
        } catch (error) {
            setError(error.response?.data?.message || "Unable to update incident.");
        } finally {
            setUpdating(false);
        }
    };

    const getSeverityClass = (severity) => {
        if (severity === "High" || severity === "Critical") return "severity-high";
        if (severity === "Medium") return "severity-medium";
        return "severity-low";
    };

    const getStatusClass = (status) => {
        if (status === "Resolved") return "status-resolved";
        if (status === "In Progress") return "status-progress";
        return "status-pending";
    };

    if (loading) {
        return <div className="page-state"><p>Loading incident reports...</p></div>;
    }

    if (error) {
        return <div className="page-state error-state"><p>{error}</p><button className="retry-button" onClick={fetchIncidents}><RefreshCw size={16} />Try Again</button></div>;
    }

    return (
        <div className="incidents-page">
            <div className="page-header">
                <div>
                    <p className="page-eyebrow">EMERGENCY RESPONSE</p>
                    <h1>Incident Management</h1>
                    <p>Track citizen reports, update incident progress, and add authority response notes.</p>
                </div>
                <button className="refresh-button" onClick={fetchIncidents}><RefreshCw size={17} />Refresh</button>
            </div>

            <div className="incident-summary">
                <div><strong>{incidents.length}</strong><span>Total Incidents</span></div>
                <div><strong>{incidents.filter((incident) => incident.status === "Open").length}</strong><span>Open</span></div>
                <div><strong>{incidents.filter((incident) => incident.status === "In Progress").length}</strong><span>In Progress</span></div>
                <div><strong>{incidents.filter((incident) => incident.status === "Resolved").length}</strong><span>Resolved</span></div>
            </div>

            <div className="incident-filters">
                <div className="filter-group"><Filter size={16} /><select name="status" value={filters.status} onChange={handleFilterChange}><option value="">All Status</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select></div>
                <div className="filter-group"><MapPin size={16} /><input name="district" value={filters.district} onChange={handleFilterChange} placeholder="Filter district" /></div>
                <div className="filter-group"><AlertTriangle size={16} /><input name="type" value={filters.type} onChange={handleFilterChange} placeholder="Filter type" /></div>
            </div>

            <div className="incident-list">
                {incidents.length === 0 ? <div className="empty-state"><AlertTriangle size={40} /><h2>No incidents found</h2><p>Try broadening your filters or wait for new reports.</p></div> : incidents.map((incident) => (
                    <div className="incident-card" key={incident._id}>
                        <div className="incident-card-header">
                            <div className="incident-title">
                                <AlertTriangle size={22} />
                                <div>
                                    <h2>{incident.incidentType}</h2>
                                    <p>Reported by {incident.reporterName}</p>
                                </div>
                            </div>
                            <span className={`severity-badge ${getSeverityClass(incident.severity)}`}>{incident.severity}</span>
                        </div>

                        <div className="incident-details">
                            <div><MapPin size={16} /><span>{incident.location}, {incident.district}</span></div>
                            <div><Clock size={16} /><span>{new Date(incident.createdAt).toLocaleString()}</span></div>
                        </div>

                        <p className="incident-description">{incident.description}</p>

                        <div className="incident-card-footer">
                            <span className={`status-badge ${getStatusClass(incident.status)}`}>{incident.status}</span>
                            {incident.authorityComment && <p className="authority-note">Authority: {incident.authorityComment}</p>}
                        </div>

                        {isAuthority && (
                            <div className="comment-panel">
                                <label>Update Status</label>
                                <select value={selectedIncident?._id === incident._id ? selectedIncident.status : incident.status} onChange={(event) => setSelectedIncident({ ...incident, status: event.target.value })}>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                                <label>Authority Comment</label>
                                <textarea value={selectedIncident?._id === incident._id ? comment : ""} onChange={(event) => { setComment(event.target.value); setSelectedIncident((current) => current?._id === incident._id ? { ...current, status: current.status } : current); }} placeholder="Add operational response note..." rows="3" />
                                <button className="submit-button compact" onClick={() => { setSelectedIncident(incident); setComment(incident.authorityComment || ""); }}><Send size={16} />Prepare Update</button>
                                {selectedIncident?._id === incident._id && <button className="submit-button compact secondary" onClick={() => updateStatus(incident._id)} disabled={updating}>{updating ? "Updating..." : "Save Update"}</button>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Incidents;