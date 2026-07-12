import { useParams, Navigate } from "react-router-dom";
import useBlog from "../hooks/useBlog";
import useUser from "../hooks/useUser";
import BlogFormPage from "./BlogFormPage";

const EditBlogPage = () => {
    const { id } = useParams();
    const { data: blog, isLoading, isError } = useBlog(id);
    const { data: user } = useUser();

    if (isLoading) {
        return (
            <div className="routeState">
                <p>Loading…</p>
            </div>
        );
    }

    if (isError || !blog) {
        return <Navigate to="/blogs" replace />;
    }

    // UX guard — the backend PUT/DELETE is the authoritative check (403).
    if (user && blog.author_name !== user.username) {
        return <Navigate to={`/blogs/${blog.id}`} replace />;
    }

    return <BlogFormPage edit blog={blog} />;
};

export default EditBlogPage;
