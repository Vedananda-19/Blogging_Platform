import { useQuery } from "@tanstack/react-query";
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
    page: number = 1,
    limit: number = 10,
    enabled: boolean = true,
) => {
    return useQuery<CommentsPage>({
        queryKey: ["comments", blog_id, page, limit],
        queryFn: async () => {
            const response = await api.get(`/blog/comments/${blog_id}`, {
                params: { page, limit },
            });
            return response.data;
        },
        enabled: enabled && !!blog_id,
    });
};

export default useBlogComments;
