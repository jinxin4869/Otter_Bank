import Link from "next/link"

// lucide-react 1.x でブランドアイコン（Github 等）が削除されたため、GitHub マークはインライン SVG で表示する
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.652.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.476 5.92.43.372.815 1.104.815 2.225 0 1.606-.015 2.9-.015 3.294 0 .32.216.694.825.576C20.565 22.296 24 17.797 24 12.5 24 5.87 18.627.5 12 .5z" />
    </svg>
  )
}

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
              <GithubIcon className="h-5 w-5" />
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