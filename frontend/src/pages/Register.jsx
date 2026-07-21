import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { setAuthData, getDashboardPath } from "../utils/auth";
import {
    UserPlus,
    User,
    Mail,
    Lock,
    Phone,
    MapPin,
    Loader2,
} from "lucide-react";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "citizen",
        district: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await api.post("/auth/register", formData);

            const { token, user } = response.data;

            setAuthData(token, user);

            setSuccess("Registration successful! Redirecting...");

            setTimeout(() => {
                navigate(getDashboardPath(user?.role));
            }, 1000);

        } catch (error) {
            console.error("Registration failed:", error);

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card register-card">

                <div className="auth-icon">
                    <UserPlus size={34} />
                </div>

                <div className="auth-header">
                    <h1>Join Shongkot</h1>

                    <p>
                        Create an account to connect with your emergency
                        response community.
                    </p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Full Name</label>

                        <div className="input-with-icon">
                            <User size={18} />

                            <input
                                type="text"
                                name="fullName"
                                placeholder="Enter your full name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>

                        <div className="input-with-icon">
                            <Mail size={18} />

                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <div className="input-with-icon">
                            <Lock size={18} />

                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Phone</label>

                            <div className="input-with-icon">
                                <Phone size={18} />

                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="01XXXXXXXXX"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>District</label>

                            <div className="input-with-icon">
                                <MapPin size={18} />

                                <input
                                    type="text"
                                    name="district"
                                    placeholder="e.g. Dhaka"
                                    value={formData.district}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                    </div>

                    <div className="form-group">
                        <label>Account Type</label>

                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="citizen">
                                Citizen
                            </option>

                            <option value="authority">
                                Authority
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={18}
                                    className="spin"
                                />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                </form>

                <div className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign In
                    </Link>
                </div>

            </div>

        </div>
    );
}

export default Register;