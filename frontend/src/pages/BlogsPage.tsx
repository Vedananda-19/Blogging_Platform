import { useNavigate, useSearchParams } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import {
    LuThumbsUp,
    LuThumbsDown,
    LuBookmark,
    LuMessageCircle,
} from "react-icons/lu";
import useBlogs from "../hooks/useBlogs";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import useUserBlogs from "../hooks/useUserBlogs";
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

    const { likeMutationResult, dislikeMutationResult, saveMutationResult } =
        useUpdateBlogs();
    const { mutateAsync: likeBlog } = likeMutationResult;
    const { mutateAsync: dislikeBlog } = dislikeMutationResult;
    const { mutateAsync: saveBlog } = saveMutationResult;

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

    const renderContent = (content: string) => {
        try {
            return generateHTML(JSON.parse(content), [StarterKit]);
        } catch {
            return "";
        }
    };

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
                        <div
                            className="blogCard"
                            key={blog.id}
                            onClick={() => navigate(`/blogs/${blog.id}`)}
                        >
                            <h3>{blog.title}</h3>
                            <div className="blogAuthor">
                                <div className="authorPhoto">
                                    <img
                                        src={blog.profile_picture || "/default_pfp.png"}
                                        alt="pfp"
                                    />
                                </div>
                                <p className="blogMeta">by {blog.author_name}</p>
                            </div>
                            <div
                                className="blogPreview"
                                dangerouslySetInnerHTML={{
                                    __html: renderContent(blog.content),
                                }}
                            />
                            <div
                                className="blogActions"
                                onClick={(e) => e.stopPropagation()}
                            >
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
                                </button>
                            </div>
                        </div>
                    )),
                )}
                {isFetchingNextPage && <p>fetching...</p>}
                <div ref={bottomRef} className="loadSentinel" />
            </div>
        </div>
    );
};

export default BlogsPage;
