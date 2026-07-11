import Link from "next/link"

// lucide-react 1.x はブランドアイコン(Github 等)を廃止したため、GitHub マークは
// インライン SVG で描画する
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
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