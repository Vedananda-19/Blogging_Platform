import { useNavigate, useSearchParams } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import useBlogs from "../hooks/useBlogs";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import { useEffect, useRef, useState } from "react";

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
    const { likeMutationResult, dislikeMutationResult } = useUpdateBlogs(searchParams);
    const { mutateAsync: likeBlog } = likeMutationResult;
    const { mutateAsync: dislikeBlog } = dislikeMutationResult;

    // Kept for upcoming URL-driven controls (sort/filter/limit). Remove the
    // @ts-ignore once it's wired to the UI (noUnusedLocals flags it until then).
    // @ts-ignore - intentionally unused for now
    const updateParams = (name: string, value: string) => {
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
            <div>
                <input
                    value={searchParams.get("search") || ""}
                    placeholder="Search posts..."
                    onChange={(e) => updateParams("search",e.target.value)}
                />
            </div>

            {isLoading && <p>Loading blogs...</p>}
            {isError && <p className="errorMessage">Failed to load blogs.</p>}
            {!isLoading && data?.pages[0].blogs.length === 0 && (
                <p>No blogs yet.</p>
            )}

            <div className="blogList">
                {data?.pages.map((page) =>
                    page.blogs.map((blog) => (
                        <div className="blogCard" key={blog.id}>
                            <h3>{blog.title}</h3>
                            <p className="blogMeta">by {blog.author}</p>
                            <div
                                className="blogContent"
                                dangerouslySetInnerHTML={{
                                    __html: renderContent(blog.content),
                                }}
                            />
                            <span>
                                <button
                                    onClick={() => {
                                        likeBlog(blog.id);
                                    }}
                                >
                                    Like
                                </button>
                                <p>{blog.liked_count}</p>
                                <button
                                    onClick={() => {
                                        dislikeBlog(blog.id);
                                    }}
                                >
                                    Dislike
                                </button>
                                <p>{blog.disliked_count}</p>
                            </span>
                        </div>
                    )),
                )}
                {isFetchingNextPage && <p>fetching...</p>}
                <div ref={bottomRef}>loading div...</div>
            </div>
        </div>
    );
};

export default BlogsPage;
