import React, { useRef, useState } from "react";
import { LuUpload, LuX, LuLoaderCircle } from "react-icons/lu";
import api from "../apis/api";

const FileUpload = ({ setDisplay, setImageURL, editor }: any) => {
    const uploadRef = useRef<HTMLInputElement | null>(null);
    const [errorMsg, setErrorMsg] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Please select an image");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        setErrorMsg("");
        setIsUploading(true);
        try {
            const response = await api.post("/blog/image/upload", formData);
            setImageURL && setImageURL(response.data.url);
            editor &&
                editor.chain().focus().setImage({ src: response.data.url }).run();
            setDisplay(false);
        } catch (e) {
            console.log(e);
            setErrorMsg("An error occurred while uploading the image");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className="uploadOverlay"
            onClick={() => !isUploading && setDisplay(false)}
        >
            <div className="uploadModal" onClick={(e) => e.stopPropagation()}>
                <div className="uploadModalHeader">
                    <h3>Add Image</h3>
                    <button
                        type="button"
                        className="uploadClose"
                        onClick={() => setDisplay(false)}
                        disabled={isUploading}
                        aria-label="Close"
                    >
                        <LuX />
                    </button>
                </div>

                <button
                    type="button"
                    className="uploadDropzone"
                    onClick={() => uploadRef.current?.click()}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <LuLoaderCircle className="uploadSpin" />
                            <span>Uploading…</span>
                        </>
                    ) : (
                        <>
                            <LuUpload className="uploadDropzoneIcon" />
                            <span>Browse files</span>
                            <span className="uploadHint">PNG, JPG or GIF</span>
                        </>
                    )}
                    <input
                        ref={uploadRef}
                        type="file"
                        onChange={uploadImage}
                        accept="image/*"
                        hidden
                    />
                </button>

                {errorMsg && <p className="errorMessage">{errorMsg}</p>}
            </div>
        </div>
    );
};

export default FileUpload;
