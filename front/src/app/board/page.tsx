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
import { MessageSquare, Heart, Search, Filter, Plus, ThumbsUp, MessageCircle, MoreVertical, Edit, Trash2, Bookmark, BookmarkCheck, Send, Eye } from "lucide-react"
import { toast } from "sonner"

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

// サンプル投稿データ
const SAMPLE_POSTS = [
  {
    id: "1",
    title: "毎月5000円を貯金するコツ",
    content:
      "私は毎月給料日に自動的に5000円を別口座に振り込む設定をしています。気づかないうちに貯金ができるのでおすすめです。皆さんはどのような方法で貯金していますか？",
    author: "貯金好き",
    authorEmail: "chokin@example.com",
    category: ["savings"],
    createdAt: new Date(2023, 0, 15).toISOString(),
    likes: 24,
    comments: 8,
    views: 156,
  },
  {
    id: "2",
    title: "初心者向け投資の始め方",
    content:
      "投資を始めたいけど何から手をつければいいか分からない方へ。まずは少額から積立NISAを始めることをおすすめします。リスクを抑えながら長期的な資産形成ができます。",
    author: "投資マスター",
    authorEmail: "invest@example.com",
    category: ["investment"],
    createdAt: new Date(2023, 1, 3).toISOString(),
    likes: 42,
    comments: 15,
    views: 230,
  },
  {
    id: "3",
    title: "家計簿アプリの比較",
    content:
      "様々な家計簿アプリを使ってきましたが、獭獭銀行が一番使いやすいと感じています。特に支出の分析機能が優れていて、無駄遣いの発見に役立っています。",
    author: "アプリ評論家",
    authorEmail: "app@example.com",
    category: ["budget"],
    createdAt: new Date(2023, 2, 20).toISOString(),
    likes: 18,
    comments: 6,
    views: 95,
  },
  {
    id: "4",
    title: "学生ローンの返済計画",
    content:
      "学生ローンの返済に苦労していましたが、収入の20%を毎月返済に充てる計画を立てたところ、予想より早く返済できました。計画的な返済が重要です。",
    author: "元借金持ち",
    authorEmail: "debt@example.com",
    category: ["debt"],
    createdAt: new Date(2023, 3, 5).toISOString(),
    likes: 31,
    comments: 12,
    views: 187,
  },
  {
    id: "5",
    title: "副業でのポイントサイト活用法",
    content:
      "空き時間を活用してポイントサイトで月に5000円ほど稼いでいます。特におすすめなのはアンケート回答とショッピング還元です。コツコツ続けることが大切です。",
    author: "副収入マニア",
    authorEmail: "side@example.com",
    category: ["income"],
    createdAt: new Date(2023, 4, 12).toISOString(),
    likes: 27,
    comments: 9,
    views: 142,
  },
  {
    id: "6",
    title: "30代で住宅ローンを完済した体験談",
    content:
      "20代から徹底的に節約し、ボーナスのほとんどを繰り上げ返済に回したことで、30代で住宅ローンを完済できました。苦労もありましたが、今は大きな安心感があります。",
    author: "早期完済者",
    authorEmail: "house@example.com",
    category: ["experience"],
    createdAt: new Date(2023, 5, 28).toISOString(),
    likes: 56,
    comments: 21,
    views: 310,
  },
  {
    id: "7",
    title: "投資信託と個別株、どちらがおすすめ？",
    content:
      "初心者には投資信託、ある程度知識がついてきたら個別株も検討するのがいいと思います。皆さんはどのような投資をしていますか？アドバイスをいただけると嬉しいです。",
    author: "投資初心者",
    authorEmail: "beginner@example.com",
    category: ["question"],
    createdAt: new Date(2023, 6, 9).toISOString(),
    likes: 14,
    comments: 18,
    views: 124,
  },
  {
    id: "8",
    title: "家計の見直しで月5万円の節約に成功",
    content:
      "固定費の見直し、食費の削減、無駄な契約の解約などを行い、月5万円の節約に成功しました。具体的な方法を共有します。まずは自分の支出を把握することが大切です。",
    author: "節約上手",
    authorEmail: "save@example.com",
    category: ["budget"],
    createdAt: new Date(2023, 7, 17).toISOString(),
    likes: 38,
    comments: 11,
    views: 205,
  },
]

