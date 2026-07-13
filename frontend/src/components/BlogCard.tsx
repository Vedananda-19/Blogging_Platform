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
    LuPencil,
    LuTrash2,
    LuUserPlus,
    LuUserCheck,
} from "react-icons/lu";
import type { Blog } from "../hooks/useBlogs";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import useUser from "../hooks/useUser";
import CommentSection from "./CommentSection";

type Props = {
    blog: Blog;
    liked?: boolean;
    disliked?: boolean;
    saved?: boolean;
    commented?: boolean;
    editable?: boolean;
    following?: boolean;
};

const renderContent = (content: string) => {
    try {
        return generateHTML(JSON.parse(content), [StarterKit, Image]);
    } catch {
        return "";
    }
};

const COMMENT_PREVIEW_LIMIT = 3;

const BlogCard = ({
    blog,
    liked,
    disliked,
    saved,
    commented,
    editable,
    following,
}: Props) => {
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const { data: user } = useUser();

    const {
        likeMutationResult,
        dislikeMutationResult,
        saveMutationResult,
        deleteMutationResult,
        followMutationResult,
    } = useUpdateBlogs();
    const { mutateAsync: likeBlog } = likeMutationResult;
    const { mutateAsync: dislikeBlog } = dislikeMutationResult;
    const { mutateAsync: saveBlog } = saveMutationResult;
    const { mutateAsync: deleteBlog } = deleteMutationResult;
    const { mutateAsync: followAuthor } = followMutationResult;

    const handleDelete = () => {
        if (window.confirm("Delete this blog? This cannot be undone.")) {
            deleteBlog(blog.id);
        }
    };

    return (
        <div
            className="blogCard"
            onClick={() => navigate(`/blogs/${blog.id}`)}
        >
            <div className="blogCardHead">
                <h3>{blog.title}</h3>
                {editable && (
                    <div
                        className="blogCardOwnerActions"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="actionButton"
                            title="Edit"
                            onClick={() => navigate(`/blogs/${blog.id}/edit`)}
                        >
                            <LuPencil />
                        </button>
                        <button
                            className="actionButton dangerButton"
                            title="Delete"
                            onClick={handleDelete}
                        >
                            <LuTrash2 />
                        </button>
                    </div>
                )}
            </div>
            <div
                className="blogAuthor authorLink"
                role="link"
                onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/author/${blog.user_id}`);
                }}
            >
                <div className="authorPhoto">
                    <img
                        src={blog.profile_picture || "/default_pfp.png"}
                        alt="pfp"
                    />
                </div>
                <p className="blogMeta">
                    by {blog.author_name} ·{" "}
                    {new Date(blog.created_at).toLocaleDateString()}
                </p>
                {user &&
                    user.id !== blog.user_id &&
                    (following ? (
                        <button
                            className="actionButton followingIndicator active"
                            title="Following — click to unfollow"
                            onClick={(e) => {
                                e.stopPropagation();
                                followAuthor(blog.user_id);
                            }}
                        >
                            <LuUserCheck />
                        </button>
                    ) : (
                        <button
                            className="followButton"
                            onClick={(e) => {
                                e.stopPropagation();
                                followAuthor(blog.user_id);
                            }}
                        >
                            <LuUserPlus /> Follow
                        </button>
                    ))}
            </div>
            {blog.cover && (
                <img className="blogCardCover" src={blog.cover} alt="" />
            )}
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
