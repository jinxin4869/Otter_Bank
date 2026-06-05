"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { ThumbsUp, Send } from "lucide-react"
import { type Comment } from "@/types/post"
import { getUserInitial } from "./board-constants"

type CommentSectionProps = {
  comments: Comment[]
  currentUserEmail: string
  currentUserId?: number
  likedCommentIds: string[]
  onAddComment: (content: string) => Promise<void>
  onLikeComment: (commentId: string) => void
}

function CommentSection({ comments, currentUserEmail, currentUserId, likedCommentIds, onAddComment, onLikeComment }: CommentSectionProps) {
  const [content, setContent] = useState("")

  const handleSubmit = async () => {
    if (!content.trim()) return
    await onAddComment(content)
    setContent("")
  }

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">
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
              className="comment-textarea"
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
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
                    onClick={() => onLikeComment(comment.id)}
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
        {comments.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">まだコメントはありません。</p>
        )}
      </div>
    </div>
  )
}

export default React.memo(CommentSection)
