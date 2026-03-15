/** Rails API レスポンス型 — 投稿 */
export type ApiPost = {
  id: number
  title: string
  content: string
  author: string
  author_email: string
  user_id: number
  categories: string[]
  likes_count: number
  comments_count: number
  views_count: number
  liked_by_me: boolean
  bookmarked_by_me: boolean
  created_at: string
}

/** Rails API レスポンス型 — コメント */
export type ApiComment = {
  id: number
  post_id: number
  content: string
  author: string
  author_email: string
  user_id: number
  likes_count: number
  created_at: string
}

/** フロント内部型 — 投稿 */
export type Post = {
  id: string
  title: string
  content: string
  author: string
  authorEmail: string
  userId?: number
  category: string[]
  createdAt: string
  likes: number
  comments: number
  views: number
  isBookmarked?: boolean
}

/** フロント内部型 — コメント */
export type Comment = {
  id: string
  postId: string
  content: string
  author: string
  authorEmail: string
  userId?: number
  createdAt: string
  likes: number
}

/** ApiPost -> Post に変換する */
export const mapApiPost = (p: ApiPost): Post => ({
  id: String(p.id),
  title: p.title,
  content: p.content,
  author: p.author || "",
  authorEmail: p.author_email || "",
  userId: p.user_id,
  category: p.categories || [],
  createdAt: p.created_at,
  likes: p.likes_count || 0,
  comments: p.comments_count || 0,
  views: p.views_count || 0,
  isBookmarked: p.bookmarked_by_me,
})

/** ApiComment -> Comment に変換する */
export const mapApiComment = (c: ApiComment): Comment => ({
  id: String(c.id),
  postId: String(c.post_id),
  content: c.content,
  author: c.author || "",
  authorEmail: c.author_email || "",
  userId: c.user_id,
  createdAt: c.created_at,
  likes: c.likes_count || 0,
})
