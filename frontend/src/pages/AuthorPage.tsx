import { LuArrowLeft, LuUserPlus, LuUserCheck } from "react-icons/lu";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import QueryBlogList from "../components/QueryBlogList";
import useBlogs from "../hooks/useBlogs";
import useUserDetails from "../hooks/useUserDetails";
import useUser from "../hooks/useUser";
import useUserLists from "../hooks/useUserLists";
import useUpdateBlogs from "../hooks/useUpdateBlogs";

const AuthorPage = () => {
    const { authorId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const detailsQuery = useUserDetails(authorId);
    const blogsQuery = useBlogs(searchParams, Boolean(authorId), authorId);
    const { data: currentUser } = useUser();
    const { followingSet } = useUserLists();
    const { followMutationResult } = useUpdateBlogs();
    const { mutateAsync: toggleFollow } = followMutationResult;

    if (detailsQuery.isLoading) {
        return <div className="routeState"><p>Loading author…</p></div>;
    }

    if (detailsQuery.isError || !detailsQuery.data) {
        return (
            <div className="routeState">
                <p className="errorMessage">Author not found.</p>
                <button className="secondaryButton" onClick={() => navigate("/blogs")}>Back to Blogs</button>
            </div>
        );
    }

    const author = detailsQuery.data;
    return (
        <div className="profilePage authorPage">
            <button className="secondaryButton backButton" onClick={() => navigate(-1)}>
                <LuArrowLeft /> Back
            </button>
            <section className="profileHeader">
                <div className="profileAvatar">
                    <img src={author.photo_url || "/default_pfp.png"} alt={`${author.username}'s avatar`} />
                </div>
                <div className="profileInfo">
                    <h1>{author.username}</h1>
                    <p className="profileHandle">@{author.username}</p>
                    <div className="profileStats">
                        <span><strong>{author.follow_count}</strong> followers</span>
                        <span><strong>{author.following_count}</strong> following</span>
                        <span className="statDivider" />
                        <span><strong>{author.post_count}</strong> posts</span>
                        <span><strong>{author.comment_count}</strong> comments</span>
                    </div>
                </div>
                {currentUser && authorId && currentUser.id !== authorId && (
                    <button
                        className={`followButton${followingSet.has(authorId) ? " active" : ""}`}
                        onClick={() => toggleFollow(authorId)}
                    >
                        {followingSet.has(authorId) ? (
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
            </section>
            <QueryBlogList query={blogsQuery} title={`${author.username}'s posts`} emptyText="This author has not published any blogs yet." />
        </div>
    );
};

export default AuthorPage;
