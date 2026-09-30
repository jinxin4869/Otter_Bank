"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ThumbsUp, Send, Trash2 } from "lucide-react"
import { type Comment } from "@/types/post"
import { getUserInitial } from "./board-constants"
import { cn } from "@/lib/utils"

type CommentSectionProps = {
  comments: Comment[]
  currentUserEmail: string
  currentUserId?: number
  // 管理者は他人のコメントも削除できる
  isAdmin?: boolean
  likedCommentIds: string[]
  onAddComment: (content: string) => Promise<void>
  onLikeComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
}

function CommentSection({
  comments,
  currentUserEmail,
  currentUserId,
  isAdmin = false,
  likedCommentIds,
  onAddComment,
  onLikeComment,
  onDeleteComment,
}: CommentSectionProps) {
  const [content, setContent] = useState("")

  const handleSubmit = async () => {
    if (!content.trim()) return
    await onAddComment(content)
    setContent("")
  }

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium mb-4 text-foreground">
        コメント ({comments.length})
      </h3>

      <div className="mb-4">
        <div className="flex space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getUserInitial(currentUserEmail)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="コメントを入力..."
              rows={3}
              className="text-foreground"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="mr-1 h-4 w-4" />
                投稿
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => {
          const isOwnComment = comment.userId === currentUserId
          const isCommentLiked = likedCommentIds.includes(comment.id)
          return (
            <div key={comment.id} className="flex space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getUserInitial(comment.author)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className={cn("rounded-lg p-3", isOwnComment ? "bg-accent" : "bg-muted")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {comment.author}{" "}
                      {isOwnComment && <span className="text-xs text-primary">(自分)</span>}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt), "MM月dd日 HH:mm", { locale: ja })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
                <div className="flex items-center mt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLikeComment(comment.id)}
                    className={cn("h-6 px-2 text-xs", isCommentLiked && "text-primary")}
                  >
                    <ThumbsUp className={cn("mr-1 h-3 w-3", isCommentLiked && "fill-primary text-primary")} />
                    {comment.likes}
                  </Button>
                  {(isOwnComment || isAdmin) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                          aria-label={`${comment.author}さんのコメントを削除`}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          {isOwnComment ? "削除" : "削除（管理者）"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-popover text-popover-foreground">
                        <AlertDialogHeader>
                          <AlertDialogTitle>コメントを削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>この操作は取り消すことができません。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteComment(comment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground">まだコメントはありません。</p>
        )}
      </div>
    </div>
  )
}

export default React.memo(CommentSection)
