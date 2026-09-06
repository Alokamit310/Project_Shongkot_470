import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Link,
} from "react-router-dom";

import {
    ArrowRight,
    Activity,
    ShieldCheck,
    Radio,
    Waves,
    MapPinned,
    Siren,
} from "lucide-react";

import Profile from "./pages/Profile";
import PublicLayout from "./components/PublicLayout";
import ProtectedLayout from "./components/ProtectedLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import Incidents from "./pages/Incidents";
import Districts from "./pages/Districts";
import Hospitals from "./pages/Hospitals";
import Broadcasts from "./pages/Broadcasts";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateIncident from "./pages/CreateIncident";
import Unauthorized from "./pages/Unauthorized";


function LandingPage() {

    return (

        <div className="landing-page">


            <div className="landing-grid"></div>

            <div className="landing-glow landing-glow-one"></div>
            <div className="landing-glow landing-glow-two"></div>

            <div className="landing-orb orb-one"></div>
            <div className="landing-orb orb-two"></div>
            <div className="landing-orb orb-three"></div>


            <div className="landing-status">

                <span className="status-pulse"></span>

                <span>
                    LIVE EMERGENCY INTELLIGENCE NETWORK
                </span>

            </div>


            <div className="landing-inner">


                <div className="landing-main">


                    <div className="landing-badge">

                        <Waves size={16} />

                        BANGLADESH FLOOD CRISIS INTELLIGENCE

                    </div>


                    <h1 className="landing-title">

                        When Crisis Strikes,

                        <br />

                        <span>
                            Intelligence Responds.
                        </span>

                    </h1>


                    <p className="landing-description">

                        Shongkot connects real-time weather intelligence,
                        citizens, authorities, hospitals, and emergency
                        responders into one unified crisis-response network.

                    </p>


                    <div className="landing-actions">


                        <Link
                            to="/login"
                            className="landing-button landing-primary"
                        >

                            Enter Response Network

                            <ArrowRight size={18} />

                        </Link>


                        <Link
                            to="/register"
                            className="landing-button landing-secondary"
                        >

                            Create Account

                        </Link>


                    </div>


                    <div className="landing-indicators">


                        <div className="landing-indicator">

                            <span className="indicator-dot green"></span>

                            <span>
                                Weather Intelligence Online
                            </span>

                        </div>


                        <div className="landing-indicator">

                            <span className="indicator-dot blue"></span>

                            <span>
                                Emergency Network Active
                            </span>

                        </div>


                    </div>


                </div>


                <div className="landing-command-panel">


                    <div className="command-panel-header">

                        <div>

                            <span className="panel-label">
                                SHONGKOT SYSTEM
                            </span>

                            <h2>
                                Crisis Intelligence
                            </h2>

                        </div>


                        <Activity
                            size={22}
                            className="activity-icon"
                        />

                    </div>


                    <div className="system-line"></div>


                    <div className="command-metrics">


                        <div className="command-metric">

                            <div className="metric-icon">

                                <MapPinned
                                    size={19}
                                />

                            </div>

                            <div>

                                <strong>
                                    64
                                </strong>

                                <span>
                                    Districts Monitored
                                </span>

                            </div>

                        </div>


                        <div className="command-metric">

                            <div className="metric-icon">

                                <Radio
                                    size={19}
                                />

                            </div>

                            <div>

                                <strong>
                                    LIVE
                                </strong>

                                <span>
                                    Weather Intelligence
                                </span>

                            </div>

                        </div>


                        <div className="command-metric">

                            <div className="metric-icon">

                                <Siren
                                    size={19}
                                />

                            </div>

                            <div>

                                <strong>
                                    24/7
                                </strong>

                                <span>
                                    Emergency Response
                                </span>

                            </div>

                        </div>


                    </div>


                    <div className="command-network">

                        <div className="network-line"></div>


                        <div className="network-node node-one">

                            <ShieldCheck
                                size={18}
                            />

                        </div>


                        <div className="network-node node-two">

                            <Radio
                                size={18}
                            />

                        </div>


                        <div className="network-node node-three">

                            <Activity
                                size={18}
                            />

                        </div>


                        <div className="network-center">

                            <Waves
                                size={26}
                            />

                            <span>
                                SHONGKOT
                            </span>

                        </div>

                    </div>


                    <div className="command-footer">

                        <span>
                            SYSTEM STATUS
                        </span>

                        <strong>
                            OPERATIONAL
                        </strong>

                    </div>


                </div>


            </div>


            <div className="landing-features">


                <div className="landing-feature">

                    <div className="feature-icon">

                        <Activity
                            size={19}
                        />

                    </div>

                    <div>

                        <strong>
                            Predict
                        </strong>

                        <span>
                            Monitor real-time flood risk
                        </span>

                    </div>

                </div>


                <div className="landing-feature">

                    <div className="feature-icon">

                        <Radio
                            size={19}
                        />

                    </div>

                    <div>

                        <strong>
                            Coordinate
                        </strong>

                        <span>
                            Connect emergency responders
                        </span>

                    </div>

                </div>


                <div className="landing-feature">

                    <div className="feature-icon">

                        <ShieldCheck
                            size={19}
                        />

                    </div>

                    <div>

                        <strong>
                            Protect
                        </strong>

                        <span>
                            Keep communities informed
                        </span>

                    </div>

                </div>


            </div>


        </div>

    );

}


