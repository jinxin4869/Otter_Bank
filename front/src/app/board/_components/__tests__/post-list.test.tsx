import { render, screen } from "@testing-library/react"
import PostList from "../post-list"

const noop = () => {}
const renderEmpty = (emptyMessage?: { title: string; description: string }) =>
  render(
    <PostList
      posts={[]}
      isLoading={false}
      likedPostIds={[]}
      bookmarkedPostIds={[]}
      onLike={noop}
      onBookmark={noop}
      onView={noop}
      onEdit={noop}
      onDeleteRequest={noop}
      onCreatePost={noop}
      emptyMessage={emptyMessage}
    />
  )

describe("PostList の空表示", () => {
  it("既定では投稿の作成を促す", () => {
    renderEmpty()
    expect(screen.getByText("投稿がありません")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "最初の投稿を作成" })).toBeInTheDocument()
  })

  it("文言を差し替えたときは作成ボタンを出さない", () => {
    renderEmpty({ title: "ブックマークした投稿はありません", description: "説明" })
    expect(screen.getByText("ブックマークした投稿はありません")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "最初の投稿を作成" })).toBeNull()
  })
})
