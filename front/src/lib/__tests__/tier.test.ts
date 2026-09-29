import { isAchievementTier } from "@/lib/tier"

describe("isAchievementTier", () => {
  it("定義済みのティアだけ true。プロトタイプのキーや未知の値は false", () => {
    expect(isAchievementTier("gold")).toBe(true)
    expect(isAchievementTier("constructor")).toBe(false)
    expect(isAchievementTier("diamond")).toBe(false)
  })
})
