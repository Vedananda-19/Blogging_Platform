import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RootLayout from "./layouts/RootLayout";
import BlogFormPage from "./pages/BlogFormPage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import EditBlogPage from "./pages/EditBlogPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileBlogList from "./components/ProfileBlogList";
import SettingsPage from "./pages/SettingsPage";
import { ToastContainer } from "react-toastify";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            { path: "/", element: <Navigate to="/blogs" replace /> },
            { path: "/create", element: <BlogFormPage /> },
            { path: "/blogs", element: <BlogsPage /> },
            { path: "/blogs/:id", element: <BlogDetailPage /> },
            { path: "/blogs/:id/edit", element: <EditBlogPage /> },
            { path: "/profile", element: <ProfilePage /> },
            {
                path: "/profile/blogs",
                element: (
                    <ProfileBlogList
                        which="myBlogs"
                        title="Your Blogs"
                        subtitle="Posts you've written"
                        emptyText="You haven't written any blogs yet."
                        editable
                    />
                ),
            },
            {
                path: "/profile/liked",
                element: (
                    <ProfileBlogList
                        which="likedBlogs"
                        title="Liked Blogs"
                        subtitle="Posts you've liked"
                        emptyText="You haven't liked any blogs yet."
                    />
                ),
            },
            {
                path: "/profile/saved",
                element: (
                    <ProfileBlogList
                        which="savedBlogs"
                        title="Saved Blogs"
                        subtitle="Posts you've saved"
                        emptyText="You haven't saved any blogs yet."
                    />
                ),
            },
            {
                path: "/profile/comments",
                element: (
                    <ProfileBlogList
                        which="commentedBlogs"
                        title="Your Comments"
                        subtitle="Posts you've commented on"
                        emptyText="You haven't commented on any blogs yet."
                    />
                ),
            },
            { path: "/settings", element: <SettingsPage /> },
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
                theme="dark"
            />
        </>
    );
}

export default App;
