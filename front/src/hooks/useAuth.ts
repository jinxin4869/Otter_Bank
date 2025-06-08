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

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('authToken');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error( errorData.error || 'トークンが無効です');
      }

      const userData = await response.json();
      setUser(userData);
      if (token !== storedToken) {
        setToken(storedToken);
      }
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('[Auth] トークン検証エラー:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      setUser(null);
      setToken(null);
      if (error instanceof Error) {
        toast.error('認証エラー', {
          description: error.message,
        });
      }
      router.push('/login');
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
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/logout`, {
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