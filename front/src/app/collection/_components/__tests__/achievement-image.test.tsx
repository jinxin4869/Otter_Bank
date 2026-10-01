import { render, screen, fireEvent } from "@testing-library/react"
import AchievementImage from "@/app/collection/_components/achievement-image"

describe("AchievementImage", () => {
  it("画像の URL があれば画像を表示する", () => {
    render(<AchievementImage imageUrl="/achievements/first_savings.png" title="はじめての貯金" tier="bronze" unlocked />)
    expect(screen.getByRole("img", { name: "はじめての貯金" }).tagName).toBe("IMG")
  })

  it("画像が読み込めなければティアのアイコン表示に切り替える", () => {
    render(<AchievementImage imageUrl="/achievements/missing.png" title="はじめての貯金" tier="gold" unlocked />)
    fireEvent.error(screen.getByRole("img", { name: "はじめての貯金" }))
    const fallback = screen.getByRole("img", { name: "はじめての貯金" })
    expect(fallback.tagName).not.toBe("IMG")
    expect(fallback).toHaveAttribute("data-tier", "gold")
  })

  it("獲得済みの gold にはエフェクトを重ね、画像が読み込めなければ外す", () => {
    const { container } = render(
      <AchievementImage imageUrl="/achievements/savings_30000.png" title="大きな一歩" tier="gold" unlocked />
    )
    expect(container.querySelector('[data-tier="gold"] img')).toBeInTheDocument()
    fireEvent.error(screen.getByRole("img", { name: "大きな一歩" }))
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(0)
  })

  it("画像の URL が無ければ最初からティアのアイコンを表示する", () => {
    render(<AchievementImage imageUrl={null} title="実績" tier="silver" unlocked={false} />)
    const fallback = screen.getByRole("img", { name: "実績" })
    expect(fallback.tagName).not.toBe("IMG")
    expect(fallback).toHaveAttribute("data-tier", "silver")
  })
})
