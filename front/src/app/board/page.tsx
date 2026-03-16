"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { MessageSquare, Heart, Search, Filter, Plus, ThumbsUp, MessageCircle, MoreVertical, Edit, Trash2, Bookmark, BookmarkCheck, Send, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api"
import { mapApiPost, mapApiComment, type Post, type Comment } from "@/types/post"

// 掲示板カテゴリー
const BOARD_CATEGORIES = [
  { value: "savings", label: "貯金のコツ" },
  { value: "investment", label: "投資" },
  { value: "budget", label: "予算管理" },
  { value: "debt", label: "借金返済" },
  { value: "income", label: "副収入" },
  { value: "experience", label: "体験談" },
  { value: "question", label: "質問" },
  { value: "other", label: "その他" },
]

// ソートオプション
const SORT_OPTIONS = [
  { value: "latest", label: "新着順" },
  { value: "popular", label: "人気順" },
  { value: "comments", label: "コメント数順" },
]

export default function BoardPage() {
  const router = useRouter()
  const { user, token, isLoading: authIsLoading, isAuthenticated } = useAuth()

  const [posts, setPosts] = useState<Post[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>([])
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])
  const [isPostsLoading, setIsPostsLoading] = useState(false)

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

  // 新規投稿の状態
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategories, setNewPostCategories] = useState<string[]>([])
  const [newCommentContent, setNewCommentContent] = useState("")
  const [titleError, setTitleError] = useState("")
  const [contentError, setContentError] = useState("")
  const [categoryError, setCategoryError] = useState("")

  // 編集・削除対象の投稿
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // 認証チェック
  useEffect(() => {
    if (!authIsLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [authIsLoading, isAuthenticated, router])

  // 投稿一覧を取得
  const fetchPosts = useCallback(async () => {
    if (!token) return
    setIsPostsLoading(true)
    try {
      const data = await api.posts.list(token)
      if (data) {
        setPosts(data.map(mapApiPost))
        setLikedPostIds(data.filter((p) => p.liked_by_me).map((p) => String(p.id)))
        setBookmarkedPosts(data.filter((p) => p.bookmarked_by_me).map((p) => String(p.id)))
      }
    } catch (err) {
      console.error("投稿取得エラー:", err)
      toast.error("投稿の取得に失敗しました")
    } finally {
      setIsPostsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPosts()
    }
  }, [isAuthenticated, token, fetchPosts])

  // いいねの処理
  const handleLike = async (postId: string) => {
    if (!token) return
    const isCurrentlyLiked = likedPostIds.includes(postId)

    try {
      if (isCurrentlyLiked) {
        await api.posts.unlike(token, postId)
      } else {
        await api.posts.like(token, postId)
      }
      if (isCurrentlyLiked) {
        setLikedPostIds((prev) => prev.filter((id) => id !== postId))
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post))
        )
        toast.success("いいねを取り消しました")
      } else {
        setLikedPostIds((prev) => [...prev, postId])
        setPosts((prev) =>
          prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post))
        )
        toast.success("いいねしました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }

  // 投稿のフィルタリングとソート
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

  const toggleCategory = (category: string) => {
    setNewPostCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  useEffect(() => {
    filterAndSortPosts()
  }, [filterAndSortPosts])

  // ブックマークの切り替え
  const toggleBookmark = async (postId: string) => {
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
  }

  // 新規投稿
  const handleAddPost = async () => {
    setTitleError("")
    setContentError("")
    setCategoryError("")

    let hasError = false
    if (!newPostTitle.trim()) { setTitleError("タイトルを入力してください。"); hasError = true }
    if (!newPostContent.trim()) { setContentError("内容を入力してください。"); hasError = true }
    if (newPostCategories.length === 0) { setCategoryError("カテゴリーを1つ以上選択してください。"); hasError = true }
    if (hasError || !token) return

    try {
      const newPost = await api.posts.create(token, {
        title: newPostTitle,
        content: newPostContent,
        category_names: newPostCategories,
      })
      if (newPost) {
        setPosts((prev) => [mapApiPost(newPost), ...prev])
      }
      setNewPostTitle("")
      setNewPostContent("")
      setNewPostCategories([])
      setIsNewPostDialogOpen(false)
      toast.success("投稿が完了しました", { description: "あなたの投稿が掲示板に追加されました。" })
    } catch {
      toast.error("投稿の作成に失敗しました")
    }
  }

  // 投稿の編集を開始
  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setNewPostTitle(post.title)
    setNewPostContent(post.content)
    setNewPostCategories([...post.category])
    setIsEditPostDialogOpen(true)
  }

  // 投稿の編集を保存
  const handleSaveEdit = async () => {
    if (!editingPost || !token) return

    let hasError = false
    if (!newPostTitle.trim()) { toast.error("タイトルが入力されていません"); hasError = true }
    if (!newPostContent.trim()) { toast.error("内容が入力されていません"); hasError = true }
    if (newPostCategories.length === 0) { toast.error("カテゴリーが選択されていません"); hasError = true }
    if (hasError) return

    try {
      const updated = await api.posts.update(token, editingPost.id, {
        title: newPostTitle,
        content: newPostContent,
        category_names: newPostCategories,
      })
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === editingPost.id ? mapApiPost(updated) : p)))
      }
      setNewPostTitle("")
      setNewPostContent("")
      setNewPostCategories([])
      setEditingPost(null)
      setIsEditPostDialogOpen(false)
      toast.success("投稿を更新しました")
    } catch {
      toast.error("投稿の更新に失敗しました")
    }
  }

  // 投稿詳細を表示＋コメント取得
  const handleViewPost = async (post: Post) => {
    setSelectedPost(post)
    setIsPostDetailDialogOpen(true)

    // 閲覧数を増加
    if (token) {
      try {
        await api.posts.incrementViews(token, post.id)
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)))
      } catch { /* 閲覧数エラーは無視 */ }

      // コメント取得
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
    }
  }

  // コメントを追加
  const handleAddComment = async () => {
    if (!selectedPost || !newCommentContent.trim() || !token) {
      toast.error("コメント内容を入力してください")
      return
    }

    try {
      const newComment = await api.posts.comments.create(token, selectedPost.id, newCommentContent)
      if (newComment) {
        setComments((prev) => [...prev, mapApiComment(newComment)])
        setPosts((prev) =>
          prev.map((p) => (p.id === selectedPost.id ? { ...p, comments: p.comments + 1 } : p))
        )
      }
      setNewCommentContent("")
      toast.success("コメントを投稿しました")
    } catch {
      toast.error("コメントの投稿に失敗しました")
    }
  }

  // コメントにいいね
  const handleLikeComment = async (commentId: string) => {
    if (!selectedPost || !token) return
    const isCurrentlyLiked = likedCommentIds.includes(commentId)

    try {
      if (isCurrentlyLiked) {
        await api.posts.comments.unlike(token, selectedPost.id, commentId)
      } else {
        await api.posts.comments.like(token, selectedPost.id, commentId)
      }

      if (isCurrentlyLiked) {
        setLikedCommentIds((prev) => prev.filter((id) => id !== commentId))
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: Math.max(0, c.likes - 1) } : c))
        )
        toast.success("コメントのいいねを取り消しました")
      } else {
        setLikedCommentIds((prev) => [...prev, commentId])
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c))
        )
        toast.success("コメントにいいねしました")
      }
    } catch {
      toast.error("操作に失敗しました")
    }
  }

  const getPostComments = (postId: string) => {
    return comments
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // 投稿の削除
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

  const openDeleteDialog = (postId: string) => {
    setDeletingPostId(postId)
    setIsDeleteDialogOpen(true)
  }

  const isPostOwner = (post: Post) => post.userId === user?.id

  const getUserInitial = (name: string) => name.charAt(0).toUpperCase()

  const getCategoryColor = (categoryValue: string) => {
    switch (categoryValue) {
      case "savings": return "bg-blue-50 text-blue-800 border-blue-200"
      case "investment": return "bg-green-50 text-green-800 border-green-200"
      case "budget": return "bg-purple-50 text-purple-800 border-purple-200"
      case "debt": return "bg-red-50 text-red-800 border-red-200"
      case "income": return "bg-yellow-50 text-yellow-800 border-yellow-200"
      case "experience": return "bg-teal-50 text-teal-800 border-teal-200"
      case "question": return "bg-orange-50 text-orange-800 border-orange-200"
      default: return "bg-cyan-50 text-cyan-800 border-cyan-200"
    }
  }

  const handleNewPostDialogChange = (open: boolean) => {
    setIsNewPostDialogOpen(open)
    if (!open) {
      setTitleError("")
      setContentError("")
      setCategoryError("")
    }
  }

  const handleEditPostDialogChange = (open: boolean) => {
    setIsEditPostDialogOpen(open)
    if (!open) {
      setTitleError("")
      setContentError("")
      setCategoryError("")
      setEditingPost(null)
    }
  }

  // 投稿リストのレンダリング
  const renderPostList = (postsToRender: Post[]) => {
    if (isPostsLoading) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )
    }

    if (postsToRender.length === 0) {
      return (
        <div className="text-center py-10">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">投稿がありません</h3>
          <p className="mt-2 text-muted-foreground">検索条件に一致する投稿がないか、まだ投稿がありません。</p>
          <Button className="mt-4 text-white bg-blue-400 hover:bg-blue-600" onClick={() => setIsNewPostDialogOpen(true)}>
            最初の投稿を作成
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {postsToRender.map((post) => {
          const isLiked = likedPostIds.includes(post.id)
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(post.category || []).map((categoryValue) => {
                      const categoryInfo = BOARD_CATEGORIES.find((cat) => cat.value === categoryValue)
                      return (
                        <Badge
                          key={categoryValue}
                          variant="outline"
                          className={`text-xs ${getCategoryColor(categoryValue)}`}
                        >
                          {categoryInfo?.label || categoryValue}
                        </Badge>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(post.createdAt), "yyyy年MM月dd日", { locale: ja })}
                    </div>
                    {isPostOwner(post) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="board-dialog-content">
                          <DropdownMenuItem onClick={() => handleEditPost(post)}>
                            <Edit className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(post.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                <CardTitle
                  className="text-xl cursor-pointer hover:text-blue-600"
                  onClick={() => handleViewPost(post)}
                >
                  {post.title}
                </CardTitle>
                <div className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">{getUserInitial(post.author)}</AvatarFallback>
                  </Avatar>
                  <CardDescription>{post.author}</CardDescription>
                  {isPostOwner(post) && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      自分の投稿
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="mr-1 h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-1 h-4 w-4" />
                    <span>{post.views}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    いいね
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleBookmark(post.id)}>
                    {bookmarkedPosts.includes(post.id) ? (
                      <BookmarkCheck className="mr-1 h-4 w-4 text-blue-600" />
                    ) : (
                      <Bookmark className="mr-1 h-4 w-4" />
                    )}
                    ブックマーク
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleViewPost(post)}>
                    <MessageSquare className="mr-1 h-4 w-4" />
                    詳細
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )
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
          {renderPostList(filteredPosts)}
        </TabsContent>

        {BOARD_CATEGORIES.map((category) => (
          <TabsContent key={category.value} value={category.value} className="mt-6">
            {renderPostList(filteredPosts)}
          </TabsContent>
        ))}
      </Tabs>

      {/* 新規投稿ダイアログ */}
      <Dialog open={isNewPostDialogOpen} onOpenChange={handleNewPostDialogChange}>
        <DialogContent className="sm:max-w-[600px] board-dialog-content">
          <DialogHeader>
            <DialogTitle>新規投稿</DialogTitle>
            <DialogDescription>
              お金の管理や貯金のコツ、投資の経験などを共有しましょう。質問も歓迎です。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="投稿のタイトルを入力"
                maxLength={100}
              />
              {titleError && <p className="text-sm text-red-500">{titleError}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>カテゴリー</Label>
            <div className="flex flex-wrap gap-2">
              {BOARD_CATEGORIES.map((category) => (
                <Badge
                  key={category.value}
                  variant={newPostCategories.includes(category.value) ? "default" : "outline"}
                  className={`cursor-pointer ${newPostCategories.includes(category.value) ? getCategoryColor(category.value) : ""}`}
                  aria-pressed={newPostCategories.includes(category.value)}
                  onClick={() => toggleCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
            {categoryError && <p className="text-sm text-red-500 mt-1">{categoryError}</p>}
            <div className="grid gap-2 mt-4">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="投稿の内容を入力"
                rows={8}
              />
              {contentError && <p className="text-sm text-red-500">{contentError}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleNewPostDialogChange(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddPost} className="bg-blue-600 hover:bg-blue-700 text-white">投稿する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditPostDialogOpen} onOpenChange={handleEditPostDialogChange}>
        <DialogContent className="sm:max-w-[600px] board-dialog-content">
          <DialogHeader>
            <DialogTitle>投稿を編集</DialogTitle>
            <DialogDescription>投稿の内容を編集できます。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">タイトル</Label>
              <Input
                id="edit-title"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="投稿のタイトルを入力"
                maxLength={100}
              />
            </div>
            <div className="grid gap-2">
              <Label>カテゴリー</Label>
              <div className="flex flex-wrap gap-2">
                {BOARD_CATEGORIES.map((category) => (
                  <Badge
                    key={category.value}
                    variant={newPostCategories.includes(category.value) ? "default" : "outline"}
                    className={`cursor-pointer ${newPostCategories.includes(category.value) ? getCategoryColor(category.value) : ""}`}
                    onClick={() => toggleCategory(category.value)}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-content">内容</Label>
              <Textarea
                id="edit-content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="投稿の内容を入力"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPostDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">更新する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 投稿詳細ダイアログ */}
      <Dialog open={isPostDetailDialogOpen} onOpenChange={setIsPostDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto board-dialog-content">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedPost.category.map((categoryValue) => {
                    const categoryInfo = BOARD_CATEGORIES.find((cat) => cat.value === categoryValue)
                    return (
                      <Badge
                        key={categoryValue}
                        variant="outline"
                        className={`text-xs ${getCategoryColor(categoryValue)}`}
                      >
                        {categoryInfo?.label || categoryValue}
                      </Badge>
                    )
                  })}
                </div>
                <DialogTitle className="text-xl text-primary dark:text-primary-dark">{selectedPost.title}</DialogTitle>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{getUserInitial(selectedPost.author)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPost.author}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {format(new Date(selectedPost.createdAt), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 mb-6">
                  {selectedPost.content}
                </div>

                {/* コメントセクション */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">
                    コメント ({getPostComments(selectedPost.id).length})
                  </h3>

                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInitial(user?.email || "")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          placeholder="コメントを入力..."
                          rows={3}
                          className="comment-textarea"
                        />
                        <div className="flex justify-end mt-2">
                          <Button size="sm" onClick={handleAddComment} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Send className="mr-1 h-4 w-4" />
                            投稿
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* コメント一覧 */}
                  <div className="space-y-4">
                    {getPostComments(selectedPost.id).map((comment) => {
                      const isOwnComment = comment.userId === user?.id
                      const isCommentLiked = likedCommentIds.includes(comment.id)
                      return (
                        <div key={comment.id} className="flex space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitial(comment.author)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className={`rounded-lg p-3 ${isOwnComment ? "comment-own" : "comment-other"}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm comment-author">
                                  {comment.author}{" "}
                                  {isOwnComment && <span className="text-xs text-blue-500">(自分)</span>}
                                </span>
                                <span className="text-xs comment-time">
                                  {format(new Date(comment.createdAt), "MM月dd日 HH:mm", { locale: ja })}
                                </span>
                              </div>
                              <p className="text-sm comment-content">{comment.content}</p>
                            </div>
                            <div className="flex items-center mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeComment(comment.id)}
                                className={`h-6 px-2 text-xs ${isCommentLiked ? "text-blue-600" : ""}`}
                              >
                                <ThumbsUp className={`mr-1 h-3 w-3 ${isCommentLiked ? "fill-blue-600 text-blue-600" : ""}`} />
                                {comment.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {getPostComments(selectedPost.id).length === 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">まだコメントはありません。</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
