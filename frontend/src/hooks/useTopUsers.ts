import { useQuery } from "@tanstack/react-query";
import api from "../apis/api";

const useTopUsers = () =>
    useQuery<string[]>({
        queryKey: ["topUsers"],
        queryFn: async () => {
            const response = await api.get("/user/top");
            return response.data;
        },
    });

export default useTopUsers;
