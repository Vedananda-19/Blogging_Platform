import { useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="landing">
            <div className="landingHero">
                <span className="landingBadge">Connecting Voices</span>
                <h1>
                    Welcome to <span className="navLogoAccent">BlogSphere</span>
                </h1>
                <p className="landingLead">
                    A place to write, share, and discover stories. Publish rich
                    posts with images, react to what you love, and join the
                    conversation.
                </p>
                <div className="landingActions">
                    <button
                        className="primaryButton"
                        onClick={() => navigate("/register")}
                    >
                        Get started
                    </button>
                    <button
                        className="secondaryButton"
                        onClick={() => navigate("/login")}
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
