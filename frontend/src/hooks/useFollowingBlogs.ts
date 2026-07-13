import { useInfiniteQuery } from "@tanstack/react-query"
import api from "../apis/api"
import type { Blog } from "./useBlogs"

type PageData = {
  total_count: number
  blogs: Blog[]
  hasMore: boolean
  next_cursor: string|null
}

const useFollowingBlogs = (searchParams:URLSearchParams,enabled:boolean=true) => {
  const limit = searchParams.get("limit") ?? "10"
  const search = searchParams.get("search") || ""
  const sort = searchParams.get("sort") || "recent"
  const qkey = ["blogs",limit,search,sort,"following"]
  return useInfiniteQuery({
    queryKey:qkey,
    queryFn:async({pageParam}:any):Promise<PageData> => {
      const response = await api.get("/blog/blogs/following",{params:{cursor:pageParam,limit,search,sort}})
      return response.data
    },
    enabled: enabled,
    initialPageParam:null,
    getNextPageParam:(lastPage) => lastPage.hasMore ? (lastPage.next_cursor) : undefined
  })
}

export default useFollowingBlogs