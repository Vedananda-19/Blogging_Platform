import { Outlet, Navigate, useLocation } from "react-router-dom";
import useUser from "../hooks/useUser";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HomePage from "../pages/HomePage";

const RootLayout = () => {
    const { data: user, isLoading } = useUser();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="routeState">
                <h5>Loading…</h5>
            </div>
        );
    }

    if (!user) {
        if (location.pathname !== "/") {
            return <Navigate to="/" replace />;
        }
        return (
            <div className="appShell">
                <Navbar user={null} />
                <HomePage />
            </div>
        );
    }

    return (
        <div className="appShell">
            <Navbar user={user} />
            <div className="appBody">
                <Sidebar />
                <main className="appMain">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default RootLayout;
