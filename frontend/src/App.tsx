import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./layouts/ProtectedRoute";
import CreateBlogPage from "./pages/CreateBlogPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/create",
                element: <CreateBlogPage />,
            },
            {
                path: "/blogs",
                element: <BlogsPage />,
            },
            {
                path: "/blogs/:id",
                element: <BlogDetailPage />,
            },
        ],
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },
]);

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <ToastContainer
                position="top-right"
                autoClose={1500}
                newestOnTop={true}
                theme="light"
            />
        </>
    );
}

export default App;
