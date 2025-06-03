'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setStatus('error')
          setMessage('認証がキャンセルされました')
          return
        }

        if (!code) {
          setStatus('error')
          setMessage('認証コードが見つかりません')
          return
        }

        // バックエンドにコードを送信してトークンを取得
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (response.ok) {
          const { token } = await response.json()
          localStorage.setItem('authToken', token)
          setStatus('success')
          setMessage('ログインしました。リダイレクトしています...')
          setTimeout(() => {
            router.push('/')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('認証に失敗しました')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setStatus('error')
        setMessage('認証エラーが発生しました')
      }
    }

    handleCallback()
  }, [searchParams, router])

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

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}