"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Sun, Moon } from "lucide-react"

// テーマの設定オプション - 各テーマの名前、色、説明を定義
const THEMES = [
  {
    id: "light",
    name: "ライト",
    icon: <Sun className="h-5 w-5" />,
    description: "明るく見やすい標準テーマです。",
  },
  {
    id: "dark",
    name: "ダーク",
    icon: <Moon className="h-5 w-5" />,
    description: "目に優しく、暗い場所での利用に適したテーマです。",
  },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  // themeがundefinedの場合のフォールバックとして'light'を設定
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // themeが確定するまで何もレンダリングしないか、ローディング表示をする
  if (!mounted || !theme) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>テーマ設定</CardTitle>
          <CardDescription>アプリの表示モードを選択できます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 flex items-center justify-center text-muted-foreground">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  const currentSelectedTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border dark:border-slate-700">
      <CardHeader className="border-b dark:border-slate-700">
        <CardTitle className="text-xl">テーマ設定</CardTitle>
        <CardDescription>アプリの表示モードを選択してください。</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {THEMES.map((themeOption) => (
            <Button
              key={themeOption.id}
              variant={theme === themeOption.id ? "default" : "outline"}
              className={`
                w-full h-auto py-4 px-4 flex flex-col items-center justify-center space-y-2 
                rounded-lg transition-all duration-200
                ${theme === themeOption.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background dark:ring-offset-slate-900"
                  : "hover:bg-muted/50 dark:hover:bg-slate-800"
                }
              `}
              onClick={() => setTheme(themeOption.id)}
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted dark:bg-slate-700 mb-2 text-foreground dark:text-slate-200">
                {themeOption.icon}
              </div>
              <span className="text-sm font-medium text-foreground dark:text-slate-200">{themeOption.name}</span>
              {theme === themeOption.id && <Check className="h-4 w-4 text-primary absolute top-2 right-2" />}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground dark:text-slate-400 pt-2 text-center">
          {currentSelectedTheme.description}
        </p>
      </CardContent>
      <CardFooter className="border-t dark:border-slate-700 pt-4">
        <p className="text-xs text-muted-foreground dark:text-slate-500 w-full text-center">
          選択したテーマは自動的に保存されます。
        </p>
      </CardFooter>
    </Card>
  )
}