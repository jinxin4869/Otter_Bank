"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  // Check if user is logged in based on the referrer path
  useEffect(() => {
    // In a real app, this would check authentication state
    // For demo, we'll check if we came from a logged-in page
    const referrer = document.referrer
    const isFromLoggedInPage =
      referrer && (referrer.includes("/dashboard") || referrer.includes("/collection") || referrer.includes("/board"))

    setIsLoggedIn(isFromLoggedInPage)
  }, [])

  // Function to go back to dashboard if logged in
  const handleBackToDashboard = () => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">利用規約</CardTitle>
          {isLoggedIn && (
            <button onClick={handleBackToDashboard} className="text-sm text-primary hover:underline">
              ダッシュボードに戻る
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-xl font-bold mb-2">1. 受け入れ</h3>
            <p>このアプリケーションを使用することにより、以下の利用規約に同意したものとみなされます。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">2. 使用の許可</h3>
            <p>あなたは、自己の責任において、本アプリケーションを使用することができます。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">3. 変更について</h3>
            <p>我々は、事前の告知なく、本規約を変更する権利を有します。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">4. 免責事項</h3>
            <p>本アプリケーションの利用に関して生じた損害に対して、一切の責任を負いません。</p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">5. お問い合わせ</h3>
            <p>ご不明点がある場合は、お問い合わせください。</p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

