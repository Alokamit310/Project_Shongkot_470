import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Activity,
    AlertTriangle,
    BarChart3,
    BedDouble,
    Download,
    Hospital,
    MapPinned,
    RefreshCw,
} from "lucide-react";

import {
    Bar,
    Doughnut,
    Line,
} from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title,
} from "chart.js";

import api from "../services/api";


ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Title
);


// =====================================================
// SHARED CHART OPTIONS
// =====================================================

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            position: "bottom",
        },
    },

    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
};


const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
        legend: {
            position: "bottom",
        },
    },
};


// =====================================================
// MAIN COMPONENT
// =====================================================

function Analytics() {

    const [
        analytics,
        setAnalytics,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const [
        downloading,
        setDownloading,
    ] = useState(false);


    // =================================================
    // FETCH ANALYTICS
    // =================================================

    const fetchAnalytics =
        async () => {

            try {

                setLoading(true);
                setError("");


                const response =
                    await api.get(
                        "/analytics"
                    );


                setAnalytics(
                    response.data
                );


            } catch (error) {

                console.error(
                    "[Analytics] Fetch error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to load analytics."
                );


            } finally {

                setLoading(false);

            }

        };


    useEffect(() => {

        fetchAnalytics();

    }, []);


    // =================================================
    // CSV DOWNLOAD
    // =================================================

    const downloadCSV =
        async () => {

            try {

                setDownloading(true);
                setError("");


                const response =
                    await api.get(
                        "/analytics/incidents.csv",
                        {
                            responseType:
                                "blob",
                        }
                    );


                const blob =
                    new Blob(
                        [response.data],
                        {
                            type:
                                "text/csv;charset=utf-8;",
                        }
                    );


                const url =
                    window.URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement(
                        "a"
                    );


                const date =
                    new Date()
                        .toISOString()
                        .slice(0, 10);


                link.href = url;

                link.setAttribute(
                    "download",
                    `shongkot-incidents-${date}.csv`
                );


                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();


                window.URL.revokeObjectURL(
                    url
                );


            } catch (error) {

                console.error(
                    "[Analytics] CSV error:",
                    error
                );


                setError(
                    error.response?.data?.message ||
                    "Failed to download CSV."
                );


            } finally {

                setDownloading(false);

            }

        };


    // =================================================
    // DATA HELPERS
    // =================================================

    const statusData =
        useMemo(() => {

            const source =
                analytics?.incidents
                    ?.byStatus || [];


            return {
                labels:
                    source.map(
                        (item) =>
                            item.status
                    ),

                datasets: [
                    {
                        label:
                            "Incidents",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        backgroundColor: [
                            "#ef4444",
                            "#f59e0b",
                            "#22c55e",
                            "#64748b",
                        ],
                    },
                ],
            };

        }, [analytics]);


    const severityData =
        useMemo(() => {

            const source =
                analytics?.incidents
                    ?.bySeverity || [];


            return {
                labels:
                    source.map(
                        (item) =>
                            item.severity
                    ),

                datasets: [
                    {
                        label:
                            "Incidents",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        backgroundColor: [
                            "#16a34a",
                            "#f59e0b",
                            "#dc2626",
                            "#991b1b",
                        ],
                    },
                ],
            };

        }, [analytics]);


    const riskData =
        useMemo(() => {

            const source =
                analytics?.floodRisk
                    ?.distribution || [];


            return {
                labels:
                    source.map(
                        (item) =>
                            item.risk
                    ),

                datasets: [
                    {
                        label:
                            "Districts",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        backgroundColor: [
                            "#16a34a",
                            "#f59e0b",
                            "#dc2626",
                            "#64748b",
                        ],
                    },
                ],
            };

        }, [analytics]);


    const typeData =
        useMemo(() => {

            const source =
                analytics?.incidents
                    ?.byType || [];


            return {
                labels:
                    source.map(
                        (item) =>
                            item.type
                    ),

                datasets: [
                    {
                        label:
                            "Incidents",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        backgroundColor:
                            "#2563eb",
                    },
                ],
            };

        }, [analytics]);


    const trendData =
        useMemo(() => {

            const source =
                analytics?.incidents
                    ?.last7Days || [];


            return {
                labels:
                    source.map(
                        (item) =>
                            new Date(
                                `${item.date}T00:00:00`
                            ).toLocaleDateString(
                                undefined,
                                {
                                    month:
                                        "short",
                                    day:
                                        "numeric",
                                }
                            )
                    ),

                datasets: [
                    {
                        label:
                            "Reported Incidents",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        borderColor:
                            "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.12)",

                        tension: 0.35,

                        fill: true,
                    },
                ],
            };

        }, [analytics]);


    const topDistrictData =
        useMemo(() => {

            const source =
                (
                    analytics?.incidents
                        ?.byDistrict ||
                    []
                ).slice(0, 8);


            return {
                labels:
                    source.map(
                        (item) =>
                            item.district
                    ),

                datasets: [
                    {
                        label:
                            "Incidents",

                        data:
                            source.map(
                                (item) =>
                                    item.count
                            ),

                        backgroundColor:
                            "#7c3aed",
                    },
                ],
            };

        }, [analytics]);


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div className="page-state">

                <p>
                    Loading analytics...
                </p>

            </div>

        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (
        error &&
        !analytics
    ) {

        return (

            <div className="page-state error-state">

                <p>
                    {error}
                </p>


                <button
                    className="retry-button"
                    onClick={
                        fetchAnalytics
                    }
                >

                    <RefreshCw
                        size={16}
                    />

                    Try Again

                </button>

            </div>

        );

    }


    const hospitalStats =
        analytics?.hospitals ||
        {};


    // =================================================
    // PAGE
    // =================================================

    return (

        <div className="analytics-page">


            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="page-header analytics-header">

                <div>

                    <p className="page-eyebrow">
                        CRISIS INTELLIGENCE ANALYTICS
                    </p>

                    <h1>
                        Analytics & Reports
                    </h1>

                    <p>
                        Monitor flood risk,
                        incident activity,
                        hospital capacity,
                        and operational trends
                        across Shongkot.
                    </p>

                </div>


                <div className="analytics-header-actions">

                    <button
                        className="refresh-button"
                        onClick={
                            fetchAnalytics
                        }
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>


                    <button
                        className="analytics-download-button"
                        onClick={
                            downloadCSV
                        }
                        disabled={
                            downloading
                        }
                    >

                        <Download
                            size={17}
                        />

                        {downloading
                            ? "Preparing CSV..."
                            : "Export Incidents CSV"}

                    </button>

                </div>

            </div>


            {error && (

                <div className="hospital-message warning">

                    {error}

                </div>

            )}


            {/* ==========================================
                TOP STAT CARDS
            ========================================== */}

            <div className="analytics-stat-grid">


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <AlertTriangle
                            size={23}
                        />

                    </div>


                    <div>

                        <span>
                            Total Incidents
                        </span>

                        <strong>
                            {
                                analytics
                                    ?.totals
                                    ?.incidents ||
                                0
                            }
                        </strong>

                    </div>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <MapPinned
                            size={23}
                        />

                    </div>


                    <div>

                        <span>
                            Districts Monitored
                        </span>

                        <strong>
                            {
                                analytics
                                    ?.totals
                                    ?.districts ||
                                0
                            }
                        </strong>

                    </div>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <Hospital
                            size={23}
                        />

                    </div>


                    <div>

                        <span>
                            Hospitals
                        </span>

                        <strong>
                            {
                                analytics
                                    ?.totals
                                    ?.hospitals ||
                                0
                            }
                        </strong>

                    </div>

                </div>


                <div className="analytics-stat-card">

                    <div className="analytics-stat-icon">

                        <BedDouble
                            size={23}
                        />

                    </div>


                    <div>

                        <span>
                            Available Beds
                        </span>

                        <strong>
                            {
                                hospitalStats.availableBeds ||
                                0
                            }
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==========================================
                FIRST CHART ROW
            ========================================== */}

            <div className="analytics-chart-grid">


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Flood Intelligence
                            </p>

                            <h2>
                                Flood Risk Distribution
                            </h2>

                        </div>

                        <Activity
                            size={20}
                        />

                    </div>


                    <div className="analytics-chart-body doughnut-chart">

                        <Doughnut
                            data={
                                riskData
                            }
                            options={
                                doughnutOptions
                            }
                        />

                    </div>

                </section>


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Response Progress
                            </p>

                            <h2>
                                Incident Status
                            </h2>

                        </div>

                        <BarChart3
                            size={20}
                        />

                    </div>


                    <div className="analytics-chart-body doughnut-chart">

                        <Doughnut
                            data={
                                statusData
                            }
                            options={
                                doughnutOptions
                            }
                        />

                    </div>

                </section>

            </div>


            {/* ==========================================
                TREND
            ========================================== */}

            <section className="analytics-chart-card analytics-wide-card">

                <div className="analytics-chart-heading">

                    <div>

                        <p className="section-eyebrow">
                            7-Day Activity
                        </p>

                        <h2>
                            Incident Reporting Trend
                        </h2>

                    </div>

                </div>


                <div className="analytics-chart-body analytics-line-chart">

                    <Line
                        data={
                            trendData
                        }
                        options={
                            chartOptions
                        }
                    />

                </div>

            </section>


            {/* ==========================================
                SEVERITY + TYPE
            ========================================== */}

            <div className="analytics-chart-grid">


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Emergency Priority
                            </p>

                            <h2>
                                Incidents by Severity
                            </h2>

                        </div>

                    </div>


                    <div className="analytics-chart-body">

                        <Bar
                            data={
                                severityData
                            }
                            options={
                                chartOptions
                            }
                        />

                    </div>

                </section>


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Incident Categories
                            </p>

                            <h2>
                                Incidents by Type
                            </h2>

                        </div>

                    </div>


                    <div className="analytics-chart-body">

                        <Bar
                            data={
                                typeData
                            }
                            options={
                                chartOptions
                            }
                        />

                    </div>

                </section>

            </div>


            {/* ==========================================
                DISTRICT + HOSPITAL
            ========================================== */}

            <div className="analytics-chart-grid">


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Geographic Activity
                            </p>

                            <h2>
                                Top Incident Districts
                            </h2>

                        </div>

                    </div>


                    <div className="analytics-chart-body">

                        <Bar
                            data={
                                topDistrictData
                            }
                            options={{
                                ...chartOptions,

                                indexAxis:
                                    "y",
                            }}
                        />

                    </div>

                </section>


                <section className="analytics-chart-card">

                    <div className="analytics-chart-heading">

                        <div>

                            <p className="section-eyebrow">
                                Medical Capacity
                            </p>

                            <h2>
                                Hospital Resources
                            </h2>

                        </div>

                    </div>


                    <div className="hospital-analytics-list">


                        <div>

                            <span>
                                Total Beds
                            </span>

                            <strong>
                                {
                                    hospitalStats.totalBeds ||
                                    0
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Available Beds
                            </span>

                            <strong>
                                {
                                    hospitalStats.availableBeds ||
                                    0
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                ICU Beds
                            </span>

                            <strong>
                                {
                                    hospitalStats.icuBeds ||
                                    0
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Open Hospitals
                            </span>

                            <strong>
                                {
                                    hospitalStats.openHospitals ||
                                    0
                                }
                            </strong>

                        </div>


                        <div>

                            <span>
                                Emergency Ready
                            </span>

                            <strong>
                                {
                                    hospitalStats.emergencyHospitals ||
                                    0
                                }
                            </strong>

                        </div>

                    </div>

                </section>

            </div>


            {/* ==========================================
                GENERATED INFO
            ========================================== */}

            <div className="analytics-generated">

                Analytics generated from current
                Shongkot database data.

                {analytics?.generatedAt && (
                    <>
                        {" "}
                        Last generated:{" "}
                        {new Date(
                            analytics.generatedAt
                        ).toLocaleString()}
                    </>
                )}

            </div>

        </div>

    );

}


export default Analytics;