// サンプルコメントデータ
const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "1",
    content: "とても参考になりました！私も自動振込を設定してみます。",
    author: "節約初心者",
    authorEmail: "beginner@example.com",
    createdAt: new Date(2023, 0, 16).toISOString(),
    likes: 3,
  },
  {
    id: "c2",
    postId: "1",
    content: "自動振込以外にも、500円玉貯金もおすすめです。",
    author: "コイン貯金マスター",
    authorEmail: "coin@example.com",
    createdAt: new Date(2023, 0, 17).toISOString(),
    likes: 1,
  },
]

type Comment = {
  id: string
  postId: string
  content: string
  author: string
  authorEmail: string
  createdAt: string
  likes: number
}

type Post = {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  category: string[]
  createdAt: string
  likes: number
  comments: number
  views: number
  isBookmarked?: boolean // ブックマーク状態
}

export default function BoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]); // いいねした投稿IDを管理
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]); // いいねしたコメントIDを管理
  const [comments, setComments] = useState<Comment[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])

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
  const [currentUserEmail, setCurrentUserEmail] = useState("")

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

  // ログイン状態を確認
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userEmail = localStorage.getItem("currentUserEmail") || ""

    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // ローカルストレージから投稿データを読み込み
    const savedPosts = localStorage.getItem("boardPosts")
    const initialPosts = savedPosts ? JSON.parse(savedPosts) : SAMPLE_POSTS

    // ローカルストレージからコメントデータを読み込み
    const savedComments = localStorage.getItem("boardComments")
    const initialComments = savedComments ? JSON.parse(savedComments) : SAMPLE_COMMENTS

    // サンプルデータを読み込み
    setCurrentUserEmail(userEmail)
    setPosts(initialPosts)
    setComments(initialComments)

    // ブックマークデータを読み込み
    const savedBookmarks = localStorage.getItem("bookmarkedPosts")
    if (savedBookmarks) {
      setBookmarkedPosts(JSON.parse(savedBookmarks))
    }

    // ローカルストレージからいいね状態を読み込む
    const storedLikedPosts = localStorage.getItem("likedPostIds");
    if (storedLikedPosts) {
      setLikedPostIds(JSON.parse(storedLikedPosts));
    }

    // ローカルストレージからコメントいいね状態を読み込む
    const storedLikedComments = localStorage.getItem("likedCommentIds");
    if (storedLikedComments) {
      setLikedCommentIds(JSON.parse(storedLikedComments));
    }

  }, [router])

  // いいねの処理を更新
  const handleLike = (postId: string) => {
    let updatedLikedPostIds: string[];
    const isCurrentlyLiked = likedPostIds.includes(postId);

    if (isCurrentlyLiked) {
      // いいね解除
      updatedLikedPostIds = likedPostIds.filter(id => id !== postId);
      setPosts((prev) => {
        const updatedPosts = prev.map((post) =>
          post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post
        )
        // ローカルストレージに保存
        localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
        return updatedPosts
      });
      toast.success("いいねを取り消しました");
    } else {
      // いいねする
      updatedLikedPostIds = [...likedPostIds, postId];
      setPosts((prev) => {
        const updatedPosts = prev.map((post) =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
        // ローカルストレージに保存
        localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
        return updatedPosts
      });
      toast.success("いいねしました");
    }
    setLikedPostIds(updatedLikedPostIds);
    localStorage.setItem("likedPostIds", JSON.stringify(updatedLikedPostIds));
  }

  // 投稿のフィルタリングとソート - useCallbackでメモ化
  const filterAndSortPosts = useCallback(() => {
    let filtered = [...posts]

    // 検索語でフィルタリング
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

    // カテゴリーでフィルタリング
    if (activeTab !== "all") {
      filtered = filtered.filter((post) => post.category.includes(activeTab))
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) =>
        post.category.some((category) => selectedCategories.includes(category))
      )
    }

    // ソート
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

  // カテゴリーの追加・削除
  const toggleCategory = (category: string) => {
    setNewPostCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category) // 既に選択されている場合は削除
        : [...prev, category] // 選択されていない場合は追加
    )
  }

  // フィルター条件が変更されたときにフィルターを適用
  useEffect(() => {
    filterAndSortPosts()
  }, [filterAndSortPosts])

  // ブックマークの切り替え
  const toggleBookmark = (postId: string) => {
    const newBookmarks = bookmarkedPosts.includes(postId)
      ? bookmarkedPosts.filter(id => id !== postId)
      : [...bookmarkedPosts, postId]

    setBookmarkedPosts(newBookmarks)
    localStorage.setItem("bookmarkedPosts", JSON.stringify(newBookmarks))

    toast.success(
      bookmarkedPosts.includes(postId)
        ? "ブックマークを削除しました"
        : "ブックマークに追加しました"
    )
  }

  // 新規投稿の追加
  const handleAddPost = () => {
    // エラーメッセージをリセット
    setTitleError("")
    setContentError("")
    setCategoryError("")

    let hasError = false
    // 入力検証
    if (!newPostTitle.trim()) {
      setTitleError("タイトルを入力してください。")
      hasError = true
    }

    if (!newPostContent.trim()) {
      setContentError("内容を入力してください。")
      hasError = true
    }

    if (newPostCategories.length === 0) {
      setCategoryError("カテゴリーを1つ以上選択してください。")
      hasError = true
    }

    if (hasError) {
      return
    }

    // ユーザー情報を取得
    const userEmail = localStorage.getItem("currentUserEmail") || "user@example.com"
    const username = userEmail.split("@")[0]

    // 新しい投稿を作成
    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: username,
      authorEmail: userEmail,
      category: newPostCategories, // カテゴリーをカンマ区切りで保存
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      views: 0,
    }

    // 投稿リストに追加
    setPosts((prev) => {
      const updatedPosts = [newPost, ...prev]
      // ローカルストレージに保存
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })

    // フォームをリセット
    setNewPostTitle("")
    setNewPostContent("")
    setNewPostCategories([])
    setIsNewPostDialogOpen(false)
    // エラーメッセージもリセット
    setTitleError("")
    setContentError("")
    setCategoryError("")

    toast.success("投稿が完了しました", {
      description: "あなたの投稿が掲示板に追加されました。",
    })
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
  const handleSaveEdit = () => {
    if (!editingPost) return

    // エラーメッセージをリセット
    setTitleError("")
    setContentError("")
    setCategoryError("")

    let hasError = false
    // 入力検証
    if (!newPostTitle.trim()) {
      setTitleError("タイトルを入力してください。")
      toast.error("タイトルが入力されていません")
      hasError = true
    }

    if (!newPostContent.trim()) {
      // setContentError("内容を入力してください。") // 必要であれば編集用エラーstateを別途用意
      toast.error("内容が入力されていません")
      hasError = true
    }

    if (newPostCategories.length === 0) {
      // setCategoryError("カテゴリーを1つ以上選択してください。") // 必要であれば編集用エラーstateを別途用意
      toast.error("カテゴリーが選択されていません")
      hasError = true
    }

    if (hasError) {
      return
    }

    // 投稿を更新
    setPosts((prev) => {
      const updatedPosts = prev.map((post) =>
        post.id === editingPost.id
          ? {
            ...post,
            title: newPostTitle,
            content: newPostContent,
            category: newPostCategories,
          }
          : post
      )
      // ローカルストレージに保存
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })

    // フォームをリセット
    setNewPostTitle("")
    setNewPostContent("")
    setNewPostCategories([])
    setEditingPost(null)
    setIsEditPostDialogOpen(false)
    // エラーメッセージもリセット
    setTitleError("")
    setContentError("")
    setCategoryError("")

    toast.success("投稿を更新しました")
  }

  // 投稿詳細を表示
  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setIsPostDetailDialogOpen(true)

    // 閲覧数を増加
    setPosts(prev => {
      const updatedPosts = prev.map(p =>
        p.id === post.id ? { ...p, views: p.views + 1 } : p
      )
      // ローカルストレージに保存
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })
  }

  // コメントを追加
  const handleAddComment = () => {
    if (!selectedPost || !newCommentContent.trim()) {
      toast.error("コメント内容を入力してください")
      return
    }

    const userEmail = localStorage.getItem("currentUserEmail") || "user@example.com"
    const username = userEmail.split("@")[0]

    const newComment: Comment = {
      id: Date.now().toString(),
      postId: selectedPost.id,
      content: newCommentContent,
      author: username,
      authorEmail: userEmail,
      createdAt: new Date().toISOString(),
      likes: 0,
    }

    setComments(prev => {
      const updatedComments = [...prev, newComment]
      // ローカルストレージに保存
      localStorage.setItem("boardComments", JSON.stringify(updatedComments))
      return updatedComments
    })

    // 投稿のコメント数を更新
    setPosts(prev => {
      const updatedPosts = prev.map(post =>
        post.id === selectedPost.id
          ? { ...post, comments: post.comments + 1 }
          : post
      )
      // ローカルストレージに保存
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })

    setNewCommentContent("")
    toast.success("コメントを投稿しました")
  }

  // コメントにいいね
  const handleLikeComment = (commentId: string) => {
    let updatedLikedCommentIds: string[];
    const isCurrentlyLiked = likedCommentIds.includes(commentId);

    if (isCurrentlyLiked) {
      // いいね解除
      updatedLikedCommentIds = likedCommentIds.filter(id => id !== commentId);
      setComments(prev => {
        const updatedComments = prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: Math.max(0, comment.likes - 1) }
            : comment
        )
        // ローカルストレージに保存
        localStorage.setItem("boardComments", JSON.stringify(updatedComments))
        return updatedComments
      })
      toast.success("コメントのいいねを取り消しました");
    } else {
      // いいねする
      updatedLikedCommentIds = [...likedCommentIds, commentId];
      setComments(prev => {
        const updatedComments = prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likes: comment.likes + 1 }
            : comment
        )
        // ローカルストレージに保存
        localStorage.setItem("boardComments", JSON.stringify(updatedComments))
        return updatedComments
      })
      toast.success("コメントにいいねしました");
    }
    
    setLikedCommentIds(updatedLikedCommentIds);
    localStorage.setItem("likedCommentIds", JSON.stringify(updatedLikedCommentIds));
  }

  // 選択された投稿のコメントを取得
  const getPostComments = (postId: string) => {
    return comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // 投稿の削除
  const handleDeletePost = () => {
    if (!deletingPostId) return

    setPosts((prev) => {
      const updatedPosts = prev.filter((post) => post.id !== deletingPostId)
      // ローカルストレージに保存
      localStorage.setItem("boardPosts", JSON.stringify(updatedPosts))
      return updatedPosts
    })
    
    setDeletingPostId(null)
    setIsDeleteDialogOpen(false)

    toast.success("投稿を削除しました")
  }

  // 削除ダイアログを開く
  const openDeleteDialog = (postId: string) => {
    setDeletingPostId(postId)
    setIsDeleteDialogOpen(true)
  }

  // 現在のユーザーが投稿者かチェック
  const isPostOwner = (post: Post) => {
    return post.authorEmail === currentUserEmail
  }

  // ユーザーのイニシャルを取得
  const getUserInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  // カテゴリーに応じた色を返す関数
  const getCategoryColor = (categoryValue: string) => {
    switch (categoryValue) {
      case 'savings': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'investment': return 'bg-green-50 text-green-800 border-green-200';
      case 'budget': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'debt': return 'bg-red-50 text-red-800 border-red-200';
      case 'income': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'experience': return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'question': return 'bg-orange-50 text-orange-800 border-orange-200';
      default: return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    }
  };

  // 投稿リストのレンダリング
  const renderPostList = (postsToRender: Post[]) => {
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
          const isLiked = likedPostIds.includes(post.id);
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(post.category || []).map(categoryValue => {
                      const categoryInfo = BOARD_CATEGORIES.find(cat => cat.value === categoryValue);
                      return (
                        <Badge key={categoryValue}
                          variant="outline"
                          className={`text-xs ${getCategoryColor(categoryValue)}`}
                        >
                          {categoryInfo?.label || categoryValue}
                        </Badge>
                      );
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
                        <DropdownMenuContent align="end">
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
                <CardTitle className="text-xl cursor-pointer hover:text-blue-600"
                  onClick={() => handleViewPost(post)}>
                  {post.title}
                </CardTitle>
                <div className="flex items-center mt-2">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="text-xs">{getUserInitial(post.authorEmail)}</AvatarFallback>
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
                <p className="line-clamp-3">
                  {post.content}
                </p>
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
                    <Heart className={`mr-1 h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
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
          );
        })}
      </div>
    )
  }

  // 新規投稿ダイアログ
  const handleNewPostDialogChange = (open: boolean) => {
    setIsNewPostDialogOpen(open)
    if (!open) {
      // ダイアログが閉じる時にエラーメッセージをリセット
      setTitleError("")
      setContentError("")
      setCategoryError("")
      // フォーム内容もリセットした方が良い場合
      // setNewPostTitle("")
      // setNewPostContent("")
      // setNewPostCategories([])
    }
  }

  // 編集ダイアログ
  const handleEditPostDialogChange = (open: boolean) => {
    setIsEditPostDialogOpen(open)
    if (!open) {
      // ダイアログが閉じる時にエラーメッセージをリセット (編集用エラーstateがあればそれも)
      setTitleError("") // 新規投稿と共用している場合は注意
      setContentError("")
      setCategoryError("")
      setEditingPost(null) // 編集対象もリセット
      // フォーム内容もリセット
      // setNewPostTitle("")
      // setNewPostContent("")
      // setNewPostCategories([])
    }
  }


  return (
    <div className="container mx-auto max-w-6xl py-6 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">掲示板</h1>
          <p className="text-muted-foreground">お金の管理や貯金のコツ、投資の経験などを共有しましょう</p>
        </div>
        <Button onClick={() => setIsNewPostDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
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
        <DialogContent className="sm:max-w-[600px]">
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
                  className={`cursor-pointer ${newPostCategories.includes(category.value)
                    ? getCategoryColor(category.value)
                    : ""
                    }`}
                  aria-pressed={newPostCategories.includes(category.value)}
                  onClick={() => toggleCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
            {categoryError && <p className="text-sm text-red-500 mt-1">{categoryError}</p>}
            <div className="grid gap-2 mt-4"> {/* mt-4 を追加してスペースを調整 */}
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
            <Button onClick={handleAddPost}>投稿する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditPostDialogOpen} onOpenChange={handleEditPostDialogChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>投稿を編集</DialogTitle>
            <DialogDescription>
              投稿の内容を編集できます。
            </DialogDescription>
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
                    className={`cursor-pointer ${newPostCategories.includes(category.value)
                      ? getCategoryColor(category.value)
                      : ""
                      }`}
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
            <Button onClick={handleSaveEdit}>更新する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 投稿詳細ダイアログ */}
      <Dialog open={isPostDetailDialogOpen} onOpenChange={setIsPostDetailDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedPost.category.map(categoryValue => {
                    const categoryInfo = BOARD_CATEGORIES.find(cat => cat.value === categoryValue);
                    return (
                      <Badge key={categoryValue}
                        variant="outline"
                        className={`text-xs ${getCategoryColor(categoryValue)}`}
                      >
                        {categoryInfo?.label || categoryValue}
                      </Badge>
                    );
                  })}
                </div>
                <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{getUserInitial(selectedPost.authorEmail)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedPost.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedPost.createdAt), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="whitespace-pre-wrap text-gray-700 mb-6">
                  {selectedPost.content}
                </div>

                {/* コメントセクション */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">コメント ({getPostComments(selectedPost.id).length})</h3> {/* コメント数を動的に */}

                  {/* 新しいコメントを追加 */}
                  <div className="mb-4">
                    <div className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{getUserInitial(currentUserEmail)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          value={newCommentContent}
                          onChange={(e) => setNewCommentContent(e.target.value)}
                          placeholder="コメントを入力..."
                          rows={3}
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
                      const isOwnComment = comment.authorEmail === currentUserEmail;
                      const isCommentLiked = likedCommentIds.includes(comment.id);
                      return (
                        <div key={comment.id} className="flex space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getUserInitial(comment.authorEmail)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className={`rounded-lg p-3 ${isOwnComment ? "bg-muted" : "bg-gray-100 dark:bg-gray-700"}`}> {/* 背景色を条件分岐 */}
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.author} {isOwnComment && <span className="text-xs text-blue-500">(自分)</span>}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.createdAt), "MM月dd日 HH:mm", { locale: ja })}
                                </span>
                              </div>
                              <p className="text-sm text-foreground">{comment.content}</p> {/* text-gray-700 から text-foreground に */}
                            </div>
                            <div className="flex items-center mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikeComment(comment.id)}
                                className={`h-6 px-2 text-xs ${isCommentLiked ? 'text-blue-600' : ''}`}
                              >
                                <ThumbsUp className={`mr-1 h-3 w-3 ${isCommentLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
                                {comment.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {getPostComments(selectedPost.id).length === 0 && (
                      <p className="text-sm text-muted-foreground">まだコメントはありません。</p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消すことができません。投稿とそのすべてのコメントが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-red-600 hover:bg-red-700"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* フィルターダイアログ */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                    className={`cursor-pointer ${selectedCategories.includes(category.value)
                      ? getCategoryColor(category.value)
                      : ""
                      }`}
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
            <Button className=" hover:bg-blue-400" onClick={() => setIsFilterDialogOpen(false)}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

