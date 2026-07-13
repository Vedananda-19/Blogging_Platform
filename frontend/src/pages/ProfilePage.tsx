import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LuPencil,
    LuFileText,
    LuBookmark,
    LuThumbsUp,
    LuMessageCircle,
    LuArrowLeft,
    LuSettings,
    LuUsers,
    LuChevronDown,
    LuChevronUp,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import useUser from "../hooks/useUser";
import useUserDetails from "../hooks/useUserDetails";
import EditProfileModal from "../components/EditProfileModal";
import AuthorDetailsItem from "../components/AuthorDetailsItem";

type Section = {
    key: string;
    label: string;
    icon: IconType;
    to: string;
};

const SECTIONS: Section[] = [
    { key: "blogs", label: "Your Blogs", icon: LuFileText, to: "/profile/blogs" },
    { key: "saved", label: "Saved Blogs", icon: LuBookmark, to: "/profile/saved" },
    { key: "liked", label: "Liked Blogs", icon: LuThumbsUp, to: "/profile/liked" },
    { key: "comments", label: "Your Comments", icon: LuMessageCircle, to: "/profile/comments" },
];

const ProfilePage = () => {
    const navigate = useNavigate();
    const { data: user } = useUser();
    const { data: details } = useUserDetails(user?.id);
    const [editOpen, setEditOpen] = useState(false);
    const [followingOpen, setFollowingOpen] = useState(false);

    return (
        <div className="profilePage">
            <button
                className="secondaryButton backButton"
                onClick={() => navigate("/")}
            >
                <LuArrowLeft /> Back
            </button>

            <div className="profileHeader">
                <div className="profileAvatar">
                    <img src={details?.photo_url ?? user?.photo_url ?? "/default_pfp.png"} alt="avatar" />
                </div>
                <div className="profileInfo">
                    <h1>{details?.username ?? user?.username ?? "Your Profile"}</h1>
                    <p className="profileHandle">
                        {details?.username ?? user?.username ? `@${details?.username ?? user?.username}` : ""}
                    </p>
                    {details && (
                        <div className="profileStats">
                            <span><strong>{details.follow_count}</strong> followers</span>
                            <span><strong>{details.following_count}</strong> following</span>
                            <span className="statDivider" />
                            <span><strong>{details.post_count}</strong> posts</span>
                            <span><strong>{details.comment_count}</strong> comments</span>
                        </div>
                    )}
                </div>
                <div className="profileHeaderActions">
                    <button
                        className="primaryButton profileEditButton"
                        onClick={() => setEditOpen(true)}
                    >
                        <LuPencil /> Edit Profile
                    </button>
                    <button
                        className="secondaryButton"
                        onClick={() => navigate("/settings")}
                    >
                        <LuSettings /> Settings
                    </button>
                </div>
            </div>

            <div className="profileSections">
                {SECTIONS.map(({ key, label, icon: Icon, to }) => (
                    <button
                        key={key}
                        className="profileSectionButton"
                        onClick={() => navigate(to)}
                    >
                        <Icon className="profileSectionIcon" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {details && (
                <div className="followingSection">
                    <button
                        className="followingToggle"
                        onClick={() => setFollowingOpen((v) => !v)}
                    >
                        <span>
                            <LuUsers /> Following ({details.following_count})
                        </span>
                        {followingOpen ? <LuChevronUp /> : <LuChevronDown />}
                    </button>
                    {followingOpen && (
                        <div className="followingList">
                            {details.following_author_ids.length === 0 ? (
                                <p className="authorItemMuted">
                                    You're not following anyone yet.
                                </p>
                            ) : (
                                details.following_author_ids.map((id) => (
                                    <AuthorDetailsItem key={id} author_id={id} />
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {editOpen && <EditProfileModal setDisplay={setEditOpen} />}
        </div>
    );
};

export default ProfilePage;
