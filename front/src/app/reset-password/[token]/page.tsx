'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage({
    params
}: {
    params: Promise<{ token: string }>
}) {
    const [token, setToken] = useState<string>('');
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    // paramsを非同期で取得
    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setToken(resolvedParams.token);
        };
        getParams();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('パスワードが一致しません')
            return
        }

        if (password.length < 8) {
            setError('パスワードは8文字以上である必要があります')
            return
        }

        setIsLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password,
                }),
            })

            if (response.ok) {
                setMessage('パスワードがリセットされました。ログインページにリダイレクトします。')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'パスワードのリセットに失敗しました')
            }
        } catch (err) {
            console.error('Password reset error:', err);
            setError('ネットワークエラーが発生しました')
        } finally {
            setIsLoading(false)
        }
    }

    // tokenが読み込まれるまでローディング表示
    if (!token) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        パスワードリセット
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="password" className="sr-only">
                            新しいパスワード
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="新しいパスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="sr-only">
                            パスワード確認
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="パスワード確認"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm text-center">{error}</div>
                    )}

                    {message && (
                        <div className="text-green-600 text-sm text-center">{message}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'リセット中...' : 'パスワードをリセット'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}