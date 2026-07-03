import { useEffect, useState } from "react";
import BlogEditor from "../components/BlogEditor";
import api from "../apis/api";
import { toast } from "react-toastify";
import StarterKit from "@tiptap/starter-kit";
import { useEditor, EditorContext} from "@tiptap/react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const CreateBlogPage = () => {
    const [blogTitle, setBlogTitle] = useState("");
    const [errorMsg,setErrorMsg] = useState("");
    const navigate = useNavigate();

    const editor = useEditor({
        extensions: [StarterKit],
        content:`<h5>Write your blog over here...</h5>`,
    });
    const providerValue = useMemo(() => ({ editor }), [editor]);

    useEffect(()=>{setErrorMsg("")},[])

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
            const response = await api.post("/blog/create",blog)
            toast(response.data.message)
        }
        catch(error:any){
            toast(error.response?.data?.detail || "An Error Occured")
        }
        finally{
            setBlogTitle("")
            editor.commands.setContent("")
            setErrorMsg("")
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
            <button onClick={()=>navigate("/")}>Home</button>
        </div>
    );
};

export default CreateBlogPage;
