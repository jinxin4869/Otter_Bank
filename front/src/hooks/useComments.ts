import { useState, useCallback } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { mapApiComment, type Comment } from "@/types/post"

// 投稿詳細のコメント一覧と、コメントの投稿・いいね。投稿をまたいで保持し、postId で絞り込んで使う
export function useComments(token: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])

  const fetchComments = useCallback(async (postId: string) => {
    if (!token) return
    try {
      const data = await api.posts.comments.list(token, postId)
      if (data) {
        const fetched = data.map(mapApiComment)
        const fetchedIds = new Set(fetched.map((c) => c.id))
        setComments((prev) => [...prev.filter((c) => c.postId !== postId), ...fetched])
        // 再読み込み後もいいね済みの表示を保つため、サーバーのいいね状態で置き換える
        setLikedCommentIds((prev) => [
          ...prev.filter((id) => !fetchedIds.has(id)),
          ...fetched.filter((c) => c.likedByMe).map((c) => c.id),
        ])
      }
    } catch (err) {
      console.error("コメント取得エラー:", err)
    }
  }, [token])

  /** 投稿に成功したら true（呼び出し元は投稿のコメント数を進める） */
  const addComment = useCallback(async (postId: string, content: string) => {
    if (!token) return false
    try {
      const newComment = await api.posts.comments.create(token, postId, content)
      if (newComment) {
        setComments((prev) => [...prev, mapApiComment(newComment)])
      }
      toast.success("コメントを投稿しました")
      return true
    } catch {
      toast.error("コメントの投稿に失敗しました")
      return false
    }
  }, [token])

  const toggleCommentLike = useCallback(async (postId: string, commentId: string) => {
    if (!token) return
    const isCurrentlyLiked = likedCommentIds.includes(commentId)
    try {
      if (isCurrentlyLiked) {
        await api.posts.comments.unlike(token, postId, commentId)
        setLikedCommentIds((prev) => prev.filter((id) => id !== commentId))
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
        )
        toast.success("コメントのいいねを取り消しました")
      } else {
        await api.posts.comments.like(token, postId, commentId)
        setLikedCommentIds((prev) => [...prev, commentId])
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
        )
        toast.success("コメントにいいねしました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }, [token, likedCommentIds])

  const commentsFor = useCallback(
    (postId: string): Comment[] =>
      comments
        .filter((comment) => comment.postId === postId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  )

  return { likedCommentIds, fetchComments, addComment, toggleCommentLike, commentsFor }
}
