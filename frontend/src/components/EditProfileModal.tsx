import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LuX, LuPencil } from "react-icons/lu";
import FileUpload from "./FileUpload";
import useUser from "../hooks/useUser";
import api from "../apis/api";

type Props = {
    setDisplay: (v: boolean) => void;
};

const EditProfileModal = ({ setDisplay }: Props) => {
    const { data: user } = useUser();
    const queryClient = useQueryClient();

    const [username, setUsername] = useState<string>(user?.username ?? "");
    const [imageURL, setImageURL] = useState<string>(user?.photo_url ?? "");
    const [uploadDisplay, setUploadDisplay] = useState(false);

    const { mutateAsync: editProfile, isPending } = useMutation({
        mutationFn: async (payload: { username: string; photo_url: string }) => {
            const response = await api.put("/user/edit-profile", payload);
            return response.data;
        },
        onSuccess: () => queryClient.invalidateQueries(),
    });

    const handleSave = async () => {
        if (!window.confirm("Save changes to your profile?")) return;
        try {
            await editProfile({ username: username.trim(), photo_url: imageURL });
            setDisplay(false);
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="uploadOverlay">
            <div className="uploadModal" onClick={(e) => e.stopPropagation()}>
                <div className="uploadModalHeader">
                    <h3>Edit Profile</h3>
                    <button
                        type="button"
                        className="uploadClose"
                        onClick={() => setDisplay(false)}
                        disabled={isPending}
                        aria-label="Close"
                    >
                        <LuX />
                    </button>
                </div>

                <button
                    type="button"
                    className="editAvatarButton"
                    onClick={() => setUploadDisplay(true)}
                    title="Change picture"
                >
                    <img src={imageURL || "/default_pfp.png"} alt="avatar" />
                    <span className="editAvatarOverlay">
                        <LuPencil />
                    </span>
                </button>

                <label className="editField">
                    <span>Username</span>
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                    />
                </label>

                <button
                    type="button"
                    className="primaryButton"
                    onClick={handleSave}
                    disabled={isPending || !username.trim()}
                >
                    {isPending ? "Saving…" : "Save Changes"}
                </button>
            </div>

            {uploadDisplay && (
                <FileUpload
                    setDisplay={setUploadDisplay}
                    setImageURL={setImageURL}
                />
            )}
        </div>
    );
};

export default EditProfileModal;
