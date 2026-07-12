import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContext } from "@tiptap/react";
import { useQueryClient } from "@tanstack/react-query";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { toast } from "react-toastify";
import BlogEditor from "../components/BlogEditor";
import Image from "@tiptap/extension-image";
import { LuImagePlus, LuTrash2 } from "react-icons/lu";
import api from "../apis/api";
import FileUpload from "../components/FileUpload";
import type { Blog } from "../hooks/useBlogs";

type Props = {
    edit?: boolean;
    blog?: Blog;
};

const safeParse = (content?: string) => {
    if (!content) return "";
    try {
        return JSON.parse(content);
    } catch {
        return "";
    }
};

const BlogFormPage = ({ edit = false, blog }: Props) => {
    const [blogTitle, setBlogTitle] = useState(blog?.title ?? "");
    const [errorMsg, setErrorMsg] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadCoverDisplay, setUploadCoverDisplay] = useState(false);
    const [coverImage, setCoverImage] = useState(blog?.cover ?? "");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Placeholder.configure({
                placeholder: "Tell your story… use the toolbar to format.",
            }),
        ],
        content: edit && blog ? safeParse(blog.content) : "",
        onUpdate: ({ editor }) => {
            const text = editor.getText().trim();
            setWordCount(text ? text.split(/\s+/).length : 0);
            if (errorMsg) setErrorMsg("");
        },
    });

    const providerValue = useMemo(() => ({ editor }), [editor]);

    const handleSubmit = async () => {
        if (!editor) return;
        if (!blogTitle.trim()) {
            setErrorMsg("A title is required.");
            return;
        }
        if (!editor.getText().trim()) {
            setErrorMsg("Your blog needs some content.");
            return;
        }

        const payload = {
            title: blogTitle.trim(),
            content: JSON.stringify(editor.getJSON()),
            cover: coverImage,
        };

        setIsSubmitting(true);
        try {
            if (edit && blog) {
                const response = await api.put(`/blog/${blog.id}`, payload);
                toast(response.data.message);
                queryClient.invalidateQueries({ queryKey: ["blog", blog.id] });
                queryClient.invalidateQueries({ queryKey: ["blogs"] });
                queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
                navigate(`/blogs/${blog.id}`);
            } else {
                const response = await api.post("/blog/create", payload);
                toast(response.data.message);
                setBlogTitle("");
                editor.commands.clearContent();
                setWordCount(0);
                navigate("/blogs");
            }
        } catch (error: any) {
            toast(error.response?.data?.detail || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const cancel = () =>
        navigate(edit && blog ? `/blogs/${blog.id}` : "/blogs");

    return (
        <div className="createPage">
            <div className="createHeader">
                <h1>{edit ? "Edit Blog" : "Create a Blog"}</h1>
                <div className="createHeaderActions">
                    <button
                        className="secondaryButton"
                        onClick={cancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="primaryButton"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {edit
                            ? isSubmitting
                                ? "Saving…"
                                : "Save Changes"
                            : isSubmitting
                              ? "Publishing…"
                              : "Publish"}
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
            {!coverImage && (
                <button
                    className="coverButton"
                    onClick={() => setUploadCoverDisplay(true)}
                >
                    <LuImagePlus />
                    Add Cover Image
                </button>
            )}
            {coverImage && (
                <div className="coverPreview">
                    <img className="coverImage" src={coverImage} alt="Cover" />
                    <button
                        className="coverRemove"
                        onClick={() => setCoverImage("")}
                    >
                        <LuTrash2 />
                        Remove Cover
                    </button>
                </div>
            )}
            {uploadCoverDisplay && (
                <FileUpload
                    setDisplay={setUploadCoverDisplay}
                    setImageURL={setCoverImage}
                />
            )}

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

export default BlogFormPage;
