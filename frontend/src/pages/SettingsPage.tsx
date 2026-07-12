import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

const SettingsPage = () => {
    const navigate = useNavigate();
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
                <p className="profileHandle">To be created.</p>
            </div>
        </div>
    );
};

export default SettingsPage;
