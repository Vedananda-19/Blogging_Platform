import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";
import type { Blog } from "./useBlogs";

const useBlog = (id?: string) => {
    return useQuery({
        queryKey: ["blog", id],
        enabled: Boolean(id),
        queryFn: async (): Promise<Blog> => {
            const response = await api.get(`/blog/${id}`);
            return response.data;
        },
    });
};

export default useBlog;
