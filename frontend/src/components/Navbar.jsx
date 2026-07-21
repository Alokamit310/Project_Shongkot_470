import { Link } from "react-router-dom";
import { Shield, Bell, User } from "lucide-react";
import { getCurrentUser } from "../utils/auth";

function Navbar() {
    const user = getCurrentUser();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <div className="brand-icon">
                    <Shield size={22} />
                </div>

                <div>
                    <h2>SHONGKOT</h2>
                    <span>Flood Intelligence Platform</span>
                </div>
            </Link>

            <div className="navbar-actions">
                <button className="icon-button">
                    <Bell size={20} />
                </button>

                <div className="user-profile">
                    <div className="user-avatar">
                        <User size={18} />
                    </div>

                    <div className="user-info">
                        <strong>{user?.fullName || "Guest User"}</strong>
                        <span>{user?.role || "Citizen"}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;