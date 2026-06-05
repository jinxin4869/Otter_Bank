"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { type Post } from "@/types/post"
import { BOARD_CATEGORIES, getCategoryColor } from "./board-constants"

type EditPostModalProps = {
  isOpen: boolean
  post: Post | null
  onOpenChange: (open: boolean) => void
  onSubmit: (postId: string, title: string, content: string, categories: string[]) => Promise<void>
}

export default function EditPostModal({ isOpen, post, onOpenChange, onSubmit }: EditPostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setContent(post.content)
      setCategories([...post.category])
    }
  }, [post])

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleSubmit = async () => {
    if (!post) return
    if (!title.trim()) { return }
    if (!content.trim()) { return }
    if (categories.length === 0) { return }
    await onSubmit(post.id, title, content, categories)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                  variant={categories.includes(category.value) ? "default" : "outline"}
                  className={`cursor-pointer ${categories.includes(category.value) ? getCategoryColor(category.value) : ""}`}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿の内容を入力"
              rows={8}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">更新する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
