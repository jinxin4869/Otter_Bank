import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">利用規約</CardTitle>
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

