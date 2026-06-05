"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { type Post, type Comment } from "@/types/post"
import { BOARD_CATEGORIES, getCategoryColor, getUserInitial } from "./board-constants"
import CommentSection from "./comment-section"

type PostDetailDialogProps = {
  post: Post | null
  isOpen: boolean
  comments: Comment[]
  currentUserEmail: string
  currentUserId?: number
  likedCommentIds: string[]
  onOpenChange: (open: boolean) => void
  onAddComment: (content: string) => Promise<void>
  onLikeComment: (commentId: string) => void
}

export default function PostDetailDialog({
  post,
  isOpen,
  comments,
  currentUserEmail,
  currentUserId,
  likedCommentIds,
  onOpenChange,
  onAddComment,
  onLikeComment,
}: PostDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto board-dialog-content">
        {post && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap gap-1 mb-2">
                {post.category.map((categoryValue) => {
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
              <DialogTitle className="text-xl text-primary dark:text-primary-dark">{post.title}</DialogTitle>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>{getUserInitial(post.author)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{post.author}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(post.createdAt), "yyyy年MM月dd日 HH:mm", { locale: ja })}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-100 mb-6">
                {post.content}
              </div>
              <CommentSection
                comments={comments}
                currentUserEmail={currentUserEmail}
                currentUserId={currentUserId}
                likedCommentIds={likedCommentIds}
                onAddComment={onAddComment}
                onLikeComment={onLikeComment}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
