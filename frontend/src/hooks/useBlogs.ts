import { useInfiniteQuery, type InfiniteData, type UseInfiniteQueryResult } from "@tanstack/react-query"
import api from "../apis/api"

export type Blog = {
  id: string
  user_id: string
  title: string
  content: string
  cover: string
  created_at: string
  author_name: string
  profile_picture: string | null
  liked_count: number
  disliked_count: number
  comment_count: number
}

type PageData = {
  total_count: number
  blogs: Blog[]
  hasMore: boolean
  next_cursor: string|null
}
export type QueryData = UseInfiniteQueryResult<InfiniteData<PageData, unknown>, Error>

const useBlogs = (
  searchParams: URLSearchParams,
  enabled: boolean = true,
  author?: string,
) => {
  const limit = searchParams.get("limit") ?? "10"
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "recent"
  const qkey = ["blogs",limit,search,sort,author]
  return useInfiniteQuery({
    queryKey:qkey,
    queryFn:async({pageParam}:any):Promise<PageData> => {
      const response = await api.get("/blog/blogs",{params:{cursor:pageParam,limit,search,sort,author}})
      return response.data
    },
    enabled: enabled,
    initialPageParam:null,
    getNextPageParam:(lastPage) => lastPage.hasMore ? (lastPage.next_cursor) : undefined
  })
}

export default useBlogs
