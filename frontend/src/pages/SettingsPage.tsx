import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuSun, LuMoon } from "react-icons/lu";

type Theme = "light" | "dark";

const SettingsPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem("theme") as Theme) || "dark",
    );

    const applyTheme = (theme: Theme) => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);
        setTheme(theme);
    };

    return (
        <div className="profilePage">
            <button
                className="secondaryButton backButton"
                onClick={() => navigate("/profile")}
            >
                <LuArrowLeft /> Back to Profile
            </button>
            <div className="profileSubHeader">
                <h1>Settings</h1>
                <p className="profileHandle">Manage your preferences</p>
            </div>

            <div className="settingsCard">
                <div className="settingRow">
                    <div className="settingText">
                        <span className="settingLabel">Appearance</span>
                        <p className="settingHint">
                            Choose a light or dark theme.
                        </p>
                    </div>
                    <div className="themeToggle">
                        <button
                            type="button"
                            className={`themeOption${theme === "light" ? " active" : ""}`}
                            onClick={() => applyTheme("light")}
                        >
                            <LuSun /> Light
                        </button>
                        <button
                            type="button"
                            className={`themeOption${theme === "dark" ? " active" : ""}`}
                            onClick={() => applyTheme("dark")}
                        >
                            <LuMoon /> Dark
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
