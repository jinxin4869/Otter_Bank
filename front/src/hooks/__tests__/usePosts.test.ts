import { renderHook, waitFor, act } from "@testing-library/react"
import { usePosts } from "@/hooks/usePosts"
import { api, type PostListFilters } from "@/lib/api"

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }))
jest.mock("@/lib/api", () => ({ api: { posts: { list: jest.fn(), create: jest.fn() } } }))

const list = api.posts.list as jest.Mock
const create = api.posts.create as jest.Mock

const apiPost = (id: number) => ({
  id, title: `投稿${id}`, content: "本文", author: "otter", user_id: 1, categories: [],
  likes_count: 0, comments_count: 0, views_count: 0, liked_by_me: false, bookmarked_by_me: false,
  created_at: "2026-09-30T00:00:00Z", updated_at: "2026-09-30T00:00:00Z",
})
const page = (ids: number[], totalPages = 1) => ({
  posts: ids.map(apiPost),
  meta: { current_page: 1, total_pages: totalPages, total_count: ids.length, per_page: 20 },
})

describe("usePosts の検索条件", () => {
  beforeEach(() => list.mockReset())

  it("条件をサーバーに渡し、条件が変わったら 1 ページ目から取り直す", async () => {
    list.mockResolvedValue(page([1]))
    const { result, rerender } = renderHook(({ filters }) => usePosts("t", true, filters), {
      initialProps: { filters: { sort: "latest" } as PostListFilters },
    })
    await waitFor(() => expect(result.current.posts.map((p) => p.id)).toEqual(["1"]))
    expect(list).toHaveBeenLastCalledWith("t", 1, 20, { sort: "latest" })

    list.mockResolvedValue(page([2]))
    rerender({ filters: { sort: "popular", q: "節約" } })

    await waitFor(() => expect(result.current.posts.map((p) => p.id)).toEqual(["2"]))
    expect(list).toHaveBeenLastCalledWith("t", 1, 20, { sort: "popular", q: "節約" })
  })

  it("もっと見るでも同じ条件で次のページを取る", async () => {
    list.mockResolvedValue(page([1], 2))
    const filters = { category: "savings" }
    const { result } = renderHook(() => usePosts("t", true, filters))
    await waitFor(() => expect(result.current.posts).toHaveLength(1))

    list.mockResolvedValue(page([2], 2))
    await act(async () => {
      await result.current.loadMore()
    })
    expect(list).toHaveBeenLastCalledWith("t", 2, 20, filters)
    expect(result.current.posts.map((p) => p.id)).toEqual(["1", "2"])
  })

  it("古い条件の応答が後から返っても一覧を上書きしない", async () => {
    let resolveOld: (v: unknown) => void = () => {}
    list.mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve }))
    const { result, rerender } = renderHook(({ filters }) => usePosts("t", true, filters), {
      initialProps: { filters: { q: "古い" } as PostListFilters },
    })

    list.mockResolvedValueOnce(page([2]))
    rerender({ filters: { q: "新しい" } })
    await waitFor(() => expect(result.current.posts.map((p) => p.id)).toEqual(["2"]))

    await act(async () => {
      resolveOld(page([1]))
    })
    expect(result.current.posts.map((p) => p.id)).toEqual(["2"])
  })
})

describe("usePosts の投稿作成", () => {
  beforeEach(() => {
    list.mockReset()
    create.mockReset()
  })

  it("条件なしの新着順なら、作った投稿を先頭に足す（取り直さない）", async () => {
    list.mockResolvedValue(page([1]))
    create.mockResolvedValue(apiPost(9))
    const { result } = renderHook(() => usePosts("t", true))
    await waitFor(() => expect(result.current.posts).toHaveLength(1))

    await act(async () => {
      await result.current.createPost("題", "本文", [])
    })
    expect(result.current.posts.map((p) => p.id)).toEqual(["9", "1"])
    expect(list).toHaveBeenCalledTimes(1)
  })

  it("絞り込み中なら先頭に足さず、条件どおりに取り直す", async () => {
    list.mockResolvedValue(page([1]))
    create.mockResolvedValue(apiPost(9))
    const filters = { category: "savings" }
    const { result } = renderHook(() => usePosts("t", true, filters))
    await waitFor(() => expect(result.current.posts).toHaveLength(1))

    await act(async () => {
      await result.current.createPost("題", "本文", ["investment"])
    })
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2))
    expect(list).toHaveBeenLastCalledWith("t", 1, 20, filters)
    expect(result.current.posts.map((p) => p.id)).toEqual(["1"])
  })
})

describe("usePosts の取り直し中のもっと見る", () => {
  beforeEach(() => list.mockReset())

  it("条件を変えて取り直している間は、続きのページを取らない", async () => {
    list.mockResolvedValue(page([1], 3))
    const { result, rerender } = renderHook(({ filters }) => usePosts("t", true, filters), {
      initialProps: { filters: { sort: "latest" } as PostListFilters },
    })
    await waitFor(() => expect(result.current.posts).toHaveLength(1))

    list.mockImplementation(() => new Promise(() => {})) // 取り直しが終わらない状態にする
    rerender({ filters: { sort: "popular" } })
    await waitFor(() => expect(result.current.isLoading).toBe(true))

    const callsBefore = list.mock.calls.length
    await act(async () => {
      await result.current.loadMore()
    })
    expect(list.mock.calls.length).toBe(callsBefore)
  })
})
