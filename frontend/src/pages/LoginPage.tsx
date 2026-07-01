import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import api from "../apis/api";
import { queryClient } from "../main";
import { auth } from "../config/FirebaseConfig";
import { FcGoogle } from "react-icons/fc";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const googleProvider = new GoogleAuthProvider();

    const resetForm = () => {
        setUsername("");
        setPassword("");
    };

    const onSuccess = (response: any) => {
        localStorage.setItem("access_token", response.data.access_token);
        queryClient.invalidateQueries({ queryKey: ["user"] });
        setErrorMsg("");
        if (location.state?.from) navigate(location.state.from);
        else navigate("/");
    };

    const onFailure = (error: any) => {
        const message = error.response?.data?.detail || "An error occurred";
        setErrorMsg(message);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        try {
            const response = await api.post("/auth/login", formData, {
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                },
            });
            onSuccess(response);
        } catch (error: any) {
            onFailure(error);
        } finally {
            resetForm();
        }
    };

    const handleGoogleAuth = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const response = await api.post("/auth/google", {
                google_token: credential?.idToken,
            });
            onSuccess(response);
        } catch(error:any) {
            onFailure(error)
        } finally {
            resetForm();
        }
    };

    return (
        <div className="backgroundDiv">
            <div className="centerCard">
                <form className="authForm" onSubmit={handleLogin}>
                    <div className="formHeading">
                        <h1>Welcome back</h1>
                        <p>Sign in to your account.</p>
                    </div>
                    <input
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        required
                    />
                    <button type="submit">Login</button>
                    {errorMsg && <p className="errorMessage">{errorMsg}</p>}
                    <Link className="authLink" to="/register">
                        New user? Create an account
                    </Link>
                </form>
                <div className="authDivider"><span>or</span></div>
                <button
                    type="button"
                    className="googleButton"
                    onClick={handleGoogleAuth}
                >
                    <FcGoogle size={22} />
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

export default LoginPage;
