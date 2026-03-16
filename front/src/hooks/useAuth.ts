'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api-error';
import type { User } from '@/types/user';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // リフレッシュトークンを使ってアクセストークンを更新する
  const refreshAccessToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) return null;

    try {
      const data = await api.auth.refresh(storedRefreshToken);
      if (!data) return null;
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('refreshToken', data.refresh_token);
      return data.token;
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
      const data = await api.auth.verify(storedToken);
      setUser(data?.user ?? null);
      setToken(storedToken);
      localStorage.setItem('isLoggedIn', 'true');
    } catch (error) {
      // JWT期限切れの場合はリフレッシュを試みる
      if (error instanceof ApiError && error.code === 'token_expired') {
        const newToken = await refreshAccessToken();
        if (newToken) {
          // リフレッシュ成功: 新しいトークンで再検証
          await checkAuthWithToken(newToken);
          return;
        }
        // リフレッシュ失敗: ログアウト状態に
        clearAuthStorage();
        setUser(null);
        setToken(null);
        toast.error('認証期限切れ', {
          description: '認証期限が切れました。再度ログインしてください。',
        });
      } else {
        console.error('[Auth] JWT Token verification failed:', error);
        clearAuthStorage();
        setUser(null);
        setToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 指定したトークンで検証する（リフレッシュ後の再検証用）
  const checkAuthWithToken = async (accessToken: string) => {
    try {
      const data = await api.auth.verify(accessToken);
      setUser(data?.user ?? null);
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

  /** ログイン・登録後に認証トークンを localStorage に保存する */
  const saveAuthTokens = (
    authToken: string,
    refreshToken?: string | null,
    email?: string
  ) => {
    localStorage.setItem('authToken', authToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('isLoggedIn', 'true');
    if (email) localStorage.setItem('currentUserEmail', email);
  };

  // 認証エラーの共通処理
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
        await api.auth.logout(currentToken, currentRefreshToken);
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
    saveAuthTokens,
  };
};
