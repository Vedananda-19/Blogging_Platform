import { useQuery } from "@tanstack/react-query"
import api from "../apis/api"

type Blog = {
  id: string
  title: string
  content: string
  author: string
  liked_count: number
  disliked_count: number
  comment_count: number
}

type PageData = {
  page: number
  page_count: number
  blogs: Blog[]
}

const useBlogs = (searchParams:URLSearchParams,filter:boolean = false) => {
  const page = searchParams.get("page") ?? "1"
  const limit = searchParams.get("limit") ?? "10"
  return useQuery({
    queryKey:["blogs",page,limit,filter],
    queryFn:async():Promise<PageData> => {
      const response = await api.get("/blog/blogs",{params:{page,limit}})
      return response.data
    }
  })
}

export default useBlogs