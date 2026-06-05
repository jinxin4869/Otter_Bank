"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BOARD_CATEGORIES, getCategoryColor } from "./board-constants"

type CreatePostModalProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (title: string, content: string, categories: string[]) => Promise<void>
  initialTitle?: string
  initialContent?: string
  initialCategories?: string[]
}

export default function CreatePostModal({
  isOpen,
  onOpenChange,
  onSubmit,
  initialTitle = "",
  initialContent = "",
  initialCategories = [],
}: CreatePostModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [categories, setCategories] = useState<string[]>(initialCategories)
  const [titleError, setTitleError] = useState("")
  const [contentError, setContentError] = useState("")
  const [categoryError, setCategoryError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setContent(initialContent)
      setCategories(initialCategories)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTitle, initialContent, initialCategories.join(",")])

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const handleSubmit = async () => {
    setTitleError("")
    setContentError("")
    setCategoryError("")

    let hasError = false
    if (!title.trim()) { setTitleError("タイトルを入力してください。"); hasError = true }
    if (!content.trim()) { setContentError("内容を入力してください。"); hasError = true }
    if (categories.length === 0) { setCategoryError("カテゴリーを1つ以上選択してください。"); hasError = true }
    if (hasError) return

    await onSubmit(title, content, categories)
    setTitle("")
    setContent("")
    setCategories([])
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTitleError("")
      setContentError("")
      setCategoryError("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                variant={categories.includes(category.value) ? "default" : "outline"}
                className={`cursor-pointer ${categories.includes(category.value) ? getCategoryColor(category.value) : ""}`}
                aria-pressed={categories.includes(category.value)}
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
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="投稿の内容を入力"
              rows={8}
            />
            {contentError && <p className="text-sm text-red-500">{contentError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">投稿する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
