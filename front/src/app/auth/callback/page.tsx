'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

// Google ログインの戻り先。バックエンドはアクセストークンを URL に載せず、リフレッシュトークンだけを
// HttpOnly cookie に入れて戻すので、リフレッシュ API でアクセストークンを受け取ってからログインする
export default function CallbackPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  // リフレッシュトークンは使うたびに作り直されるため、開発モードの二重実行でも 1 回だけ処理する
  const hasHandled = useRef(false)

  useEffect(() => {
    if (hasHandled.current) return
    hasHandled.current = true

    const handleCallback = async () => {
      try {
        const data = await api.auth.refresh()
        if (!data?.token) throw new Error('アクセストークンを受け取れませんでした')

        await login(data.token)
        setStatus('success')
        setMessage('ログインしました。リダイレクトしています...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setMessage('認証エラーが発生しました')
      }
    }

    void handleCallback()
  }, [router, login])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-lg">認証処理中...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <p className="text-lg text-green-600">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <p className="text-lg text-red-600">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              ログインページに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
