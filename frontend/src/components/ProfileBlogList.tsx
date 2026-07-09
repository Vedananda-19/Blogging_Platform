import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";
import useUserBlogs, { type FullList } from "../hooks/useUserBlogs";
import BlogCard from "./BlogCard";

type Props = {
    which: FullList;
    title: string;
    subtitle: string;
    emptyText: string;
};

const ProfileBlogList = ({ which, title, subtitle, emptyText }: Props) => {
    const navigate = useNavigate();
    const hook = useUserBlogs(which);
    const { likedSet, dislikedSet, savedSet, commentedSet } = hook;
    const query = hook[which];
    const blogs = query.data ?? [];

    return (
        <div className="profilePage">
            <button
                className="secondaryButton backButton"
                onClick={() => navigate("/profile")}
            >
                <LuArrowLeft /> Back to Profile
            </button>

            <div className="profileSubHeader">
                <h1>{title}</h1>
                <p className="profileHandle">{subtitle}</p>
            </div>

            {query.isLoading && <p className="commentEmpty">Loading…</p>}
            {query.isError && (
                <p className="errorMessage">Failed to load.</p>
            )}
            {!query.isLoading && !query.isError && blogs.length === 0 && (
                <p className="commentEmpty">{emptyText}</p>
            )}

            <div className="blogList">
                {blogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={blog}
                        liked={likedSet.has(blog.id)}
                        disliked={dislikedSet.has(blog.id)}
                        saved={savedSet.has(blog.id)}
                        commented={commentedSet.has(blog.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProfileBlogList;
