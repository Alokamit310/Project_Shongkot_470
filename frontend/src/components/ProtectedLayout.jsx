import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { isAuthenticated } from "../utils/auth";

function ProtectedLayout() {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-body">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default ProtectedLayout;
