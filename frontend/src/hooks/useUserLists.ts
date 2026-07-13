import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";
import type { Blog } from "./useBlogs";

const fetchData = (url: string) => async () => {
    const response = await api.get(url);
    return response.data;
};

export type FullList = "myBlogs" | "likedBlogs" | "savedBlogs" | "commentedBlogs";

const useUserLists = (fullList?: FullList) => {
    const liked = useQuery({ queryKey: ["likedBlogs"],
         queryFn: fetchData("/user/liked") });
    const disliked = useQuery({ queryKey: ["dislikedBlogs"],
         queryFn: fetchData("/user/disliked") });
    const saved = useQuery({ queryKey: ["savedBlogs"],
         queryFn: fetchData("/user/saved") });
    const commented = useQuery({ queryKey: ["commentedBlogs"],
         queryFn: fetchData("/user/commented") });
    const following = useQuery({ queryKey: ["following"],
         queryFn: fetchData("/user/following") });
    const likedComments = useQuery({ queryKey: ["likedComments"],
         queryFn: fetchData("/user/liked-comments") });

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
        likedSet: new Set<string>(liked.data ?? []),
        dislikedSet: new Set<string>(disliked.data ?? []),
        savedSet: new Set<string>(saved.data ?? []),
        commentedSet: new Set<string>(commented.data ?? []),
        followingSet: new Set<string>(following.data ?? []),
        likedCommentsSet: new Set<string>(likedComments.data ?? []),
        myBlogs,
        likedBlogs,
        savedBlogs,
        commentedBlogs,
    };
};

export default useUserLists;
