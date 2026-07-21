import { useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import api from "../services/api";

function CreateIncident() {
    const [formData, setFormData] = useState({
        reporterName: "",
        phone: "",
        district: "",
        location: "",
        incidentType: "",
        description: "",
        severity: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setMessage("");
            setError("");

            const response = await api.post(
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
            });

        } catch (error) {
            console.error(
                "[CreateIncident] API error:",
                error.response || error
            );

            setError(
                error.response?.data?.message ||
                "Failed to submit incident report."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-incident-page">

            <div className="page-header">
                <div>
                    <p className="page-eyebrow">
                        CITIZEN EMERGENCY REPORTING
                    </p>

                    <h1>Report an Incident</h1>

                    <p>
                        Submit an emergency report to help
                        authorities respond quickly.
                    </p>
                </div>
            </div>

            <div className="incident-form-card">

                <div className="form-icon">
                    <AlertTriangle size={28} />
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>
                                Your Name
                            </label>

                            <input
                                type="text"
                                name="reporterName"
                                value={
                                    formData.reporterName
                                }
                                onChange={handleChange}
                                required
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Phone Number
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value={
                                    formData.phone
                                }
                                onChange={handleChange}
                                required
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                District
                            </label>

                            <input
                                type="text"
                                name="district"
                                value={
                                    formData.district
                                }
                                onChange={handleChange}
                                required
                                placeholder="e.g. Dhaka"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Location
                            </label>

                            <input
                                type="text"
                                name="location"
                                value={
                                    formData.location
                                }
                                onChange={handleChange}
                                required
                                placeholder="e.g. Mirpur"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                Incident Type
                            </label>

                            <select
                                name="incidentType"
                                value={
                                    formData.incidentType
                                }
                                onChange={handleChange}
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
                                onChange={handleChange}
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
                            </select>
                        </div>

                    </div>

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={handleChange}
                            required
                            rows="5"
                            placeholder="Describe the emergency situation..."
                        />

                    </div>

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

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        <Send size={17} />

                        {loading
                            ? "Submitting..."
                            : "Submit Incident Report"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateIncident;