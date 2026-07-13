import { useParams, useNavigate } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
    LuThumbsUp,
    LuThumbsDown,
    LuBookmark,
    LuMessageCircle,
    LuArrowLeft,
    LuUserPlus,
    LuUserCheck,
} from "react-icons/lu";
import useBlog from "../hooks/useBlog";
import useUserLists from "../hooks/useUserLists";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import useUser from "../hooks/useUser";
import CommentSection from "../components/CommentSection";

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: blog, isLoading, isError } = useBlog(id);
    const { data: user } = useUser();
    const { likedSet, dislikedSet, savedSet, commentedSet, followingSet } =
        useUserLists();
    const {
        likeMutationResult,
        dislikeMutationResult,
        saveMutationResult,
        followMutationResult,
    } = useUpdateBlogs();
    const { mutateAsync: likeBlog } = likeMutationResult;
    const { mutateAsync: dislikeBlog } = dislikeMutationResult;
    const { mutateAsync: saveBlog } = saveMutationResult;
    const { mutateAsync: followAuthor } = followMutationResult;

    if (isLoading) {
        return (
            <div className="routeState">
                <p>Loading blog…</p>
            </div>
        );
    }

    if (isError || !blog) {
        return (
            <div className="routeState">
                <p className="errorMessage">Blog not found.</p>
                <button className="secondaryButton" onClick={() => navigate("/blogs")}>
                    Back to Blogs
                </button>
            </div>
        );
    }

    const html = (() => {
        try {
            return generateHTML(JSON.parse(blog.content), [StarterKit, Image]);
        } catch {
            return "";
        }
    })();

    return (
        <div className="blogDetail">
            <button
                className="secondaryButton backButton"
                onClick={() => navigate("/blogs")}
            >
                <LuArrowLeft /> Back
            </button>

            <h1>{blog.title}</h1>

            <div
                className="blogAuthor authorLink"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/author/${blog.user_id}`)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/author/${blog.user_id}`);
                    }
                }}
            >
                <div className="authorPhoto">
                    <img src={blog.profile_picture || "/default_pfp.png"} alt="pfp" />
                </div>
                <p className="blogMeta">by {blog.author_name}</p>
                {user && user.id !== blog.user_id && (
                    <button
                        className={`followButton${followingSet.has(blog.user_id) ? " active" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            followAuthor(blog.user_id);
                        }}
                    >
                        {followingSet.has(blog.user_id) ? (
                            <>
                                <LuUserCheck /> Following
                            </>
                        ) : (
                            <>
                                <LuUserPlus /> Follow
                            </>
                        )}
                    </button>
                )}
            </div>

            {blog.cover && (
                <img className="blogDetailCover" src={blog.cover} alt="" />
            )}

            <div
                className="blogContent"
                dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="blogActions detailActions">
                <button
                    className={`actionButton${likedSet.has(blog.id) ? " active" : ""}`}
                    onClick={() => likeBlog(blog.id)}
                >
                    <LuThumbsUp />
                    <span>{blog.liked_count}</span>
                </button>
                <button
                    className={`actionButton${dislikedSet.has(blog.id) ? " active" : ""}`}
                    onClick={() => dislikeBlog(blog.id)}
                >
                    <LuThumbsDown />
                    <span>{blog.disliked_count}</span>
                </button>
                <button
                    className={`actionButton${commentedSet.has(blog.id) ? " active" : ""}`}
                    title="Comments"
                >
                    <LuMessageCircle />
                    <span>{blog.comment_count}</span>
                </button>
                <button
                    className={`actionButton saveButton${savedSet.has(blog.id) ? " active" : ""}`}
                    title="Save"
                    onClick={() => saveBlog(blog.id)}
                >
                    <LuBookmark />
                    <span>Save</span>
                </button>
            </div>

            {/* First page of comments (limit 20). Pagination to be added later. */}
            <section className="commentsBlock">
                <h2 className="commentsHeading">
                    Comments ({blog.comment_count})
                </h2>
                <CommentSection blogId={blog.id} limit={10} paginate />
            </section>
        </div>
    );
};

export default BlogDetailPage;
