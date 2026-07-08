import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";

const fetchIds = (url: string) => async () => {
    const response = await api.get(url);
    return response.data;
};

const useUserBlogs = () => {
    const liked = useQuery({ queryKey: ["likedBlogs"],
         queryFn: fetchIds("/user/liked") });
    const disliked = useQuery({ queryKey: ["dislikedBlogs"],
         queryFn: fetchIds("/user/disliked") });
    const saved = useQuery({ queryKey: ["savedBlogs"],
         queryFn: fetchIds("/user/saved") });
    const commented = useQuery({ queryKey: ["commentedBlogs"],
         queryFn: fetchIds("/user/commented") });

    return {
        likedSet: new Set(liked.data ?? []),
        dislikedSet: new Set(disliked.data ?? []),
        savedSet: new Set(saved.data ?? []),
        commentedSet: new Set(commented.data ?? []),
    };
};

export default useUserBlogs;
