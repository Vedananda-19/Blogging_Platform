import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import useBlogs from "../hooks/useBlogs";
import useFollowingBlogs from "../hooks/useFollowingBlogs";
import QueryBlogList from "../components/QueryBlogList";
import useUser from "../hooks/useUser";
import useUserDetails from "../hooks/useUserDetails";
import useTopUsers from "../hooks/useTopUsers";
import AuthorDetailsItem from "../components/AuthorDetailsItem";

const BlogsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const isFollowing = location.pathname.endsWith("/following");

    useEffect(() => {
        if (!isFollowing && !searchParams.get("sort")) {
            const params = new URLSearchParams(searchParams);
            params.set("sort", "top");
            setSearchParams(params, { replace: true });
        }
    }, [isFollowing, searchParams, setSearchParams]);
    
    const blogsQuery = useBlogs(searchParams, !isFollowing);
    const followingQuery = useFollowingBlogs(searchParams, isFollowing);
    const query = isFollowing ? followingQuery : blogsQuery;

    const { data: user } = useUser();
    const { data, isLoading, isError } = useUserDetails(user?.id);
    const following_ids = data?.following_author_ids;
    const { data: topIds } = useTopUsers();

    return (
        <div className="blogsLayout">
            <QueryBlogList query={query} isFollowing={isFollowing} />
            <aside className="authorSidebar">
                {!isFollowing && (
                    <>
                        <h3>Top authors</h3>
                        {topIds?.map((id) => (
                            <AuthorDetailsItem key={id} author_id={id} />
                        ))}
                    </>
                )}

                <h3>People you follow</h3>
                {isLoading && <p className="authorItemMuted">Loading…</p>}
                {isError && <p className="errorMessage">Failed to load.</p>}
                {following_ids && following_ids.length === 0 && (
                    <p className="authorItemMuted">
                        You're not following anyone yet.
                    </p>
                )}
                {following_ids?.map((id) => (
                    <AuthorDetailsItem key={id} author_id={id} />
                ))}
            </aside>
        </div>
    );
};

export default BlogsPage;
