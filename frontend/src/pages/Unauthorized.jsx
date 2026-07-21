import { Link } from "react-router-dom";

function Unauthorized() {
    return (
        <div className="page-state error-state">
            <h2>Access denied</h2>
            <p>You do not have permission to view this page.</p>
            <Link to="/" className="submit-button" style={{ display: "inline-block", textDecoration: "none" }}>
                Return home
            </Link>
        </div>
    );
}

export default Unauthorized;
