import Link from "next/link"
import { Github } from "lucide-react"
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background dark:border-slate-800 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
              水獭银行 (Otter Bank)
            </Link>
            <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
              &copy; {currentYear} Otter Bank. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary-foreground">
              利用規約
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary-foreground">
              プライバシーポリシー
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/jinxin4869"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors dark:text-slate-400 dark:hover:text-primary-foreground"
            >
              <Github className="h-5 w-5" />
            </a>
            {/* 他のSNSリンクや関連リンク */}
            {/*
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <Link href="/blog" aria-label="Blog" className="text-muted-foreground hover:text-primary transition-colors">
              <BookText className="h-5 w-5" />
            </Link>
            */}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t dark:border-slate-700 text-center">
          <p className="text-xs text-muted-foreground dark:text-slate-500">
            このアプリはポートフォリオ目的で作成されました。実際の金融サービスを提供するものではありません。
          </p>
        </div>
      </div>
    </footer>
  )
}