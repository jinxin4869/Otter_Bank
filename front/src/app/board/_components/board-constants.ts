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
    case "savings": return "bg-category-1/10 text-category-1 border-category-1/30"
    case "investment": return "bg-category-4/10 text-category-4 border-category-4/30"
    case "budget": return "bg-category-2/10 text-category-2 border-category-2/30"
    case "debt": return "bg-category-3/10 text-category-3 border-category-3/30"
    case "income": return "bg-category-5/10 text-category-5 border-category-5/30"
    case "experience": return "bg-category-6/10 text-category-6 border-category-6/30"
    case "question": return "bg-secondary text-secondary-foreground border-border"
    default: return "bg-muted text-foreground border-border"
  }
}

export const getUserInitial = (name: string): string => name.charAt(0).toUpperCase()
