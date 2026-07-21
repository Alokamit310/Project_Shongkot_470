import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Map,
    AlertTriangle,
    Hospital,
    Megaphone,
    FileWarning,
    LogOut,
} from "lucide-react";
import { clearAuthData, getCurrentUser } from "../utils/auth";

function Sidebar() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const handleLogout = () => {
        clearAuthData();
        navigate("/", { replace: true });
    };

    const role = user?.role;
    const isAuthority = role === "authority" || role === "admin";

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <p className="sidebar-label">
                    {isAuthority ? "OPERATIONS MENU" : "CITIZEN MENU"}
                </p>

                <NavLink
                    to={role === "authority" ? "/authority-dashboard" : role === "admin" ? "/admin-dashboard" : "/citizen-dashboard"}
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <LayoutDashboard size={19} />
                    <span>{isAuthority ? "Operations Dashboard" : "My Dashboard"}</span>
                </NavLink>

                <NavLink
                    to="/districts"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <Map size={19} />
                    <span>District Intelligence</span>
                </NavLink>

                {isAuthority && (
                    <NavLink
                        to="/incidents"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link active" : "sidebar-link"
                        }
                    >
                        <AlertTriangle size={19} />
                        <span>Incident Review</span>
                    </NavLink>
                )}

                {!isAuthority && (
                    <NavLink
                        to="/report-incident"
                        className={({ isActive }) =>
                            isActive ? "sidebar-link report-link active" : "sidebar-link report-link"
                        }
                    >
                        <FileWarning size={19} />
                        <span>Report Incident</span>
                    </NavLink>
                )}

                <NavLink
                    to="/hospitals"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <Hospital size={19} />
                    <span>Hospitals</span>
                </NavLink>

                <NavLink
                    to="/broadcasts"
                    className={({ isActive }) =>
                        isActive ? "sidebar-link active" : "sidebar-link"
                    }
                >
                    <Megaphone size={19} />
                    <span>Broadcasts</span>
                </NavLink>
            </div>

            <div className="sidebar-bottom">
                {/* Updated logout button with onClick handler */}
                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={19} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
