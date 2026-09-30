"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import { useAuth } from "@/hooks/useAuth"
import { usePosts } from "@/hooks/usePosts"
import { useComments } from "@/hooks/useComments"
import { type Post } from "@/types/post"
import type { PostListFilters } from "@/lib/api"
import { BOARD_CATEGORIES, SORT_OPTIONS, getCategoryColor } from "./_components/board-constants"
import { TIER_CONFIG, isAchievementTier } from "@/lib/tier"
import PostList from "./_components/post-list"
import PostDetailDialog from "./_components/post-detail-dialog"
import CreatePostModal from "./_components/create-post-modal"
import EditPostModal from "./_components/edit-post-modal"

const SEARCH_DEBOUNCE_MS = 300

export default function BoardPage() {
  const router = useRouter()
  const { user, token, isLoading: authIsLoading, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()

  // 表示状態（検索・タブ・カテゴリ・並び替えはサーバーに渡し、全投稿を対象にする）
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("latest")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 1 文字打つごとに取り直さないよう、入力が止まってから検索する
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const postFilters = useMemo<PostListFilters>(() => {
    const term = debouncedSearchTerm.toLowerCase()
    return {
      q: debouncedSearchTerm || undefined,
      // 「投資」などカテゴリ名での検索も、そのカテゴリの投稿として拾う（保存値は "investment" など）
      searchCategories: term
        ? BOARD_CATEGORIES.filter((cat) => cat.label.toLowerCase().includes(term)).map((cat) => cat.value)
        : undefined,
      category: activeTab === "all" ? undefined : activeTab,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      sort: sortOption,
    }
  }, [debouncedSearchTerm, activeTab, selectedCategories, sortOption])
  const {
    posts,
    likedPostIds,
    bookmarkedPostIds,
    isLoading: isPostsLoading,
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
  } = usePosts(token, isAuthenticated, postFilters)
  const { likedCommentIds, fetchComments, addComment, toggleCommentLike, commentsFor } = useComments(token)

  // ダイアログの状態
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [isPostDetailDialogOpen, setIsPostDetailDialogOpen] = useState(false)

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
    // URL の値は未検証の文字列なので、ティアの定義に無ければそのまま使う
    const tier = shareTier ? (isAchievementTier(shareTier) ? TIER_CONFIG[shareTier].label : shareTier) : null
    const tierTag = tier ? ` #${tier}` : ""

    setShareInitialTitle(`「${shareTitle}」を達成しました！`)
    setShareInitialContent(`「${shareTitle}」を達成しました！🦦${tierTag}\n\n`)
    setShareInitialCategories(["experience"])
    setIsNewPostDialogOpen(true)
  }, [searchParams])

  const handleAddPost = useCallback(async (title: string, content: string, categories: string[]) => {
    if (await createPost(title, content, categories)) setIsNewPostDialogOpen(false)
  }, [createPost])

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post)
    setIsEditPostDialogOpen(true)
  }, [])

  const handleSaveEdit = useCallback(async (postId: string, title: string, content: string, categories: string[]) => {
    if (await updatePost(postId, title, content, categories)) {
      setEditingPost(null)
      setIsEditPostDialogOpen(false)
    }
  }, [updatePost])

  const handleViewPost = useCallback(async (post: Post) => {
    setSelectedPost(post)
    setIsPostDetailDialogOpen(true)
    await incrementViews(post.id)
    await fetchComments(post.id)
  }, [incrementViews, fetchComments])

  const handleAddComment = useCallback(async (content: string) => {
    if (!selectedPost) return
    if (await addComment(selectedPost.id, content)) incrementCommentCount(selectedPost.id)
  }, [selectedPost, addComment, incrementCommentCount])

  const handleLikeComment = useCallback((commentId: string) => {
    if (!selectedPost) return
    void toggleCommentLike(selectedPost.id, commentId)
  }, [selectedPost, toggleCommentLike])

  const handleDeletePost = async () => {
    if (!deletingPostId) return
    if (await deletePost(deletingPostId)) {
      setDeletingPostId(null)
      setIsDeleteDialogOpen(false)
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
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
        <Button onClick={() => setIsNewPostDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
            <SelectContent>
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
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-none">
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
            posts={posts}
            isLoading={isPostsLoading}
            likedPostIds={likedPostIds}
            bookmarkedPostIds={bookmarkedPostIds}
            currentUserId={user?.id}
            onLike={toggleLike}
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
              posts={posts}
              isLoading={isPostsLoading}
              likedPostIds={likedPostIds}
              bookmarkedPostIds={bookmarkedPostIds}
              currentUserId={user?.id}
              onLike={toggleLike}
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
              onClick={loadMore}
              disabled={isLoadingMore || isPostsLoading}
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
        comments={selectedPost ? commentsFor(selectedPost.id) : []}
        currentUserEmail={user?.email || ""}
        currentUserId={user?.id}
        likedCommentIds={likedCommentIds}
        onOpenChange={setIsPostDetailDialogOpen}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      {/* 削除確認ダイアログ */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-popover text-popover-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。投稿とそのすべてのコメントが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* フィルターダイアログ */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-popover text-popover-foreground">
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
            <Button variant="outline" onClick={() => setSelectedCategories([])}>
              リセット
            </Button>
            <Button className="hover:bg-primary/90" onClick={() => setIsFilterDialogOpen(false)}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
