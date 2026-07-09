import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apis/api";
import type {CommentModel} from "../components/CommentSection"

const useUpdateBlogs = () => {
    const queryClient = useQueryClient();

    const invalidateBlogs = () => {
        ["blogs", "blog"].forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
        );
    };

    const likeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/like/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs()
            queryClient.invalidateQueries({queryKey:["likedBlogs","dislikedBlogs"]})
        }
    });

    const dislikeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/dislike/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs()
            queryClient.invalidateQueries({queryKey:["likedBlogs","dislikedBlogs"]})
        }
    });

    const saveMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/save/${blog_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["savedBlogs"]})
        }
    });

    const commentMutationResult = useMutation({
        mutationFn:async (comment:CommentModel) => {
            await api.post(`/blog/comment`,comment);
        },
        onSuccess: (_data, variables) => {
            invalidateBlogs()
            queryClient.invalidateQueries({queryKey:["commentedBlogs"]})
            queryClient.invalidateQueries({queryKey:["comments", variables.blog_id]})
        }
    })

    return { likeMutationResult, dislikeMutationResult, saveMutationResult, commentMutationResult};
};

export default useUpdateBlogs;
