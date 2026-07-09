import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";
import type { Blog } from "./useBlogs";

const fetchData = (url: string) => async () => {
    const response = await api.get(url);
    return response.data;
};

export type FullList = "myBlogs" | "likedBlogs" | "savedBlogs" | "commentedBlogs";

// Pass a `fullList` to enable that full-blog query. The id-sets (used for
// button highlighting) always load; the heavier full-blog lists only load on
// the profile page that asks for them.
const useUserBlogs = (fullList?: FullList) => {
    const liked = useQuery({ queryKey: ["likedBlogs"],
         queryFn: fetchData("/user/liked") });
    const disliked = useQuery({ queryKey: ["dislikedBlogs"],
         queryFn: fetchData("/user/disliked") });
    const saved = useQuery({ queryKey: ["savedBlogs"],
         queryFn: fetchData("/user/saved") });
    const commented = useQuery({ queryKey: ["commentedBlogs"],
         queryFn: fetchData("/user/commented") });

    const myBlogs = useQuery<Blog[]>({
        queryKey: ["myBlogs"],
        queryFn: fetchData("/user/blogs"),
        enabled: fullList === "myBlogs",
    });
    const likedBlogs = useQuery<Blog[]>({
        queryKey: ["likedBlogsFull"],
        queryFn: fetchData("/user/liked-blogs"),
        enabled: fullList === "likedBlogs",
    });
    const savedBlogs = useQuery<Blog[]>({
        queryKey: ["savedBlogsFull"],
        queryFn: fetchData("/user/saved-blogs"),
        enabled: fullList === "savedBlogs",
    });
    const commentedBlogs = useQuery<Blog[]>({
        queryKey: ["commentedBlogsFull"],
        queryFn: fetchData("/user/commented-blogs"),
        enabled: fullList === "commentedBlogs",
    });

    return {
        likedSet: new Set(liked.data ?? []),
        dislikedSet: new Set(disliked.data ?? []),
        savedSet: new Set(saved.data ?? []),
        commentedSet: new Set(commented.data ?? []),
        myBlogs,
        likedBlogs,
        savedBlogs,
        commentedBlogs,
    };
};

export default useUserBlogs;
