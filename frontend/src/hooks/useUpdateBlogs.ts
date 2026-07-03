import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import api from "../apis/api"

const useUpdateBlogs = () => {
    const queryClient = useQueryClient()
    const likeMutationResult = useMutation({
        mutationFn:async(blog_id:string)=>{
            await api.post(`/blog/like/${blog_id}`)
        },
        onSuccess:()=>{queryClient.invalidateQueries({queryKey:["blogs"]})}
    })
    const dislikeMutationResult = useMutation({
        mutationFn:async(blog_id:string)=>{
            await api.post(`/blog/dislike/${blog_id}`)
        },
        onSuccess:()=>{queryClient.invalidateQueries({queryKey:["blogs"]})}
    })
    return {likeMutationResult,dislikeMutationResult}
}

export default useUpdateBlogs