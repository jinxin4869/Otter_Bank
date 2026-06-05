export const BOARD_CATEGORIES = [
  { value: "savings", label: "貯金のコツ" },
  { value: "investment", label: "投資" },
  { value: "budget", label: "予算管理" },
  { value: "debt", label: "借金返済" },
  { value: "income", label: "副収入" },
  { value: "experience", label: "体験談" },
  { value: "question", label: "質問" },
  { value: "other", label: "その他" },
]

export const SORT_OPTIONS = [
  { value: "latest", label: "新着順" },
  { value: "popular", label: "人気順" },
  { value: "comments", label: "コメント数順" },
]

export const getCategoryColor = (categoryValue: string): string => {
  switch (categoryValue) {
    case "savings": return "bg-blue-50 text-blue-800 border-blue-200"
    case "investment": return "bg-green-50 text-green-800 border-green-200"
    case "budget": return "bg-purple-50 text-purple-800 border-purple-200"
    case "debt": return "bg-red-50 text-red-800 border-red-200"
    case "income": return "bg-yellow-50 text-yellow-800 border-yellow-200"
    case "experience": return "bg-teal-50 text-teal-800 border-teal-200"
    case "question": return "bg-orange-50 text-orange-800 border-orange-200"
    default: return "bg-cyan-50 text-cyan-800 border-cyan-200"
  }
}

export const getUserInitial = (name: string): string => name.charAt(0).toUpperCase()
