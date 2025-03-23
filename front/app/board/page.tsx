"use client"

import { useRouter } from "next/navigation"
import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Plus, Search, Calendar, User, ThumbsUp, MessageCircle, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Post = {
  id: number
  title: string
  content: string
  date: string
  author: string
  likes: number
  comments: Comment[]
  tags?: string[]
}

type Comment = {
  id: number
  content: string
  author: string
  date: string
}

// 掲示板のカテゴリー
const BOARD_CATEGORIES = [
  "貯金",
  "節約",
  "投資",
  "家計簿",
  "目標達成",
  "モチベーション",
  "初心者",
  "コツ",
  "日常生活",
  "資産形成",
]

export default function BoardPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortCriteria, setSortCriteria] = useState<"date" | "title" | "likes">("date")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [commentContent, setCommentContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  // ログイン状態を確認
  useEffect(() => {
    // ログイン状態をチェック
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      // ログインしていない場合
      router.push("/login")
      return
    }
  }, [router])

  // 以下は既存のuseEffectコード
  useEffect(() => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem("posts")
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Create sample posts if none exist
      const samplePosts: Post[] = [
        {
          id: 1,
          title: "貯金の目標を達成しました！",
          content:
            "3ヶ月間頑張って、目標の10万円を貯金することができました。皆さんも頑張りましょう！\n\n最初は難しいと思っていましたが、毎日少しずつ積み重ねることで達成できました。次は20万円を目指します！",
          date: "2025-01-15",
          author: "ユーザー1",
          likes: 12,
          comments: [
            {
              id: 1,
              content: "おめでとうございます！私も頑張ります！",
              author: "ユーザー2",
              date: "2025-01-15",
            },
            {
              id: 2,
              content: "素晴らしいですね！どのように貯金されましたか？",
              author: "ユーザー3",
              date: "2025-01-16",
            },
          ],
          tags: ["貯金", "目標達成", "モチベーション"],
        },
        {
          id: 2,
          title: "おすすめの節約方法",
          content:
            "毎日のコーヒーを自宅で淹れることで、月に5000円ほど節約できています。小さな積み重ねが大事ですね。\n\n他にも、食材をまとめ買いして計画的に使うことで、食費を大幅に削減できました。皆さんのおすすめの節約方法があれば教えてください！",
          date: "2025-01-10",
          author: "ユーザー2",
          likes: 8,
          comments: [
            {
              id: 3,
              content: "私は自炊を始めて、外食費を抑えています！",
              author: "ユーザー4",
              date: "2025-01-11",
            },
          ],
          tags: ["節約", "コツ", "日常生活"],
        },
        {
          id: 3,
          title: "投資を始めてみました",
          content:
            "先月から少額から投資を始めてみました。まだ初心者ですが、長期的な視点で資産形成を考えています。\n\n最初は不安でしたが、しっかり勉強して少額から始めることで、リスクを抑えながら学んでいます。同じように投資を始めた方、アドバイスがあればぜひ教えてください！",
          date: "2025-01-05",
          author: "ユーザー3",
          likes: 5,
          comments: [],
          tags: ["投資", "資産形成", "初心者"],
        },
      ]
      setPosts(samplePosts)
      localStorage.setItem("posts", JSON.stringify(samplePosts))
    }
  }, [])

  const handleAddTag = () => {
    if (customTag && !selectedTags.includes(customTag)) {
      setSelectedTags([...selectedTags, customTag])
      setCustomTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPost: Post = {
      id: Date.now(),
      title,
      content,
      date: new Date().toISOString().split("T")[0],
      author: "あなた", // In a real app, this would be the logged-in user
      likes: 0,
      comments: [],
      tags: selectedTags,
    }

    const updatedPosts = [...posts, newPost]
    setPosts(updatedPosts)

    // Save to localStorage
    localStorage.setItem("posts", JSON.stringify(updatedPosts))

    // Reset form and close dialog
    setTitle("")
    setContent("")
    setSelectedTags([])
    setCustomTag("")
    setIsDialogOpen(false)

    toast({
      title: "投稿しました",
      description: "投稿が正常に作成されました",
    })
  }

  const handleDelete = (postId: number) => {
    const updatedPosts = posts.filter((post) => post.id !== postId)
    setPosts(updatedPosts)
    localStorage.setItem("posts", JSON.stringify(updatedPosts))

    if (selectedPost?.id === postId) {
      setSelectedPost(null)
    }

    toast({
      title: "投稿を削除しました",
      description: "投稿が正常に削除されました",
    })
  }

  const handleLike = (postId: number) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("posts", JSON.stringify(updatedPosts))

    if (selectedPost?.id === postId) {
      setSelectedPost(updatedPosts.find((p) => p.id === postId) || null)
    }
  }

  const handleAddComment = (postId: number) => {
    if (!commentContent.trim()) return

    const newComment: Comment = {
      id: Date.now(),
      content: commentContent,
      author: "あなた", // In a real app, this would be the logged-in user
      date: new Date().toISOString().split("T")[0],
    }

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] }
      }
      return post
    })

    setPosts(updatedPosts)
    localStorage.setItem("posts", JSON.stringify(updatedPosts))
    setCommentContent("")

    if (selectedPost?.id === postId) {
      setSelectedPost(updatedPosts.find((p) => p.id === postId) || null)
    }

    toast({
      title: "コメントを追加しました",
      description: "コメントが正常に追加されました",
    })
  }

  const openPostDetail = (post: Post) => {
    setSelectedPost(post)
  }

  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "all" || (post.tags && post.tags.includes(selectedCategory))

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortCriteria === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortCriteria === "title") {
        return a.title.localeCompare(b.title)
      } else {
        return b.likes - a.likes
      }
    })

  // Get unique tags from all posts
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">掲示板</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              新規投稿
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>新規投稿</DialogTitle>
              <DialogDescription>あなたの経験や質問を共有しましょう。</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">タイトル</Label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 貯金の目標を達成しました！"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>カテゴリー（複数選択可）</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      if (value && !selectedTags.includes(value)) {
                        setSelectedTags([...selectedTags, value])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリーを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOARD_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="カスタムカテゴリー"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      className="w-40"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTag}
                      disabled={!customTag || selectedTags.includes(customTag)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-content">内容</Label>
                <Textarea
                  id="post-content"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="例：毎月5,000円を貯金して3ヶ月で目標達成しました！
例：電車通勤を自転車に変えて月に8,000円節約できています。
例：投資信託を始めて、長期的な資産形成を目指しています。"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={title.trim() === "" || content.trim() === "" || selectedTags.length === 0}
                >
                  投稿
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-3/4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={sortCriteria}
              onValueChange={(value) => setSortCriteria(value as "date" | "title" | "likes")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">日付順</SelectItem>
                <SelectItem value="title">タイトル順</SelectItem>
                <SelectItem value="likes">いいね数順</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  投稿がありません。最初の投稿を作成しましょう！
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(post.date), "yyyy年MM月dd日", { locale: ja })}
                          </p>
                        </div>
                      </div>
                      {post.author === "あなた" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は元に戻せません。この投稿とそのすべてのコメントが完全に削除されます。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(post.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                削除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                    <CardTitle
                      className="text-lg hover:text-primary transition-colors cursor-pointer"
                      onClick={() => openPostDetail(post)}
                    >
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="line-clamp-2 text-sm text-muted-foreground">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {post.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                            onClick={() => setSelectedCategory(tag)}
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-primary gap-1 px-2"
                        onClick={() => handleLike(post.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{post.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1 px-2">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments.length}</span>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary gap-1"
                      onClick={() => openPostDetail(post)}
                    >
                      <Eye className="h-4 w-4" />
                      <span>詳細を見る</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="md:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">カテゴリー</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div
                  className={cn(
                    "px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                    selectedCategory === "all" && "bg-muted font-medium",
                  )}
                  onClick={() => setSelectedCategory("all")}
                >
                  すべて
                </div>
                {allTags.map((tag) => (
                  <div
                    key={tag}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-muted transition-colors",
                      selectedCategory === tag && "bg-muted font-medium",
                    )}
                    onClick={() => setSelectedCategory(tag)}
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">掲示板について</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  このコミュニティでは、お金の管理や貯金のコツ、投資の経験などを共有できます。質問や相談も大歓迎です！
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <h3 className="font-medium text-foreground">使い方のポイント：</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>投稿にはカテゴリーを選択するか、新しいカテゴリーを追加できます</li>
                    <li>具体的な金額や期間を含めると、より参考になります</li>
                    <li>他の方の経験にコメントして、情報を深めましょう</li>
                    <li>成功体験だけでなく、失敗から学んだことも共有しましょう</li>
                    <li>個人情報は投稿しないよう注意してください</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{selectedPost.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle>{selectedPost.title}</DialogTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{selectedPost.author}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(selectedPost.date), "yyyy年MM月dd日", { locale: ja })}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPost.author === "あなた" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は元に戻せません。この投稿とそのすべてのコメントが完全に削除されます。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(selectedPost.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            削除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="whitespace-pre-line">{selectedPost.content}</div>

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary gap-1"
                    onClick={() => handleLike(selectedPost.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>いいね ({selectedPost.likes})</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>コメント ({selectedPost.comments.length})</span>
                  </Button>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-4">コメント ({selectedPost.comments.length})</h4>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {selectedPost.comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        まだコメントはありません。最初のコメントを投稿しましょう！
                      </p>
                    ) : (
                      selectedPost.comments.map((comment) => (
                        <div key={comment.id} className="bg-muted/50 p-3 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.date), "yyyy年MM月dd日", { locale: ja })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="comment">コメントを追加</Label>
                    <Textarea
                      id="comment"
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="コメントを入力..."
                      rows={3}
                    />
                    <Button
                      onClick={() => handleAddComment(selectedPost.id)}
                      disabled={!commentContent.trim()}
                      className="w-full"
                    >
                      コメントを投稿
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

