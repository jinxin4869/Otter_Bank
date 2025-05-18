"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { MessageSquare, Heart, Search, Filter, Plus, ThumbsUp, MessageCircle, Clock } from "lucide-react"
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
    category: "savings",
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
    category: "investment",
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
    category: "budget",
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
    category: "debt",
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
    category: "income",
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
    category: "experience",
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
    category: "question",
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
    category: "budget",
    createdAt: new Date(2023, 7, 17).toISOString(),
    likes: 38,
    comments: 11,
    views: 205,
  },
]

type Post = {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  category: string
  createdAt: string
  likes: number
  comments: number
  views: number
}

export default function BoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("latest")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // 新規投稿の状態
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostCategory, setNewPostCategory] = useState("")

  // ログイン状態を確認
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    // サンプルデータを読み込み
    setPosts(SAMPLE_POSTS)
  }, [router])

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
          BOARD_CATEGORIES.find((cat) => cat.value === post.category)
            ?.label.toLowerCase()
            .includes(term),
      )
    }

    // カテゴリーでフィルタリング
    if (activeTab !== "all") {
      filtered = filtered.filter((post) => post.category === activeTab)
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((post) => selectedCategories.includes(post.category))
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

  // フィルター条件が変更されたときにフィルターを適用
  useEffect(() => {
    filterAndSortPosts()
  }, [filterAndSortPosts])

  // 新規投稿の追加
  const handleAddPost = () => {
    // 入力検証
    if (!newPostTitle.trim()) {
      toast.error("タイトルが入力されていません",{
        description: "投稿のタイトルを入力してください。",
      })
      return
    }

    if (!newPostContent.trim()) {
      toast.error("内容が入力されていません",{
        description: "投稿の内容を入力してください。",
      })
      return
    }

    if (!newPostCategory) {
      toast.error("カテゴリーが選択されていません",{
        description: "投稿のカテゴリーを選択してください。",
      })
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
      category: newPostCategory,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      views: 0,
    }

    // 投稿リストに追加
    setPosts((prev) => [newPost, ...prev])

    // フォームをリセット
    setNewPostTitle("")
    setNewPostContent("")
    setNewPostCategory("")
    setIsNewPostDialogOpen(false)

    toast.success("投稿が完了しました",{
      description: "あなたの投稿が掲示板に追加されました。",
    })
  }

  // いいねの処理
  const handleLike = (postId: string) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))

    toast.success("いいねしました", {
      description: "投稿にいいねを追加しました。",
    })
  }

  // カテゴリーの表示名を取得
  const getCategoryLabel = (categoryValue: string) => {
    return BOARD_CATEGORIES.find((cat) => cat.value === categoryValue)?.label || categoryValue
  }

  // ユーザーのイニシャルを取得
  const getUserInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  // 投稿リストのレンダリング
  const renderPostList = (posts: Post[]) => {
    if (posts.length === 0) {
      return (
        <div className="text-center py-10">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">投稿がありません</h3>
          <p className="mt-2 text-muted-foreground">検索条件に一致する投稿がないか、まだ投稿がありません。</p>
          <Button className="mt-4" onClick={() => setIsNewPostDialogOpen(true)}>
            最初の投稿を作成
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="mb-2">
                  {getCategoryLabel(post.category)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), "yyyy年MM月dd日", { locale: ja })}
                </div>
              </div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <div className="flex items-center mt-2">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback className="text-xs">{getUserInitial(post.authorEmail)}</AvatarFallback>
                </Avatar>
                <CardDescription>{post.author}</CardDescription>
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
                  <Clock className="mr-1 h-4 w-4" />
                  <span>{post.views} 閲覧</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                  <Heart className="mr-1 h-4 w-4" />
                  いいね
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  コメント
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">掲示板</h1>
          <p className="text-muted-foreground">お金の管理や貯金のコツ、投資の経験などを共有しましょう</p>
        </div>
        <Button onClick={() => setIsNewPostDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規投稿
        </Button>
      </div>

      {/* 検索とフィルター */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="投稿を検索..."
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
        <TabsList className="w-full flex flex-wrap">
          <TabsTrigger value="all">すべて</TabsTrigger>
          {BOARD_CATEGORIES.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
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
      <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">カテゴリー</Label>
              <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="カテゴリーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {BOARD_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="投稿の内容を入力"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddPost}>投稿する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    className="cursor-pointer"
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
            <Button onClick={() => setIsFilterDialogOpen(false)}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

