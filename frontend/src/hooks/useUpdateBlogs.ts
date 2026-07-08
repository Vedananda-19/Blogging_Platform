import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apis/api";

const useUpdateBlogs = () => {
    const queryClient = useQueryClient();

    // Refresh both the blog lists/detail (counts) and the user's interaction
    // sets (button highlights) after any like / dislike / save.
    const invalidate = () => {
        ["blogs", "blog", "likedBlogs", "dislikedBlogs", "savedBlogs"].forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
        );
    };

    const likeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/like/${blog_id}`);
        },
        onSuccess: invalidate,
    });

    const dislikeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/dislike/${blog_id}`);
        },
        onSuccess: invalidate,
    });

    const saveMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/save/${blog_id}`);
        },
        onSuccess: invalidate,
    });

    return { likeMutationResult, dislikeMutationResult, saveMutationResult };
};

export default useUpdateBlogs;
