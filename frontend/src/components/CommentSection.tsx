import { useState } from "react";
import { LuThumbsUp } from "react-icons/lu";
import useBlogComments from "../hooks/useBlogComments";
import useUpdateBlogs from "../hooks/useUpdateBlogs";
import useUserLists from "../hooks/useUserLists";

type Props = {
    blogId: string;
    limit?: number;
    enabled?: boolean;
    paginate?: boolean;
};

export type CommentModel = {
    blog_id: string;
    comment: string;
};

const CommentSection = ({
    blogId,
    limit = 3,
    enabled = true,
    paginate = false,
}: Props) => {
    const [draft, setDraft] = useState("");
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useBlogComments(blogId, limit, enabled);
    const { commentMutationResult, likeCommentMutationResult } = useUpdateBlogs();
    const { mutateAsync: addComment, isPending } = commentMutationResult;
    const { mutateAsync: likeComment } = likeCommentMutationResult;
    const { likedCommentsSet } = useUserLists();
    const comments = data?.pages.flatMap((p) => p.comments) ?? [];
    const totalCount = data?.pages[0]?.comment_count ?? 0;

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
                            <div className="commentFooter">
                                <span className="commentMeta">
                                    {new Date(c.created_at).toLocaleDateString()}
                                </span>
                                <button
                                    className={`commentLikeButton${likedCommentsSet.has(c.id) ? " active" : ""}`}
                                    onClick={() => likeComment(c.id)}
                                    title="Like comment"
                                >
                                    <LuThumbsUp />
                                    <span>{c.comment_likes}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paginate && hasNextPage && (
                <button
                    className="linkButton"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? "Loading…"
                        : `Load more comments (${totalCount - comments.length} more)`}
                </button>
            )}
        </div>
    );
};

export default CommentSection;
