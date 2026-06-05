"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, Loader2 } from "lucide-react"
import { type Post } from "@/types/post"
import PostCard from "./post-card"

type PostListProps = {
  posts: Post[]
  isLoading: boolean
  likedPostIds: string[]
  bookmarkedPostIds: string[]
  currentUserId?: number
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
  onView: (post: Post) => void
  onEdit: (post: Post) => void
  onDeleteRequest: (postId: string) => void
  onCreatePost: () => void
}

function PostList({
  posts,
  isLoading,
  likedPostIds,
  bookmarkedPostIds,
  currentUserId,
  onLike,
  onBookmark,
  onView,
  onEdit,
  onDeleteRequest,
  onCreatePost,
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-10">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">投稿がありません</h3>
        <p className="mt-2 text-muted-foreground">検索条件に一致する投稿がないか、まだ投稿がありません。</p>
        <Button className="mt-4 text-white bg-blue-400 hover:bg-blue-600" onClick={onCreatePost}>
          最初の投稿を作成
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={likedPostIds.includes(post.id)}
          isBookmarked={bookmarkedPostIds.includes(post.id)}
          isOwner={post.userId === currentUserId}
          onLike={onLike}
          onBookmark={onBookmark}
          onView={onView}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </div>
  )
}

export default React.memo(PostList)
