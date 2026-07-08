import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "react-toastify";
import BlogEditor from "../components/BlogEditor";
import Image from "@tiptap/extension-image"
import api from "../apis/api";

const CreateBlogPage = () => {
    const [blogTitle, setBlogTitle] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({
                placeholder: "Tell your story… use the toolbar to format.",
            }),
        ],
        content: "",
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim();
            setWordCount(text ? text.split(/\s+/).length : 0);
            if (errorMsg) setErrorMsg("");
        },
    });

    const providerValue = useMemo(() => ({ editor }), [editor]);

    const handleCreate = async () => {
        if (!editor) return;
        if (!blogTitle.trim()) {
            setErrorMsg("A title is required.");
            return;
        }
        if (!editor.getText().trim()) {
            setErrorMsg("Your blog needs some content.");
            return;
        }

        const blog = {
            title: blogTitle.trim(),
            content: JSON.stringify(editor.getJSON()),
        };

        setIsSubmitting(true);
        try {
            const response = await api.post("/blog/create", blog);
            toast(response.data.message);
            setBlogTitle("");
            editor.commands.clearContent();
            setWordCount(0);
            navigate("/blogs");
        } catch (error: any) {
            toast(error.response?.data?.detail || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="createPage">
            <div className="createHeader">
                <h1>Create a Blog</h1>
                <div className="createHeaderActions">
                    <button
                        className="secondaryButton"
                        onClick={() => navigate("/blogs")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="primaryButton"
                        onClick={handleCreate}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Publishing…" : "Publish"}
                    </button>
                </div>
            </div>

            <input
                className="titleInput"
                placeholder="Post title"
                value={blogTitle}
                maxLength={120}
                onChange={(e) => {
                    setBlogTitle(e.target.value);
                    if (errorMsg) setErrorMsg("");
                }}
            />

            {errorMsg && <p className="errorMessage">{errorMsg}</p>}

            <div className="editorWrap">
                <EditorContext.Provider value={providerValue}>
                    <BlogEditor />
                </EditorContext.Provider>
            </div>

            <div className="createFooter">
                <span>{wordCount} words</span>
                <span>{blogTitle.length}/120</span>
            </div>
        </div>
    );
};

export default CreateBlogPage;
