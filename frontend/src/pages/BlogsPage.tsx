import { useNavigate, useSearchParams } from "react-router-dom";
import useBlogs from "../hooks/useBlogs";
import useUserBlogs from "../hooks/useUserBlogs";
import BlogCard from "../components/BlogCard";
import { useEffect, useRef } from "react";

const BlogsPage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const bottomRef = useRef<HTMLDivElement>(null);

    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        isFetchingNextPage,
        hasNextPage,
    } = useBlogs(searchParams);

    const { likedSet, dislikedSet, savedSet, commentedSet } = useUserBlogs();

    const updateParams = (name: string, value?: string) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params;
        });
    };

    useEffect(() => {
        const el = bottomRef.current;
        if (!el || !hasNextPage) return;
        const observer = new IntersectionObserver((entries) => {
            if (
                entries[0].isIntersecting &&
                hasNextPage &&
                !isFetchingNextPage
            ) {
                fetchNextPage();
            }
        });
        observer.observe(el);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="routeState">
            <h1>Blogs</h1>
            <button className="secondaryButton" onClick={() => navigate("/")}>
                Back Home
            </button>
            <div className="blogControls">
                <input
                    value={searchParams.get("search") || ""}
                    placeholder="Search posts..."
                    onChange={(e) => updateParams("search", e.target.value)}
                />
                <select
                    value={searchParams.get("sort") || "recent"}
                    onChange={(e) => updateParams("sort", e.target.value)}
                >
                    <option value="recent">Recent</option>
                    <option value="top">Top</option>
                </select>
            </div>

            {isLoading && <p>Loading blogs...</p>}
            {isError && <p className="errorMessage">Failed to load blogs.</p>}
            {!isLoading && data?.pages[0].blogs.length === 0 && (
                <p>No blogs yet.</p>
            )}

            <div className="blogList">
                {data?.pages.map((page) =>
                    page.blogs.map((blog) => (
                        <BlogCard
                            key={blog.id}
                            blog={blog}
                            liked={likedSet.has(blog.id)}
                            disliked={dislikedSet.has(blog.id)}
                            saved={savedSet.has(blog.id)}
                            commented={commentedSet.has(blog.id)}
                        />
                    )),
                )}
                {isFetchingNextPage && <p>fetching...</p>}
                <div ref={bottomRef} className="loadSentinel" />
            </div>
        </div>
    );
};

export default BlogsPage;
