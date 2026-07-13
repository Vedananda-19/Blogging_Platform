import { useLocation, useNavigate } from "react-router-dom";
import { LuUserMinus } from "react-icons/lu";
import useUserDetails from "../hooks/useUserDetails";
import useUpdateBlogs from "../hooks/useUpdateBlogs";

const AuthorDetailsItem = ({ author_id }: { author_id: string }) => {
    const { data, isLoading, isError } = useUserDetails(author_id);
    const navigate = useNavigate();
    const location = useLocation();
    const { followMutationResult } = useUpdateBlogs();
    const { mutateAsync: toggleFollow } = followMutationResult;

    // Profile page renders a full-width row with an unfollow button;
    // elsewhere (Blogs / Following) it's a compact clickable card.
    const asRow = location.pathname.startsWith("/profile");

    if (isLoading) {
        return <div className="authorItem authorItemMuted">Loading…</div>;
    }
    if (isError || !data) return null;

    const goToAuthor = () => navigate(`/author/${author_id}`);

    if (asRow) {
        return (
            <div className="authorItem authorItemRow">
                <button className="authorItemMain" onClick={goToAuthor}>
                    <img
                        className="authorItemAvatar"
                        src={data.photo_url || "/default_pfp.png"}
                        alt=""
                    />
                    <span className="authorItemName">{data.username}</span>
                </button>
                <button
                    className="followButton active"
                    onClick={() => toggleFollow(author_id)}
                >
                    <LuUserMinus /> Unfollow
                </button>
            </div>
        );
    }

    return (
        <button className="authorItem authorItemCard" onClick={goToAuthor}>
            <img
                className="authorItemAvatar"
                src={data.photo_url || "/default_pfp.png"}
                alt=""
            />
            <span className="authorItemName">{data.username}</span>
        </button>
    );
};

export default AuthorDetailsItem;
