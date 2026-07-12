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

    // Each key is a separate query — invalidate them individually. Passing
    // ["likedBlogs","dislikedBlogs"] as one key matches neither.
    const invalidateReactions = () => {
        ["likedBlogs", "dislikedBlogs", "likedBlogsFull"].forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
        );
    };

    const likeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/like/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs()
            invalidateReactions()
        }
    });

    const dislikeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/dislike/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs()
            invalidateReactions()
        }
    });

    const saveMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/save/${blog_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["savedBlogs"]})
            queryClient.invalidateQueries({queryKey:["savedBlogsFull"]})
        }
    });

    const commentMutationResult = useMutation({
        mutationFn:async (comment:CommentModel) => {
            await api.post(`/blog/comment`,comment);
        },
        onSuccess: (_data, variables) => {
            invalidateBlogs()
            queryClient.invalidateQueries({queryKey:["commentedBlogs"]})
            queryClient.invalidateQueries({queryKey:["commentedBlogsFull"]})
            queryClient.invalidateQueries({queryKey:["comments", variables.blog_id]})
        }
    })

    const deleteMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.delete(`/blog/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs()
            queryClient.invalidateQueries({queryKey:["myBlogs"]})
        }
    })

    return { likeMutationResult, dislikeMutationResult, saveMutationResult, commentMutationResult, deleteMutationResult};
};

export default useUpdateBlogs;
