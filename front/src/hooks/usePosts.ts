import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { mapApiPost, mapApiPostsResponse, type Post } from "@/types/post"

// 掲示板の投稿一覧と、それに対する操作（ページング・いいね・ブックマーク・作成・更新・削除・閲覧数）
export function usePosts(token: string | null, isAuthenticated: boolean) {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>([])
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPosts = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await api.posts.list(token, 1)
      if (data) {
        const { posts: fetched, meta } = mapApiPostsResponse(data)
        setPosts(fetched)
        setLikedPostIds(fetched.filter((p) => p.likedByMe).map((p) => p.id))
        setBookmarkedPostIds(fetched.filter((p) => p.bookmarkedByMe).map((p) => p.id))
        setCurrentPage(1)
        setTotalPages(meta.totalPages)
      }
    } catch (err) {
      console.error("投稿取得エラー:", err)
      toast.error("投稿の取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPosts()
    }
  }, [isAuthenticated, token, fetchPosts])

  const loadMore = useCallback(async () => {
    if (!token || isLoadingMore || currentPage >= totalPages) return
    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    try {
      const data = await api.posts.list(token, nextPage)
      if (data) {
        const { posts: fetched, meta } = mapApiPostsResponse(data)
        setPosts((prev) => [...prev, ...fetched])
        setLikedPostIds((prev) => [...prev, ...fetched.filter((p) => p.likedByMe).map((p) => p.id)])
        setBookmarkedPostIds((prev) => [...prev, ...fetched.filter((p) => p.bookmarkedByMe).map((p) => p.id)])
        setCurrentPage(nextPage)
        setTotalPages(meta.totalPages)
      }
    } catch (err) {
      console.error("追加読み込みエラー:", err)
      toast.error("投稿の読み込みに失敗しました")
    } finally {
      setIsLoadingMore(false)
    }
  }, [token, isLoadingMore, currentPage, totalPages])

  const toggleLike = useCallback(async (postId: string) => {
    if (!token) return
    const isCurrentlyLiked = likedPostIds.includes(postId)
    try {
      if (isCurrentlyLiked) {
        await api.posts.unlike(token, postId)
        setLikedPostIds((prev) => prev.filter((id) => id !== postId))
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post))
        )
        toast.success("いいねを取り消しました")
      } else {
        await api.posts.like(token, postId)
        setLikedPostIds((prev) => [...prev, postId])
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
        )
        toast.success("いいねしました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }, [token, likedPostIds])

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!token) return
    const isBookmarked = bookmarkedPostIds.includes(postId)
    try {
      if (isBookmarked) {
        await api.posts.unbookmark(token, postId)
        setBookmarkedPostIds((prev) => prev.filter((id) => id !== postId))
        toast.success("ブックマークを削除しました")
      } else {
        await api.posts.bookmark(token, postId)
        setBookmarkedPostIds((prev) => [...prev, postId])
        toast.success("ブックマークに追加しました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }, [token, bookmarkedPostIds])

  /** 作成に成功したら true（呼び出し元はダイアログを閉じる） */
  const createPost = useCallback(async (title: string, content: string, categories: string[]) => {
    if (!token) return false
    try {
      const newPost = await api.posts.create(token, { title, content, category_names: categories })
      if (newPost) {
        setPosts((prev) => [mapApiPost(newPost), ...prev])
      }
      toast.success("投稿が完了しました", { description: "あなたの投稿が掲示板に追加されました。" })
      return true
    } catch {
      toast.error("投稿の作成に失敗しました")
      return false
    }
  }, [token])

  /** 更新に成功したら true */
  const updatePost = useCallback(async (postId: string, title: string, content: string, categories: string[]) => {
    if (!token) return false
    try {
      const updated = await api.posts.update(token, postId, { title, content, category_names: categories })
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? mapApiPost(updated) : p)))
      }
      toast.success("投稿を更新しました")
      return true
    } catch {
      toast.error("投稿の更新に失敗しました")
      return false
    }
  }, [token])

  /** 削除に成功したら true */
  const deletePost = useCallback(async (postId: string) => {
    if (!token) return false
    try {
      await api.posts.delete(token, postId)
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      toast.success("投稿を削除しました")
      return true
    } catch {
      toast.error("削除に失敗しました")
      return false
    }
  }, [token])

  const incrementViews = useCallback(async (postId: string) => {
    if (!token) return
    try {
      await api.posts.incrementViews(token, postId)
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, views: p.views + 1 } : p)))
    } catch { /* 閲覧数エラーは無視 */ }
  }, [token])

  const incrementCommentCount = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)))
  }, [])

  const decrementCommentCount = useCallback((postId: string) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p)))
  }, [])

  return {
    posts,
    likedPostIds,
    bookmarkedPostIds,
    isLoading,
    isLoadingMore,
    currentPage,
    totalPages,
    loadMore,
    toggleLike,
    toggleBookmark,
    createPost,
    updatePost,
    deletePost,
    incrementViews,
    incrementCommentCount,
    decrementCommentCount,
  }
}
