import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../apis/api";

export type Comment = {
    id: string;
    blog_id: string;
    user_id: string;
    comment: string;
    created_at: string;
    comment_likes: number;
    username: string;
    profile_picture: string | null;
};

export type CommentsPage = {
    comments: Comment[];
    comment_count: number;
    page_count: number;
};

const useBlogComments = (
    blog_id: string,
    limit: number = 10,
    enabled: boolean = true,
) => {
    return useInfiniteQuery({
        queryKey: ["comments", blog_id, limit],
        queryFn: async ({ pageParam }): Promise<CommentsPage> => {
            const response = await api.get(`/blog/comments/${blog_id}`, {
                params: { page: pageParam, limit, sort: "top" },
            });
            return response.data;
        },
        enabled: enabled && !!blog_id,
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            allPages.length < lastPage.page_count
                ? allPages.length + 1
                : undefined,
    });
};

export default useBlogComments;
