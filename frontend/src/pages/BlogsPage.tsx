import { useNavigate, useSearchParams } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import useBlogs from "../hooks/useBlogs";
import useUpdateBlogs from "../hooks/useUpdateBlogs";

const BlogsPage = () => {
    const navigate = useNavigate();
    const [searchParams,setSearchParams] = useSearchParams()
    const page = Number(searchParams.get("page") ?? "1")

    const updateParams = (name:string,value:string) => {
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev)
            if (value){
                params.set(name,value)
            }else{
                params.delete(name)
            }
            return params
        })
    }

    const renderContent = (content: string) => {
        try {
            return generateHTML(JSON.parse(content), [StarterKit]);
        } catch {
            return "";
        }
    };

    const { data, isLoading, isError } = useBlogs(searchParams)
    const {likeMutationResult,dislikeMutationResult} = useUpdateBlogs()
    const {mutateAsync:likeBlog} = likeMutationResult
    const {mutateAsync:dislikeBlog} = dislikeMutationResult

    return (
        <div className="routeState">
            <h1>Blogs</h1>
            <button className="secondaryButton" onClick={() => navigate("/")}>
                Back Home
            </button>

            {isLoading && <p>Loading blogs...</p>}
            {isError && <p className="errorMessage">Failed to load blogs.</p>}
            {!isLoading && data?.blogs.length === 0 && <p>No blogs yet.</p>}

            <div className="blogList">
                {data?.blogs.map((blog) => (
                    <div className="blogCard" key={blog.id}>
                        <h3>{blog.title}</h3>
                        <p className="blogMeta">by {blog.author}</p>
                        <div
                            className="blogContent"
                            dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }}
                        />
                        <span>
                            <button onClick={()=>{likeBlog(blog.id)}}>Like</button>
                            <p>{blog.liked_count}</p>
                            <button onClick={()=>{dislikeBlog(blog.id)}}>Dislike</button>
                            <p>{blog.disliked_count}</p>
                        </span>
                    </div>
                ))}
            </div>

            {data && data.page_count > 1 && (
                <div className="pagination">
                    <button
                        className="secondaryButton"
                        disabled={page <= 1}
                        onClick={() => updateParams("page", String(page - 1))}
                    >
                        Previous
                    </button>
                    <span>
                        Page {data.page} of {data.page_count}
                    </span>
                    <button
                        className="secondaryButton"
                        disabled={page >= data.page_count}
                        onClick={() => updateParams("page", String(page + 1))}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default BlogsPage;
