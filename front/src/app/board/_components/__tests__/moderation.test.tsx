import { render, screen, fireEvent } from "@testing-library/react"
import type { ReactNode } from "react"
import PostCard from "../post-card"
import CommentSection from "../comment-section"
import type { Comment, Post } from "@/types/post"

// Radix のドロップダウンは jsdom でポインター操作が必要なため、中身を常に描画する形に差し替える
jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

const post: Post = {
  id: "10",
  title: "タイトル",
  content: "本文",
  author: "someone",
  userId: 2,
  category: [],
  createdAt: "2026-09-30T00:00:00Z",
  likes: 0,
  comments: 0,
  views: 0,
  likedByMe: false,
  bookmarkedByMe: false,
}

const noop = () => {}
const renderCard = (props: { isOwner: boolean; canModerate?: boolean; onDeleteRequest?: (id: string) => void }) =>
  render(
    <PostCard
      post={post}
      isLiked={false}
      isBookmarked={false}
      onLike={noop}
      onBookmark={noop}
      onView={noop}
      onEdit={noop}
      onDeleteRequest={props.onDeleteRequest ?? noop}
      isOwner={props.isOwner}
      canModerate={props.canModerate}
    />
  )

describe("PostCard の操作メニュー", () => {
  it("本人には編集と削除を出す", () => {
    renderCard({ isOwner: true })
    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument()
  })

  it("管理者には他人の投稿の削除だけを出す（編集は出さない）", () => {
    const onDeleteRequest = jest.fn()
    renderCard({ isOwner: false, canModerate: true, onDeleteRequest })
    expect(screen.queryByRole("button", { name: /編集/ })).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: /削除（管理者）/ }))
    expect(onDeleteRequest).toHaveBeenCalledWith("10")
  })

  it("本人でも管理者でもなければメニューを出さない", () => {
    renderCard({ isOwner: false })
    expect(screen.queryByRole("button", { name: "投稿のメニュー" })).toBeNull()
  })
})

const comment = (id: string, userId: number): Comment => ({
  id,
  postId: "10",
  content: `コメント${id}`,
  author: `user${userId}`,
  userId,
  createdAt: "2026-09-30T00:00:00Z",
  likes: 0,
  likedByMe: false,
})

const renderComments = (props: { isAdmin?: boolean; onDeleteComment?: (id: string) => void }) =>
  render(
    <CommentSection
      comments={[comment("1", 1), comment("2", 2)]}
      currentUserEmail="me@example.com"
      currentUserId={1}
      isAdmin={props.isAdmin}
      likedCommentIds={[]}
      onAddComment={async () => {}}
      onLikeComment={noop}
      onDeleteComment={props.onDeleteComment ?? noop}
    />
  )

describe("CommentSection の削除", () => {
  it("一般ユーザーには自分のコメントの削除だけを出す", () => {
    renderComments({})
    expect(screen.getByRole("button", { name: "user1さんのコメントを削除" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /user2さんのコメントを削除/ })).toBeNull()
  })

  it("管理者は他人のコメントも確認のうえ削除できる", async () => {
    const onDeleteComment = jest.fn()
    renderComments({ isAdmin: true, onDeleteComment })

    fireEvent.click(screen.getByRole("button", { name: "user2さんのコメントを削除（管理者）" }))
    fireEvent.click(await screen.findByRole("button", { name: "削除する" }))

    expect(onDeleteComment).toHaveBeenCalledWith("2")
  })
})
