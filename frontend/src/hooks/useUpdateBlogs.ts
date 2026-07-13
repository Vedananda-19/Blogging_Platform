import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../apis/api";
import type { CommentModel } from "../components/CommentSection";

const useUpdateBlogs = () => {
    const queryClient = useQueryClient();

    // These are helper functions
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

    const snapshot = (key: string[]) =>
        queryClient.getQueryData<string[]>(key) ?? [];

    const setNewIds = (key: string[], id: string, list: string[]) =>
        queryClient.setQueryData(
            key,
            list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
        );

    const likeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/like/${blog_id}`);
        },
        onMutate: async (blog_id) => {
            await queryClient.cancelQueries({ queryKey: ["likedBlogs"] });
            await queryClient.cancelQueries({ queryKey: ["dislikedBlogs"] });
            const prevLiked = snapshot(["likedBlogs"]);
            const prevDisliked = snapshot(["dislikedBlogs"]);
            const isLiked = prevLiked.includes(blog_id);
            queryClient.setQueryData(
                ["likedBlogs"],
                isLiked
                    ? prevLiked.filter((x) => x !== blog_id)
                    : [...prevLiked, blog_id],
            );
            if (!isLiked)
                queryClient.setQueryData(
                    ["dislikedBlogs"],
                    prevDisliked.filter((x) => x !== blog_id),
                );
            return { prevLiked, prevDisliked };
        },
        onError: (_e, _v, ctx) => {
            if (!ctx) return;
            queryClient.setQueryData(["likedBlogs"], ctx.prevLiked);
            queryClient.setQueryData(["dislikedBlogs"], ctx.prevDisliked);
        },
        onSettled: () => {
            invalidateBlogs();
            invalidateReactions();
        },
    });

    const dislikeMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/dislike/${blog_id}`);
        },
        onMutate: async (blog_id) => {
            await queryClient.cancelQueries({ queryKey: ["likedBlogs"] });
            await queryClient.cancelQueries({ queryKey: ["dislikedBlogs"] });
            const prevLiked = snapshot(["likedBlogs"]);
            const prevDisliked = snapshot(["dislikedBlogs"]);
            const isDisliked = prevDisliked.includes(blog_id);
            queryClient.setQueryData(
                ["dislikedBlogs"],
                isDisliked
                    ? prevDisliked.filter((x) => x !== blog_id)
                    : [...prevDisliked, blog_id],
            );
            if (!isDisliked)
                queryClient.setQueryData(
                    ["likedBlogs"],
                    prevLiked.filter((x) => x !== blog_id),
                );
            return { prevLiked, prevDisliked };
        },
        onError: (_e, _v, ctx) => {
            if (!ctx) return;
            queryClient.setQueryData(["likedBlogs"], ctx.prevLiked);
            queryClient.setQueryData(["dislikedBlogs"], ctx.prevDisliked);
        },
        onSettled: () => {
            invalidateBlogs();
            invalidateReactions();
        },
    });

    const saveMutationResult = useMutation({
        mutationFn: async (blog_id: string) => {
            await api.post(`/blog/save/${blog_id}`);
        },
        onMutate: async (blog_id) => {
            await queryClient.cancelQueries({ queryKey: ["savedBlogs"] });
            const prev = snapshot(["savedBlogs"]);
            setNewIds(["savedBlogs"], blog_id, prev);
            return { prev };
        },
        onError: (_e, _v, ctx) => {
            if (ctx) queryClient.setQueryData(["savedBlogs"], ctx.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["savedBlogs"] });
            queryClient.invalidateQueries({ queryKey: ["savedBlogsFull"] });
        },
    });

    const likeCommentMutationResult = useMutation({
        mutationFn: async (comment_id: string) => {
            await api.post(`/blog/like-comment/${comment_id}`);
        },
        onMutate: async (comment_id) => {
            await queryClient.cancelQueries({ queryKey: ["likedComments"] });
            const prev = snapshot(["likedComments"]);
            setNewIds(["likedComments"], comment_id, prev);
            return { prev };
        },
        onError: (_e, _v, ctx) => {
            if (ctx) queryClient.setQueryData(["likedComments"], ctx.prev);
        },
        onSettled: () => {
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
            const prev = snapshot(["following"]);
            setNewIds(["following"], author_id, prev);
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
