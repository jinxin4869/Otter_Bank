import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "水獭银行 (Otter Bank)",
  description: "お金の管理をするためアプリ - カワウソがあなたの出費に応じてリアクションを反応してくれます！",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
  }

  const fontSans = inter
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased bg-orange-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50", // 基本の背景色と文字色を設定
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="root" // デフォルトテーマは維持しつつ、選択肢からは削除
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}