"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

// テーマの設定オプション - 各テーマの名前、色、説明を定義
const THEMES = [
  {
    id: "light",
    name: "ライト",
    bgColor: "bg-[#FFFFFF]",
    primaryColor: "bg-[#6A9FBF]",
    description: "明るい標準テーマ",
  },
  {
    id: "light-coral",
    name: "コーラル",
    bgColor: "bg-[#FFF5F5]",
    primaryColor: "bg-[#F87171]",
    description: "柔らかい赤色のモダンテーマ",
  },
  {
    id: "light-emerald",
    name: "エメラルド",
    bgColor: "bg-[#F0FDF4]",
    primaryColor: "bg-[#34D399]",
    description: "爽やかな緑色のモダンテーマ",
  },
  {
    id: "light-amber",
    name: "アンバー",
    bgColor: "bg-[#FFFBEB]",
    primaryColor: "bg-[#F59E0B]",
    description: "温かみのある黄色のモダンテーマ",
  },
  {
    id: "light-indigo",
    name: "インディゴ",
    bgColor: "bg-[#F5F3FF]",
    primaryColor: "bg-[#818CF8]",
    description: "落ち着いた紫色のモダンテーマ",
  },
  {
    id: "dark",
    name: "ダーク",
    bgColor: "bg-[#121212]",
    primaryColor: "bg-[#3B82F6]",
    description: "目に優しい暗いテーマ",
  },
]

export function ThemeSelector() {
  // テーマの状態管理 - 現在のテーマと選択されたカラーテーマを管理
  const { theme, setTheme } = useTheme()
  const [selectedColorTheme, setSelectedColorTheme] = useState<string>("light")

  // コンポーネントマウント時に現在のテーマを検出して設定
  useEffect(() => {
    // ダークテーマの場合
    if (theme === "dark") {
      setSelectedColorTheme("dark")
    } else {
      // カラーテーマ属性があるか確認
      const colorTheme = document.documentElement.getAttribute("data-color-theme")
      if (colorTheme) {
        setSelectedColorTheme(colorTheme)
      } else {
        setSelectedColorTheme("light")
      }
    }
  }, [theme])

  // テーマ変更ハンドラー - ユーザーがテーマを選択したときに呼び出される
  const handleColorThemeChange = (themeId: string) => {
    setSelectedColorTheme(themeId)

    if (themeId === "dark") {
      // ダークテーマの設定
      document.documentElement.removeAttribute("data-color-theme")
      setTheme("dark")
    } else if (themeId === "light") {
      // 標準ライトテーマの設定
      document.documentElement.removeAttribute("data-color-theme")
      setTheme("light")
    } else {
      // カラーバリアントのあるライトテーマの設定
      document.documentElement.setAttribute("data-color-theme", themeId)
      setTheme("light")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>テーマ設定</CardTitle>
        <CardDescription>アプリの表示モードとカラーテーマを選択できます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm font-medium mb-2">テーマを選択</div>
        {/* テーマ選択グリッド - 各テーマのプレビューとラベルを表示 */}
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((colorTheme) => (
            <div
              key={colorTheme.id}
              className={`
                relative cursor-pointer rounded-lg p-1 ring-2 transition-all
                ${
                  selectedColorTheme === colorTheme.id
                    ? "ring-primary"
                    : "ring-transparent hover:ring-muted-foreground/20"
                }
              `}
              onClick={() => handleColorThemeChange(colorTheme.id)}
            >
              <div className="flex flex-col gap-1">
                {/* テーマのカラープレビュー */}
                <div className={`h-16 rounded-md ${colorTheme.bgColor} flex items-center justify-center`}>
                  <div className={`h-6 w-24 rounded ${colorTheme.primaryColor}`}></div>
                </div>
                {/* テーマ名と選択状態の表示 */}
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm">{colorTheme.name}</span>
                  {selectedColorTheme === colorTheme.id && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 選択されたテーマの説明 */}
        <p className="text-xs text-muted-foreground mt-2">
          {THEMES.find((t) => t.id === selectedColorTheme)?.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">設定はブラウザに保存されます</p>
      </CardFooter>
    </Card>
  )
}

