import { Outlet } from "react-router-dom";
import useUser from "../hooks/useUser";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import HomePage from "../pages/HomePage";

const RootLayout = () => {
    const { data: user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="routeState">
                <h5>Loading…</h5>
            </div>
        );
    }

    return (
        <div className="appShell">
            <Navbar user={user} />
            {user ? (
                <div className="appBody">
                    <Sidebar />
                    <main className="appMain">
                        <Outlet />
                    </main>
                </div>
            ) : (
                <HomePage />
            )}
        </div>
    );
};

export default RootLayout;
