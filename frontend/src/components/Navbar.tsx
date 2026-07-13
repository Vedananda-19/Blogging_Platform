import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuUser, LuSettings, LuLogOut, LuChevronDown } from "react-icons/lu";
import api from "../apis/api";
import { queryClient } from "../main";

type User = { username?: string; photo_url?: string | null };

const Navbar = ({ user }: { user?: User | null }) => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        setOpen(false);
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.log(e);
        }
        localStorage.removeItem("access_token");
        queryClient.removeQueries({ queryKey: ["user"] });
        navigate("/");
    };

    const go = (to: string) => {
        setOpen(false);
        navigate(to);
    };

    return (
        <header className="navbar">
            <Link to="/" className="navLogo">
                <img className="navLogoImg" src="/logo.png" alt="BlogSphere" />
            </Link>

            <div className="navRight">
                {user ? (
                    <div className="navUser">
                        <button
                            className="navUserButton"
                            onClick={() => setOpen((v) => !v)}
                        >
                            <img
                                className="navAvatar"
                                src={user.photo_url || "/default_pfp.png"}
                                alt="avatar"
                            />
                            <span className="navUsername">{user.username}</span>
                            <LuChevronDown />
                        </button>

                        {open && (
                            <>
                                <div
                                    className="navDropdownBackdrop"
                                    onClick={() => setOpen(false)}
                                />
                                <div className="navDropdown">
                                    <button onClick={() => go("/profile")}>
                                        <LuUser /> Profile
                                    </button>
                                    <button onClick={() => go("/settings")}>
                                        <LuSettings /> Settings
                                    </button>
                                    <button
                                        className="navDropdownDanger"
                                        onClick={handleLogout}
                                    >
                                        <LuLogOut /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="navAuthButtons">
                        <button
                            className="secondaryButton"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </button>
                        <button
                            className="primaryButton"
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
