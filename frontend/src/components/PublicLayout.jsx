import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

function PublicLayout({ children }) {
    return (
        <div className="public-layout">
            <nav className="public-navbar">
                <Link to="/" className="public-brand">
                    <div className="brand-icon">
                        <Shield size={22} />
                    </div>
                    <div>
                        <h2>SHONGKOT</h2>
                        <span>Flood Intelligence Platform</span>
                    </div>
                </Link>

                <div className="public-nav-actions">
                    <Link to="/login" className="public-link">
                        Sign In
                    </Link>
                    <Link to="/register" className="public-link primary">
                        Create Account
                    </Link>
                </div>
            </nav>

            <main className="public-main">{children}</main>
        </div>
    );
}

export default PublicLayout;
