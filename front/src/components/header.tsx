"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Menu,
  Home,
  BookOpen,
  MessageSquare,
  Settings,
  LogIn,
  UserPlus,
  Info,
  Shield,
  FileText,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeSelector } from "@/components/theme-selector"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false)
  const [hasTutorialSeen, setHasTutorialSeen] = useState(false)
  const pathname = usePathname()
  const isMobile = useMobile()
  const router = useRouter()

  // チュートリアルの表示状態を確認
  useEffect(() => {
    const tutorialSeen = localStorage.getItem("tutorialSeen")
    setHasTutorialSeen(tutorialSeen === "true")
  }, [])

  // モバイルメニューの開閉
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // ログアウト処理 - ローカルストレージとセッションストレージの両方をクリア
  const handleLogout = () => {
    const confirmed = window.confirm("ログアウトしますか?")
    if (confirmed) {
      // ログイン状態をクリア
      localStorage.removeItem("isLoggedIn")
      localStorage.removeItem("currentUserEmail")

      // セッションストレージもクリア - これによりログアウト後のチュートリアルページでの状態も正しく処理される
      sessionStorage.removeItem("wasLoggedIn")

      // ホームページにリダイレクト
      router.push("/")
    }
  }

  // ログイン状態の確認 - パスに基づいて判定
  const isLoggedIn = pathname.includes("/dashboard") || pathname.includes("/collection") || pathname.includes("/board")

  return (
    <header>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center">
              <div className="relative w-10 h-10 mr-2">
                <Image
                  src="/logo.png"
                  alt="Otter icon"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl font-bold">獭獭銀行</h1>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/dashboard" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <Home className="mr-1 h-4 w-4" />
                  マイページ
                </Link>
                <Link
                  href="/collection"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/collection" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <BookOpen className="mr-1 h-4 w-4" />
                  図鑑
                </Link>
                <Link
                  href="/board"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/board" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <MessageSquare className="mr-1 h-4 w-4" />
                  掲示板
                </Link>
                <Link
                  href="/tutorial"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/tutorial" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <HelpCircle className="mr-1 h-4 w-4" />
                  使い方
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-white/80 flex items-center">
                      <Settings className="mr-1 h-4 w-4" />
                      いろいろ
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsThemeDialogOpen(true)}>テーマ設定</DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/privacy" className="w-full">
                        プライバシーについて
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/terms" className="w-full">
                        利用規約
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" className="text-white hover:text-white/80" onClick={handleLogout}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/login" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2",
                    pathname === "/register" ? "border-white font-bold" : "border-transparent",
                  )}
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  新規登録
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-white/80 flex items-center">
                      <Info className="mr-1 h-4 w-4" />
                      いろいろ
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setIsThemeDialogOpen(true)}>テーマ設定</DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/privacy" className="w-full">
                        プライバシーについて
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/terms" className="w-full">
                        利用規約
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* モバイルナビゲーション */}
          <div className="flex md:hidden items-center space-x-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2 px-1",
                    pathname === "/dashboard" ? "border-white" : "border-transparent",
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="ml-1 text-xs">マイページ</span>
                </Link>
                <Link
                  href="/collection"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2 px-1",
                    pathname === "/collection" ? "border-white" : "border-transparent",
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="ml-1 text-xs">図鑑</span>
                </Link>
                <Link
                  href="/board"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2 px-1",
                    pathname === "/board" ? "border-white" : "border-transparent",
                  )}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="ml-1 text-xs">掲示板</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2 px-1",
                    pathname === "/login" ? "border-white" : "border-transparent",
                  )}
                >
                  <LogIn className="h-5 w-5" />
                  <span className="ml-1 text-xs">ログイン</span>
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "flex items-center text-white hover:text-white/80 border-b-2 px-1",
                    pathname === "/register" ? "border-white" : "border-transparent",
                  )}
                >
                  <UserPlus className="h-5 w-5" />
                  <span className="ml-1 text-xs">新規登録</span>
                </Link>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              className="text-white hover:text-white/80"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && isMobile && (
          <nav className="mt-4 pb-2">
            <ul className="flex flex-col space-y-2">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link href="/dashboard" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <Home className="mr-2 h-4 w-4" />
                      マイページ
                    </Link>
                  </li>
                  <li>
                    <Link href="/collection" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      図鑑
                    </Link>
                  </li>
                  <li>
                    <Link href="/board" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      掲示板
                    </Link>
                  </li>
                  <li>
                    <Link href="/tutorial" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      使い方
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white/80 p-0 h-auto font-normal flex items-center"
                      onClick={() => {
                        setIsThemeDialogOpen(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      テーマ設定
                    </Button>
                  </li>
                  <li>
                    <Link href="/privacy" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      プライバシーについて
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <FileText className="mr-2 h-4 w-4" />
                      利用規約
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white/80 p-0 h-auto font-normal"
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                    >
                      ログアウト
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      ログイン
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      新規登録
                    </Link>
                  </li>
                  <li>
                    <Button
                      variant="ghost"
                      className="text-white hover:text-white/80 p-0 h-auto font-normal flex items-center"
                      onClick={() => {
                        setIsThemeDialogOpen(true)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      テーマ設定
                    </Button>
                  </li>
                  <li>
                    <Link href="/privacy" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <Shield className="mr-2 h-4 w-4" />
                      プライバシーについて
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="flex items-center py-2" onClick={() => setIsMenuOpen(false)}>
                      <FileText className="mr-2 h-4 w-4" />
                      利用規約
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
        )}

        {/* テーマ設定ダイアログ */}
        <Dialog open={isThemeDialogOpen} onOpenChange={setIsThemeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>テーマ設定</DialogTitle>
            </DialogHeader>
            <ThemeSelector />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}

