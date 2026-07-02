import { useNavigate } from "react-router-dom"
import useUser from "../hooks/useUser"
import api from "../apis/api"
import { queryClient } from "../main"

function HomePage() {
    const navigate = useNavigate()
    const { data: user } = useUser()

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout")
        } catch(error) {
            console.log(error)
        }
        localStorage.removeItem("access_token")
        queryClient.removeQueries({ queryKey: ["user"] })
        navigate("/login")
    }

    return (
        <div className="routeState">
            <h3>Welcome{user?.username ? `, ${user.username}` : ""}</h3>
            <p>You are signed in.</p>
            <button className="primaryButton" onClick={handleLogout}>
                Logout
            </button>
            <button className="primaryButton" onClick={() => navigate("/create")}>
                Create Blog
            </button>
        </div>
    )
}

export default HomePage
