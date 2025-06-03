'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      try {
        // トークンをローカルストレージに保存
        localStorage.setItem('auth_token', token);
        
        // 認証状態を更新（カスタムイベント発火）
        window.dispatchEvent(new Event('auth-state-changed'));
        
        setStatus('success');
        
        // 2秒後にダッシュボードにリダイレクト
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
      } catch (error) {
        console.error('認証処理エラー:', error);
        setStatus('error');
      }
    } else {
      setStatus('error');
    }
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証処理中...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">認証完了</h1>
          <p className="text-gray-600">ダッシュボードにリダイレクトしています...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 text-6xl mb-4">✗</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">認証エラー</h1>
        <p className="text-gray-600 mb-4">認証に失敗しました。</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}
