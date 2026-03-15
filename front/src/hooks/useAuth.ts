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

  // リフレッシュトークンを使ってアクセストークンを更新する
  const refreshAccessToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) return null;

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refresh_token);
      return data.token as string;
    } catch {
      return null;
    }
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

        // JWT期限切れの場合はリフレッシュを試みる
        if (errorData.code === 'token_expired') {
          const newToken = await refreshAccessToken();
          if (newToken) {
            // リフレッシュ成功: 新しいトークンで再検証
            await checkAuthWithToken(newToken);
            return;
          }
          // リフレッシュ失敗: ログアウト状態に
          throw new Error('認証期限が切れました。再度ログインしてください。');
        }

        throw new Error(errorData.error || 'Token verification failed');
      }

      const data = await response.json();
      setUser(data.user || data);
      setToken(storedToken);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      console.error('[Auth] JWT Token verification failed:', error);
      clearAuthStorage();
      setUser(null);
      setToken(null);

      // JWT期限切れ（リフレッシュ失敗含む）の場合のみトーストを表示
      if (error instanceof Error && error.message.includes('認証期限が切れました')) {
        toast.error('認証期限切れ', {
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 指定したトークンで検証する（リフレッシュ後の再検証用）
  const checkAuthWithToken = async (accessToken: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Token verification failed');

      const data = await response.json();
      setUser(data.user || data);
      setToken(accessToken);
      localStorage.setItem('isLoggedIn', 'true');
    } catch {
      clearAuthStorage();
      setUser(null);
      setToken(null);
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserEmail');
  };

  // 新しい関数: 認証エラーの共通処理
  const handleAuthError = (error: unknown) => {
    clearAuthStorage();
    setToken(null);
    setUser(null);

    if (error instanceof Error) {
      toast.error('認証エラー', {
        description: error.message,
      });
    } else {
      toast.error('認証エラー', {
        description: '予期せぬエラーが発生しました',
      });
    }

    router.push('/login');
  };

  const logout = async () => {
    try {
      const currentToken = localStorage.getItem('authToken');
      const currentRefreshToken = localStorage.getItem('refreshToken');

      if (currentRefreshToken) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (currentToken) {
          headers['Authorization'] = `Bearer ${currentToken}`;
        }

        await fetch(`${getApiUrl()}/api/v1/auth/logout`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ refresh_token: currentRefreshToken }),
        });
      }
    } catch (error) {
      console.error('[Auth] ログアウトエラー:', error);
    } finally {
      clearAuthStorage();
      setUser(null);
      setToken(null);
      window.dispatchEvent(new Event('auth-state-changed'));
      router.push('/login');
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
    checkAuth,
    refreshAccessToken,
    handleAuthError,
  };
};
