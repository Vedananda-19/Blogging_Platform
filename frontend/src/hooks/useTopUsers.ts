import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";

// Top authors by score (posts + followers + likes/5) — returns author ids.
const useTopUsers = () =>
    useQuery<string[]>({
        queryKey: ["topUsers"],
        queryFn: async () => {
            const response = await api.get("/user/top");
            return response.data;
        },
    });

export default useTopUsers;
