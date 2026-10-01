import { render, screen } from "@testing-library/react"
import BadgeEffect from "@/app/collection/_components/badge-effect"
import type { AchievementTier } from "@/types/achievement"

// エフェクトの装飾（光の帯 + 星）は aria-hidden の span として重ねる
const renderBadge = (tier: AchievementTier, unlocked: boolean) =>
  render(
    <BadgeEffect tier={tier} unlocked={unlocked}>
      <span role="img" aria-label="大きな一歩" />
    </BadgeEffect>
  )

describe("BadgeEffect", () => {
  it("獲得済みの gold には光の帯と星 3 個を重ねる", () => {
    const { container } = renderBadge("gold", true)
    expect(container.querySelector('[data-tier="gold"]')).toBeInTheDocument()
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(4)
    expect(screen.getByRole("img", { name: "大きな一歩" })).toBeInTheDocument()
  })

  it("獲得済みの platinum には光の帯と星 5 個を重ねる", () => {
    const { container } = renderBadge("platinum", true)
    expect(container.querySelector('[data-tier="platinum"]')).toBeInTheDocument()
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(6)
  })

  it.each<AchievementTier>(["bronze", "silver"])("%s にはエフェクトを付けない", (tier) => {
    const { container } = renderBadge(tier, true)
    expect(container.querySelector("[data-tier]")).toBeNull()
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(0)
  })

  it("未達成なら gold・platinum でもエフェクトを付けない", () => {
    const { container } = renderBadge("platinum", false)
    expect(container.querySelector("[data-tier]")).toBeNull()
    expect(screen.getByRole("img", { name: "大きな一歩" })).toBeInTheDocument()
  })
})
