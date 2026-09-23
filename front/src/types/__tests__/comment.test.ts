import { mapApiComment } from "@/types/post"

describe("mapApiComment", () => {
  it("自分のいいね状態をキャメルケースで持つ", () => {
    expect(
      mapApiComment({
        id: 1,
        post_id: 2,
        content: "コメント",
        author: "devuser",
        user_id: 3,
        likes_count: 4,
        liked_by_me: true,
        created_at: "2026-09-23T00:00:00Z",
      })
    ).toEqual({
      id: "1",
      postId: "2",
      content: "コメント",
      author: "devuser",
      userId: 3,
      createdAt: "2026-09-23T00:00:00Z",
      likes: 4,
      likedByMe: true,
    })
  })

  it("liked_by_me が無い古いレスポンスでは false にする", () => {
    const comment = mapApiComment({
      id: 1, post_id: 2, content: "c", author: "a", user_id: 3, likes_count: 0, created_at: "",
    })
    expect(comment.likedByMe).toBe(false)
  })
})
