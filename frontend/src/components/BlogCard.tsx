import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
    LuThumbsUp,
    LuThumbsDown,
    LuBookmark,
    LuMessageCircle,
} from "react-icons/lu";
import type { Blog } from "../hooks/useBlogs";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import CommentSection from "./CommentSection";

type Props = {
    blog: Blog;
    liked?: boolean;
    disliked?: boolean;
    saved?: boolean;
    commented?: boolean;
};

const renderContent = (content: string) => {
    try {
        return generateHTML(JSON.parse(content), [StarterKit, Image]);
    } catch {
        return "";
    }
};

const COMMENT_PREVIEW_LIMIT = 3;

const BlogCard = ({ blog, liked, disliked, saved, commented }: Props) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);

    const { likeMutationResult, dislikeMutationResult, saveMutationResult } =
        useUpdateBlogs();
    const { mutateAsync: likeBlog } = likeMutationResult;
    const { mutateAsync: dislikeBlog } = dislikeMutationResult;
    const { mutateAsync: saveBlog } = saveMutationResult;

    return (
        <div
            className="blogCard"
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
                    className={`actionButton${liked ? " active" : ""}`}
                    onClick={() => likeBlog(blog.id)}
                >
                    <LuThumbsUp />
                    <span>{blog.liked_count}</span>
                </button>
                <button
                    className={`actionButton${disliked ? " active" : ""}`}
                    onClick={() => dislikeBlog(blog.id)}
                >
                    <LuThumbsDown />
                    <span>{blog.disliked_count}</span>
                </button>
                <button
                    className={`actionButton${commented || showComments ? " active" : ""}`}
                    title="Comments"
                    onClick={() => setShowComments((v) => !v)}
                >
                    <LuMessageCircle />
                    <span>{blog.comment_count}</span>
                </button>
                <button
                    className={`actionButton saveButton${saved ? " active" : ""}`}
                    title="Save"
                    onClick={() => saveBlog(blog.id)}
                >
                    <LuBookmark />
                </button>
            </div>

            {showComments && (
                <div onClick={(e) => e.stopPropagation()}>
                    <CommentSection
                        blogId={blog.id}
                        limit={COMMENT_PREVIEW_LIMIT}
                        enabled={showComments}
                    />
                    {blog.comment_count > COMMENT_PREVIEW_LIMIT && (
                        <button
                            className="linkButton"
                            onClick={() => navigate(`/blogs/${blog.id}`)}
                        >
                            View all {blog.comment_count} comments
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogCard;
