"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Heart, ThumbsUp, MessageCircle, MoreVertical, Edit, Trash2, Bookmark, BookmarkCheck, MessageSquare, Eye } from "lucide-react"
import { type Post } from "@/types/post"
import { BOARD_CATEGORIES, getCategoryColor, getUserInitial } from "./board-constants"

type PostCardProps = {
  post: Post
  isLiked: boolean
  isBookmarked: boolean
  isOwner: boolean
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
  onView: (post: Post) => void
  onEdit: (post: Post) => void
  onDeleteRequest: (postId: string) => void
}

function PostCard({ post, isLiked, isBookmarked, isOwner, onLike, onBookmark, onView, onEdit, onDeleteRequest }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="board-dialog-content">
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDeleteRequest(post.id)}
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
          onClick={() => onView(post)}
        >
          {post.title}
        </CardTitle>
        <div className="flex items-center mt-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback className="text-xs">{getUserInitial(post.author)}</AvatarFallback>
          </Avatar>
          <CardDescription>{post.author}</CardDescription>
          {isOwner && (
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
          <Button variant="ghost" size="sm" onClick={() => onLike(post.id)}>
            <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            いいね
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onBookmark(post.id)}>
            {isBookmarked ? (
              <BookmarkCheck className="mr-1 h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="mr-1 h-4 w-4" />
            )}
            ブックマーク
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onView(post)}>
            <MessageSquare className="mr-1 h-4 w-4" />
            詳細
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default React.memo(PostCard)
