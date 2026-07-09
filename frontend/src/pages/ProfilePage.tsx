import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    LuPencil,
    LuFileText,
    LuBookmark,
    LuThumbsUp,
    LuMessageCircle,
    LuArrowLeft,
} from "react-icons/lu";
import type { IconType } from "react-icons";
import useUser from "../hooks/useUser";
import EditProfileModal from "../components/EditProfileModal";

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
    const [editOpen, setEditOpen] = useState(false);

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
                    <img src={user.photo_url||"/default_pfp.png"} alt="avatar" />
                </div>
                <div className="profileInfo">
                    <h1>{user?.username ?? "Your Profile"}</h1>
                    <p className="profileHandle">
                        {user?.username ? `@${user.username}` : ""}
                    </p>
                </div>
                <button
                    className="primaryButton profileEditButton"
                    onClick={() => setEditOpen(true)}
                >
                    <LuPencil /> Edit Profile
                </button>
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

            {editOpen && <EditProfileModal setDisplay={setEditOpen} />}
        </div>
    );
};

export default ProfilePage;
