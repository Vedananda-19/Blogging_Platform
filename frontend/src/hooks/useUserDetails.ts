import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";

export type UserDetails = {
    user_id: string;
    username: string;
    photo_url: string | null;
    follow_count: number;
    following_count: number;
    post_count: number;
    comment_count: number;
    following_author_ids: string[];
};

const useUserDetails = (userId?: string) =>
    useQuery<UserDetails>({
        queryKey: ["userDetails", userId],
        enabled: Boolean(userId),
        queryFn: async () => {
            const response = await api.get(`/user/details/${userId}`);
            return response.data;
        },
    });

export default useUserDetails;
