import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "水獭银行 (Otter Bank)",
  description: "お金の管理をするためアプリ - カワウソがあなたの出費に応じてリアクションを反応してくれます！",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
          {/* toast 通知の表示先。next-themes の useTheme を使うため ThemeProvider 内に置く */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}