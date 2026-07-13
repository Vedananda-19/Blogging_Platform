import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apis/api";
import type { CommentModel } from "../components/CommentSection";

const useUpdateBlogs = () => {
    const queryClient = useQueryClient();

    const invalidateBlogs = () => {
        ["blogs", "blog"].forEach((key) =>
            queryClient.invalidateQueries({ queryKey: [key] }),
        );
    };

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
            invalidateBlogs();
            invalidateReactions();
        },
    });

    const dislikeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/dislike/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs();
            invalidateReactions();
        },
    });

    const saveMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/save/${blog_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["savedBlogs"] });
            queryClient.invalidateQueries({ queryKey: ["savedBlogsFull"] });
        },
    });

    const likeCommentMutationResult = useMutation({
        mutationFn: async (comment_id: string) => {
            await api.post(`/blog/like-comment/${comment_id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["likedComments"] });
            queryClient.invalidateQueries({ queryKey: ["comments"] });
        },
    });

    const followMutationResult = useMutation({
        mutationFn: async (author_id: string) => {
            await api.post(`/user/follow/${author_id}`);
        },
        onMutate: async (author_id) => {
            await queryClient.cancelQueries({ queryKey: ["following"] });
            const prev =
                queryClient.getQueryData<string[]>(["following"]) ?? [];
            queryClient.setQueryData(
                ["following"],
                prev.includes(author_id)
                    ? prev.filter((x) => x !== author_id)
                    : [...prev, author_id],
            );
            return { prev };
        },
        onError: (_e, _v, ctx) => {
            if (ctx) queryClient.setQueryData(["following"], ctx.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["following"] });
            queryClient.invalidateQueries({ queryKey: ["userDetails"] });
            invalidateBlogs();
        },
    });

    const commentMutationResult = useMutation({
        mutationFn: async (comment: CommentModel) => {
            await api.post(`/blog/comment`, comment);
        },
        onSuccess: (_data, variables) => {
            invalidateBlogs();
            queryClient.invalidateQueries({ queryKey: ["commentedBlogs"] });
            queryClient.invalidateQueries({ queryKey: ["commentedBlogsFull"] });
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.blog_id],
            });
        },
    });

    const deleteMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.delete(`/blog/${blog_id}`);
        },
        onSuccess: () => {
            invalidateBlogs();
            queryClient.invalidateQueries({ queryKey: ["myBlogs"] });
        },
    });

    return { likeMutationResult, dislikeMutationResult, saveMutationResult, commentMutationResult, deleteMutationResult, followMutationResult, likeCommentMutationResult};
};

export default useUpdateBlogs;
