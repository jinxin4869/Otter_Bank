import { mapApiAchievementSummary, parseGrowthStage } from "@/types/achievement"
import type { ApiAchievementSummary } from "@/types/achievement"

describe("parseGrowthStage", () => {
  it("正しいレスポンスをキャメルケースへ変換する", () => {
    expect(
      parseGrowthStage({
        stage: "silver",
        next_stage: "gold",
        achievements_to_next: 4,
        progress_percentage: 20,
      })
    ).toEqual({ stage: "silver", nextStage: "gold", achievementsToNext: 4, progressPercentage: 20 })
  })

  it("最終ステージの null を保持する", () => {
    expect(
      parseGrowthStage({
        stage: "platinum",
        next_stage: null,
        achievements_to_next: null,
        progress_percentage: 100,
      })
    ).toEqual({ stage: "platinum", nextStage: null, achievementsToNext: null, progressPercentage: 100 })
  })

  it.each([undefined, null, "silver", 42, [], {}, { stage: "diamond" }])(
    "不正な値 %p は none にフォールバックする",
    (value) => {
      expect(parseGrowthStage(value).stage).toBe("none")
    }
  )

  it("next_stage が不正な値なら nextStage を null にする", () => {
    const result = parseGrowthStage({ stage: "bronze", next_stage: "diamond", achievements_to_next: "x" })
    expect(result).toMatchObject({ stage: "bronze", nextStage: null, achievementsToNext: null })
  })
})

describe("mapApiAchievementSummary", () => {
  const base: ApiAchievementSummary = {
    total_achievements: 20,
    unlocked_achievements: 8,
    progress_by_category: {},
  }

  it("growth_stage を成長ステージへ変換する", () => {
    const summary = mapApiAchievementSummary({
      ...base,
      growth_stage: { stage: "silver", next_stage: "gold", achievements_to_next: 5, progress_percentage: 0 },
    })
    expect(summary.growthStage.stage).toBe("silver")
  })

  it("growth_stage が無い旧レスポンスでも none になる", () => {
    expect(mapApiAchievementSummary(base).growthStage.stage).toBe("none")
  })
})
