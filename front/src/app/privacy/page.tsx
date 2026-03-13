import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="mb-4">
            私たちは、あなたのプライバシーを重要視しています。ここでは、私たちがどのように情報を収集し、使用し、共有するかについて説明します。
          </p>

          <section>
            <h3 className="text-xl font-bold mb-2">1. 収集する情報</h3>
            <p>
              当サービスでは、アカウント作成時にユーザー名、メールアドレス、パスワードを収集します。
              また、サービス利用中に、あなたが入力した収支データを収集します。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">2. 個人情報の使用</h3>
            <p>
              収集した情報は、サービスの提供、改善、およびカスタマイズのために使用されます。
              また、新機能や更新についての通知にも使用される場合があります。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">3. 情報の共有</h3>
            <p>
              私たちは、あなたの個人情報を第三者と共有することはありません。
              ただし、法的要請がある場合や、サービス提供に必要な場合は例外となります。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-2">4. お問い合わせ</h3>
            <p>このプライバシーポリシーに関するご質問がある場合は、私たちにお問い合わせください。</p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