function App() {

    return (

        <BrowserRouter>


            <Routes>


                {/* =========================================
                    PUBLIC ROUTES
                ========================================= */}


                <Route
                    path="/"
                    element={
                        <PublicLayout>
                            <LandingPage />
                        </PublicLayout>
                    }
                />


                <Route
                    path="/login"
                    element={
                        <PublicLayout>
                            <Login />
                        </PublicLayout>
                    }
                />


                <Route
                    path="/register"
                    element={
                        <PublicLayout>
                            <Register />
                        </PublicLayout>
                    }
                />


                <Route
                    path="/unauthorized"
                    element={
                        <Unauthorized />
                    }
                />


                {/* =========================================
                    PROTECTED ROUTES
                ========================================= */}


                <Route
                    element={
                        <ProtectedLayout />
                    }
                >


                    {/* CITIZEN DASHBOARD */}

                    <Route
                        path="/citizen-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                ]}
                            >
                                <CitizenDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* AUTHORITY DASHBOARD */}

                    <Route
                        path="/authority-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* ADMIN DASHBOARD */}

                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "admin",
                                ]}
                            >
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* DISTRICTS */}

                    <Route
                        path="/districts"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Districts />
                            </ProtectedRoute>
                        }
                    />


                    {/* INCIDENTS */}

                    <Route
                        path="/incidents"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Incidents />
                            </ProtectedRoute>
                        }
                    />


                    {/* HOSPITALS */}

                    <Route
                        path="/hospitals"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Hospitals />
                            </ProtectedRoute>
                        }
                    />


                    {/* BROADCASTS */}

                    <Route
                        path="/broadcasts"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Broadcasts />
                            </ProtectedRoute>
                        }
                    />


                    {/* REPORT INCIDENT */}

                    <Route
                        path="/report-incident"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <CreateIncident />
                            </ProtectedRoute>
                        }
                    />


                    {/* ANALYTICS */}

                    <Route
                        path="/analytics"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Analytics />
                            </ProtectedRoute>
                        }
                    />


                    {/* PROFILE */}

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute
                                allowedRoles={[
                                    "citizen",
                                    "authority",
                                    "admin",
                                ]}
                            >
                                <Profile />
                            </ProtectedRoute>
                        }
                    />


                </Route>


                {/* =========================================
                    FALLBACK ROUTES
                ========================================= */}


                <Route
                    path="/dashboard"
                    element={
                        <Navigate
                            to="/authority-dashboard"
                            replace
                        />
                    }
                />


                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />


            </Routes>


        </BrowserRouter>

    );

}


export default App;