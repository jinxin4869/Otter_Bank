"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Filter, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { mapApiPost, mapApiComment, type Post, type Comment } from "@/types/post"
import { BOARD_CATEGORIES, SORT_OPTIONS, getCategoryColor } from "./_components/board-constants"
import PostList from "./_components/post-list"
import PostDetailDialog from "./_components/post-detail-dialog"
import CreatePostModal from "./_components/create-post-modal"
import EditPostModal from "./_components/edit-post-modal"

export default function BoardPage() {
  const router = useRouter()
  const { user, token, isLoading: authIsLoading, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  const [posts, setPosts] = useState<Post[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>([])
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // ダイアログの状態
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isPostDetailDialogOpen, setIsPostDetailDialogOpen] = useState(false)

  // 表示状態
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("latest")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 操作対象の投稿
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // 実績シェアの初期値
  const [shareInitialTitle, setShareInitialTitle] = useState("")
  const [shareInitialContent, setShareInitialContent] = useState("")
  const [shareInitialCategories, setShareInitialCategories] = useState<string[]>([])

  // 認証チェック
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authIsLoading, isAuthenticated, router])

  // 実績シェアのクエリパラメータ処理
  const hasProcessedShareParams = useRef(false)
  useEffect(() => {
    const shareTitle = searchParams.get("shareTitle")
    const shareTier = searchParams.get("shareTier")
    if (!shareTitle || hasProcessedShareParams.current) return

    hasProcessedShareParams.current = true
    const tierLabel: Record<string, string> = {
      bronze: "ブロンズ",
      silver: "シルバー",
      gold: "ゴールド",
      platinum: "プラチナ",
    }
    const tier = shareTier ? (tierLabel[shareTier] ?? shareTier) : null
    const tierTag = tier ? ` #${tier}` : ""

    setShareInitialTitle(`「${shareTitle}」を達成しました！`)
    setShareInitialContent(`「${shareTitle}」を達成しました！🦦${tierTag}\n\n`)
    setShareInitialCategories(["experience"])
    setIsNewPostDialogOpen(true)
  }, [searchParams])

  const fetchPosts = useCallback(async () => {
    if (!token) return
    setIsPostsLoading(true)
    try {
      const data = await api.posts.list(token, 1)
      if (data) {
        setPosts(data.posts.map(mapApiPost))
        setLikedPostIds(data.posts.filter((p) => p.liked_by_me).map((p) => String(p.id)))
        setBookmarkedPosts(data.posts.filter((p) => p.bookmarked_by_me).map((p) => String(p.id)))
        setCurrentPage(1)
        setTotalPages(data.meta.total_pages)
      }
    } catch (err) {
      console.error("投稿取得エラー:", err)
      toast.error("投稿の取得に失敗しました")
    } finally {
      setIsPostsLoading(false)
    }
  }, [token])

  const handleLoadMore = async () => {
    if (!token || isLoadingMore || currentPage >= totalPages) return
    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    try {
      const data = await api.posts.list(token, nextPage)
      if (data) {
        setPosts((prev) => [...prev, ...data.posts.map(mapApiPost)])
        setLikedPostIds((prev) => [
          ...prev,
          ...data.posts.filter((p) => p.liked_by_me).map((p) => String(p.id)),
        ])
        setBookmarkedPosts((prev) => [
          ...prev,
          ...data.posts.filter((p) => p.bookmarked_by_me).map((p) => String(p.id)),
        ])
        setCurrentPage(nextPage)
        setTotalPages(data.meta.total_pages)
      }
    } catch (err) {
      console.error("追加読み込みエラー:", err)
      toast.error("投稿の読み込みに失敗しました")
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPosts()
    }
  }, [isAuthenticated, token, fetchPosts])

  const handleLike = useCallback(async (postId: string) => {
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

  const filterAndSortPosts = useCallback(() => {
    let filtered = [...posts]
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.content.toLowerCase().includes(term) ||
          post.author.toLowerCase().includes(term) ||
          post.category.some((category) =>
            BOARD_CATEGORIES.find((cat) => cat.value === category)?.label.toLowerCase().includes(term)
          )
      )
    }
    if (activeTab !== "all") {
      filtered = filtered.filter((post) => post.category.includes(activeTab))
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) =>
        post.category.some((category) => selectedCategories.includes(category))
      )
    }
    switch (sortOption) {
      case "latest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "popular":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "comments":
        filtered.sort((a, b) => b.comments - a.comments)
        break
    }
    setFilteredPosts(filtered)
  }, [posts, searchTerm, activeTab, selectedCategories, sortOption])

  useEffect(() => {
    filterAndSortPosts()
  }, [filterAndSortPosts])

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!token) return
    const isBookmarked = bookmarkedPosts.includes(postId)
    try {
      if (isBookmarked) {
        await api.posts.unbookmark(token, postId)
        setBookmarkedPosts((prev) => prev.filter((id) => id !== postId))
        toast.success("ブックマークを削除しました")
      } else {
        await api.posts.bookmark(token, postId)
        setBookmarkedPosts((prev) => [...prev, postId])
        toast.success("ブックマークに追加しました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }, [token, bookmarkedPosts])

  const handleAddPost = useCallback(async (title: string, content: string, categories: string[]) => {
    if (!token) return
    try {
      const newPost = await api.posts.create(token, {
        title,
        content,
        category_names: categories,
      })
      if (newPost) {
        setPosts((prev) => [mapApiPost(newPost), ...prev])
      }
      setIsNewPostDialogOpen(false)
      toast.success("投稿が完了しました", { description: "あなたの投稿が掲示板に追加されました。" })
    } catch {
      toast.error("投稿の作成に失敗しました")
    }
  }, [token])

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post)
    setIsEditPostDialogOpen(true)
  }, [])

  const handleSaveEdit = useCallback(async (postId: string, title: string, content: string, categories: string[]) => {
    if (!token) return
    try {
      const updated = await api.posts.update(token, postId, {
        title,
        content,
        category_names: categories,
      })
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? mapApiPost(updated) : p)))
      }
      setEditingPost(null)
      setIsEditPostDialogOpen(false)
      toast.success("投稿を更新しました")
    } catch {
      toast.error("投稿の更新に失敗しました")
    }
  }, [token])

  const handleViewPost = useCallback(async (post: Post) => {
    setSelectedPost(post)
    setIsPostDetailDialogOpen(true)
    if (!token) return
    try {
      await api.posts.incrementViews(token, post.id)
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)))
    } catch { /* 閲覧数エラーは無視 */ }
    try {
      const data = await api.posts.comments.list(token, post.id)
      if (data) {
        setComments((prev) => [
          ...prev.filter((c) => c.postId !== post.id),
          ...data.map(mapApiComment),
        ])
      }
    } catch (err) {
      console.error("コメント取得エラー:", err)
    }
  }, [token])

  const handleAddComment = useCallback(async (content: string) => {
    if (!selectedPost || !token) {
      toast.error("コメント内容を入力してください")
      return
    }
    try {
      const newComment = await api.posts.comments.create(token, selectedPost.id, content)
      if (newComment) {
        setComments((prev) => [...prev, mapApiComment(newComment)])
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p))
        )
      }
      toast.success("コメントを投稿しました")
    } catch {
      toast.error("コメントの投稿に失敗しました")
    }
  }, [selectedPost, token])

  const handleLikeComment = useCallback(async (commentId: string) => {
    if (!selectedPost || !token) return
    const isCurrentlyLiked = likedCommentIds.includes(commentId)
    try {
      if (isCurrentlyLiked) {
        await api.posts.comments.unlike(token, selectedPost.id, commentId)
        setLikedCommentIds((prev) => prev.filter((id) => id !== commentId))
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
        )
        toast.success("コメントのいいねを取り消しました")
      } else {
        await api.posts.comments.like(token, selectedPost.id, commentId)
        setLikedCommentIds((prev) => [...prev, commentId])
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
        )
        toast.success("コメントにいいねしました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }, [selectedPost, token, likedCommentIds])

  const getPostComments = (postId: string): Comment[] =>
    comments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const handleDeletePost = async () => {
    if (!deletingPostId || !token) return
    try {
      await api.posts.delete(token, deletingPostId)
      setPosts((prev) => prev.filter((post) => post.id !== deletingPostId))
      setDeletingPostId(null)
      setIsDeleteDialogOpen(false)
      toast.success("投稿を削除しました")
    } catch {
      toast.error("削除に失敗しました")
    }
  }

  const openDeleteDialog = useCallback((postId: string) => {
    setDeletingPostId(postId)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleEditModalClose = (open: boolean) => {
    setIsEditPostDialogOpen(open)
    if (!open) setEditingPost(null)
  }

  if (authIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">掲示板</h1>
          <p className="text-muted-foreground">お金の管理や貯金のコツ、投資の経験などを共有しましょう</p>
        </div>
        <Button onClick={() => setIsNewPostDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          新規投稿
        </Button>
      </div>

      {/* 検索とフィルター */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="「気になるトピックを検索してください、検索: 節約、投資、家計管理」"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent className="board-dialog-content">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsFilterDialogOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            フィルター
          </Button>
        </div>
      </div>

      {/* カテゴリータブ */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex flex-wrap justify-center">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {BOARD_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className={activeTab === category.value ? getCategoryColor(category.value) : ""}
            >
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PostList
            posts={filteredPosts}
            isLoading={isPostsLoading}
            likedPostIds={likedPostIds}
            bookmarkedPostIds={bookmarkedPosts}
            currentUserId={user?.id}
            onLike={handleLike}
            onBookmark={toggleBookmark}
            onView={handleViewPost}
            onEdit={handleEditPost}
            onDeleteRequest={openDeleteDialog}
            onCreatePost={() => setIsNewPostDialogOpen(true)}
          />
        </TabsContent>

        {BOARD_CATEGORIES.map((category) => (
          <TabsContent key={category.value} value={category.value} className="mt-6">
            <PostList
              posts={filteredPosts}
              isLoading={isPostsLoading}
              likedPostIds={likedPostIds}
              bookmarkedPostIds={bookmarkedPosts}
              currentUserId={user?.id}
              onLike={handleLike}
              onBookmark={toggleBookmark}
              onView={handleViewPost}
              onEdit={handleEditPost}
              onDeleteRequest={openDeleteDialog}
              onCreatePost={() => setIsNewPostDialogOpen(true)}
            />
          </TabsContent>
        ))}

        {/* もっと読み込む */}
        {currentPage < totalPages && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="min-w-32"
            >
              {isLoadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `もっと見る（${currentPage}/${totalPages}ページ）`
              )}
            </Button>
          </div>
        )}
      </Tabs>

      {/* 新規投稿モーダル */}
      <CreatePostModal
        isOpen={isNewPostDialogOpen}
        onOpenChange={setIsNewPostDialogOpen}
        onSubmit={handleAddPost}
        initialTitle={shareInitialTitle}
        initialContent={shareInitialContent}
        initialCategories={shareInitialCategories}
      />

      {/* 編集モーダル */}
      <EditPostModal
        isOpen={isEditPostDialogOpen}
        post={editingPost}
        onOpenChange={handleEditModalClose}
        onSubmit={handleSaveEdit}
      />

      {/* 投稿詳細ダイアログ */}
      <PostDetailDialog
        post={selectedPost}
        isOpen={isPostDetailDialogOpen}
        comments={selectedPost ? getPostComments(selectedPost.id) : []}
        currentUserEmail={user?.email || ""}
        currentUserId={user?.id}
        likedCommentIds={likedCommentIds}
        onOpenChange={setIsPostDetailDialogOpen}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="board-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。投稿とそのすべてのコメントが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* フィルターダイアログ */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px] board-dialog-content">
          <DialogHeader>
            <DialogTitle>投稿のフィルター</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>カテゴリー</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_CATEGORIES.map((category) => (
                  <Badge
                    key={category.value}
                    variant={selectedCategories.includes(category.value) ? "default" : "outline"}
                    className={`cursor-pointer ${selectedCategories.includes(category.value) ? getCategoryColor(category.value) : ""}`}
                    aria-pressed={selectedCategories.includes(category.value)}
                    onClick={() => {
                      if (selectedCategories.includes(category.value)) {
                        setSelectedCategories((prev) => prev.filter((c) => c !== category.value))
                      } else {
                        setSelectedCategories((prev) => [...prev, category.value])
                      }
                    }}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="text-red-300 hover:text-red-400" onClick={() => setSelectedCategories([])}>
              リセット
            </Button>
            <Button className="hover:bg-blue-400" onClick={() => setIsFilterDialogOpen(false)}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
