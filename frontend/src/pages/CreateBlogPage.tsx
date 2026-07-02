import { useState } from "react";
import BlogEditor from "../components/BlogEditor";
import api from "../apis/api";
import { toast } from "react-toastify";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContext} from "@tiptap/react";
import { useMemo } from "react";

const CreateBlogPage = () => {
    const [blogTitle, setBlogTitle] = useState("");
    const [errorMsg,setErrorMsg] = useState("");
    

    const editor = useEditor({
        extensions: [StarterKit],
        content:`<h5>Write your blog over here...</h5>`,
    });
    const providerValue = useMemo(() => ({ editor }), [editor]);

    const handleCreate = async() => {
        if (!blogTitle) {
            setErrorMsg("Title is Required")
            return
        }
        const blog = {
            title:blogTitle,
            content:JSON.stringify(editor.getJSON(),null,2)
        }
        try{
            // const response = await api.post("/blog/create",blog)
            // toast(response.data.message)
            toast("Added Successfully!")
        }
        catch(error:any){
            toast(error.response?.data?.detail || "An Error Occured")
        }
        finally{
            setBlogTitle("")
            editor.commands.setContent("")
        }
    };
    return (
        <div>
            <h1>Create Blog</h1>
            <textarea
                placeholder="Title"
                value={blogTitle}
                onChange={(e) => {
                    setBlogTitle(e.currentTarget.value);
                }}
            />
            <div>
                <EditorContext.Provider value={providerValue}>
                    <BlogEditor/>
                </EditorContext.Provider>
            </div>
            {errorMsg && <p>{errorMsg}</p>}
            <button onClick={handleCreate}>Save Blog</button>
        </div>
    );
};

export default CreateBlogPage;
