import { useState } from "react";
import useBlogComments from "../hooks/useBlogComments";
import useUpdateBlogs from "../hooks/useUpdateBlogs";

type Props = {
    blogId: string;
    limit?: number;
    enabled?: boolean;
};

export type CommentModel = {
    blog_id: string;
    comment: string;
};

const CommentSection = ({ blogId, limit = 3, enabled = true }: Props) => {
    const [draft, setDraft] = useState("");
    const { data, isLoading, isError } = useBlogComments(
        blogId,
        1,
        limit,
        enabled,
    );
    const { commentMutationResult } = useUpdateBlogs();
    const { mutateAsync: addComment, isPending } = commentMutationResult;
    const comments = data?.comments ?? [];

    const postComment = () => {
        const text = draft.trim();
        if (!text) return;
        addComment({ blog_id: blogId, comment: text });
        setDraft("");
    };

    return (
        <div className="commentSection">
            <div className="commentComposer">
                <input
                    className="commentInput"
                    placeholder="Add a comment…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && postComment()}
                />
                <button
                    type="button"
                    className="primaryButton"
                    onClick={postComment}
                    disabled={isPending || !draft.trim()}
                >
                    {isPending ? "Posting…" : "Post"}
                </button>
            </div>

            {isLoading && <p className="commentEmpty">Loading comments…</p>}
            {isError && (
                <p className="errorMessage">Failed to load comments.</p>
            )}
            {!isLoading && !isError && comments.length === 0 && (
                <p className="commentEmpty">No comments yet.</p>
            )}

            <div className="commentList">
                {comments.map((c) => (
                    <div className="commentItem" key={c.id}>
                        <div className="authorPhoto">
                            <img
                                src={c.profile_picture || "/default_pfp.png"}
                                alt="pfp"
                            />
                        </div>
                        <div className="commentBody">
                            <span className="commentAuthor">{c.username}</span>
                            <p className="commentText">{c.comment}</p>
                            <span className="commentMeta">
                                {new Date(c.created_at).toLocaleDateString()} ·{" "}
                                {c.comment_likes} likes
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
