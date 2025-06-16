'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
}

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const getApiUrl = () => {
    if (process.env.NODE_ENV === 'development') {
      return process.env.NEXT_PUBLIC_DEV_URL;
    }
    return process.env.NEXT_PUBLIC_API_URL;
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('authToken');
    
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // JWT期限切れの場合の処理
        if (errorData.code === 'token_expired') {
          console.log('[Auth] JWT Token expired');
          throw new Error('認証期限が切れました。再度ログインしてください。');
        }
        
        throw new Error(errorData.error || 'Token verification failed');
      }

      const data = await response.json();
      setUser(data.user || data); // dataにuserプロパティがない場合はdata自体をユーザー情報として使用
      setToken(storedToken);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('[Auth] JWT Token verification failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserEmail');
      setUser(null);
      setToken(null);
      
      // JWT期限切れの場合のみトーストを表示
      if (error instanceof Error && error.message.includes('認証期限が切れました')) {
        toast.error('認証期限切れ', {
          description: error.message,
        });
      }
      // その他のエラーは表示しない（初回アクセス時の混乱を避けるため）
    } finally {
      setIsLoading(false);
    }
  };

  // 新しい関数: 認証エラーの共通処理
  const handleAuthError = (error: unknown) => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    setToken(null);
    setUser(null);

    // エラーメッセージの表示
    if (error instanceof Error) {
      toast.error('認証エラー', {
        description: error.message,
      });
    } else {
      toast.error('認証エラー', {
        description: '予期せぬエラーが発生しました',
      });
    }

    // ログインページへのリダイレクト
    router.push('/login');
  };

  // ログアウト関数の改善
  const logout = async () => {
    console.log('[Auth] ログアウト実行');
    try {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        // バックエンドでトークンを無効化
        await fetch(`${getApiUrl()}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('[Auth] ログアウトエラー:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserEmail');
      setUser(null);
      setToken(null);
      window.dispatchEvent(new Event('auth-state-changed'));
      router.push('/login');
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
    checkAuth
  };
};