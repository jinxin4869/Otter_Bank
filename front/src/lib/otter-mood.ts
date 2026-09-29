export type FinancialMood = "happy" | "neutral" | "sad"

/**
 * 今月の収入と支出からカワウソの気分を決める
 * - sad: 赤字（収入 0 で支出だけの月も含む）
 * - happy: 収入の 20% 超が残った
 * - neutral: それ以外（記録なし・トントン）
 */
export function getFinancialMood(income: number, expense: number): FinancialMood {
  if (expense > income) return "sad"
  if (income > 0 && (income - expense) / income > 0.2) return "happy"
  return "neutral"
}
