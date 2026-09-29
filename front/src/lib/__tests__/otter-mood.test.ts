import { getFinancialMood } from "@/lib/otter-mood"

describe("getFinancialMood", () => {
  it.each([
    ["記録なし", 0, 0, "neutral"],
    ["収入 0 で支出だけ", 0, 3000, "sad"],
    ["赤字", 10000, 12000, "sad"],
    ["貯蓄率 20% ちょうど", 10000, 8000, "neutral"],
    ["貯蓄率 20% 超", 10000, 7000, "happy"],
    ["収入だけ", 10000, 0, "happy"],
  ])("%s → %s", (_label, income, expense, expected) => {
    expect(getFinancialMood(income, expense)).toBe(expected)
  })
})
