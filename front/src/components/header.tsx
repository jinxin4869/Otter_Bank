"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Menu, LogIn, LogOut, UserPlus, Home, BookOpen, MessageSquare, UserCircle, Award, Palette, Check } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
export default function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  const logoHref = isLoggedIn ? "/dashboard" : "/";

  useEffect(() => {
    setMounted(true)
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedInStatus)

    // デバッグ用ログ追加 (開発環境のみ出力)
    if (process.env.NODE_ENV === "development") {
      console.log("Header mounted, current theme:", theme);
    }

    const handleStorageChange = () => {
      const newLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";
      if (isLoggedIn !== newLoggedInStatus) {
        setIsLoggedIn(newLoggedInStatus);
        if (!newLoggedInStatus && (pathname === "/dashboard" || pathname === "/collection" || pathname === "/board")) {
          router.push("/");
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isLoggedIn, pathname, router, theme])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    router.push("/");
  };

  const commonLinks = [
    { href: "/tutorial", label: "使い方", icon: <BookOpen className="mr-2 h-4 w-4" /> },
  ];

  const loggedOutLinks = [
    { href: "/", label: "ホーム", icon: <Home className="mr-2 h-4 w-4" /> },
    { href: "/login", label: "ログイン", icon: <LogIn className="mr-2 h-4 w-4" /> },
    { href: "/register", label: "新規登録", icon: <UserPlus className="mr-2 h-4 w-4" /> },
    ...commonLinks,
  ];

  const loggedInLinks = [
    { href: "/dashboard", label: "マイページ", icon: <UserCircle className="mr-2 h-4 w-4" /> },
    { href: "/collection", label: "実績", icon: <Award className="mr-2 h-4 w-4" /> },
    { href: "/board", label: "掲示板", icon: <MessageSquare className="mr-2 h-4 w-4" /> },
    ...commonLinks,
  ];

  const navLinks = isLoggedIn ? loggedInLinks : loggedOutLinks;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-slate-800">
        <div className="container flex h-16 items-center justify-between">
          <Link href={logoHref} className="flex items-center gap-2">
            <Image src="/logo.png" alt="Otter Bank Logo" width={32} height={32} className="rounded-full" />
            <span className="font-bold text-lg">Otter Bank</span>
          </Link>
          <div className="h-8 w-8 bg-muted rounded-md animate-pulse"></div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-slate-800 dark:bg-slate-900/95 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href={logoHref} className="flex items-center gap-2 mr-auto">
          <Image src="/logo.png" alt="Otter Bank Logo" width={36} height={36} className="rounded-full transition-transform hover:scale-110" />
          <span className="font-bold text-lg hidden sm:inline-block text-primary dark:text-primary-foreground">Otter Bank</span>
        </Link>

        {/* デスクトップ表示のナビゲーション */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Button
              key={link.href}
              variant={pathname === link.href ? "secondary" : "ghost"}
              asChild
              size="sm"
              className="rounded-full px-3"
            >
              <Link href={link.href} className="flex items-center">
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
          {isLoggedIn && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-400/10 dark:hover:text-red-500"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2 ml-4">
          {/* モバイル表示のハンバーガーメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden rounded-full">
                <Menu className="h-5 w-5" />
                <span className="sr-only">ナビゲーションを開く</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="md:hidden w-48 board-dialog-content">
              <DropdownMenuLabel>メニュー</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navLinks.map(link => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href} className={`flex items-center ${pathname === link.href ? "bg-muted dark:bg-slate-700 font-semibold" : ""}`}>
                    {link.icon}
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              {isLoggedIn && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center text-red-500 hover:!bg-red-500/10 hover:!text-red-600 dark:text-red-400 dark:hover:!bg-red-400/10 dark:hover:!text-red-500"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    ログアウト
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* テーマ変更ボタン */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Palette className="h-5 w-5 transition-transform group-hover:rotate-12 text-slate-600 dark:text-slate-400" />
                <span className="sr-only">テーマを切り替える</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 board-dialog-content">
              <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">背景色を選択</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:!bg-orange-100 dark:hover:!bg-slate-700 rounded-sm cursor-pointer"
              >
                <Sun className="h-4 w-4 text-orange-500" />
                ライト
                {theme === "light" && <Check className="h-4 w-4 ml-auto text-orange-500 dark:text-orange-400" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:!bg-orange-100 dark:hover:!bg-slate-700 rounded-sm cursor-pointer"
              >
                <Moon className="h-4 w-4 text-indigo-500" />
                ダーク
                {theme === "dark" && <Check className="h-4 w-4 ml-auto text-indigo-500 dark:text-indigo-400" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}