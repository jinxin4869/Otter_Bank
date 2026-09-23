import { mapApiPost, mapApiPostsResponse } from "@/types/post"
import type { ApiPost } from "@/types/post"

const apiPost = (overrides: Partial<ApiPost> = {}): ApiPost => ({
  id: 1,
  title: "タイトル",
  content: "本文",
  author: "devuser",
  user_id: 10,
  categories: ["節約"],
  likes_count: 3,
  comments_count: 2,
  views_count: 5,
  liked_by_me: true,
  bookmarked_by_me: false,
  created_at: "2026-09-23T00:00:00Z",
  ...overrides,
})

describe("mapApiPost", () => {
  it("自分のいいね・ブックマーク状態をキャメルケースで持つ", () => {
    expect(mapApiPost(apiPost())).toMatchObject({ id: "1", likedByMe: true, bookmarkedByMe: false })
  })
})

describe("mapApiPostsResponse", () => {
  it("投稿一覧とページ情報をキャメルケースへ変換する", () => {
    const result = mapApiPostsResponse({
      posts: [apiPost(), apiPost({ id: 2, liked_by_me: false, bookmarked_by_me: true })],
      meta: { current_page: 1, total_pages: 3, total_count: 50, per_page: 20 },
    })
    expect(result.posts.map((p) => p.id)).toEqual(["1", "2"])
    expect(result.meta).toEqual({ currentPage: 1, totalPages: 3, totalCount: 50, perPage: 20 })
  })
})
