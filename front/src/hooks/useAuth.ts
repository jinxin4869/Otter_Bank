'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  username: string;
  name?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      console.log('[Auth] 認証状態変更イベントを受信');
      checkAuth();
    };

    window.addEventListener('auth-state-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);

  const checkAuth = async () => {
    console.log('[Auth] 認証状態をチェック中...');
    setIsLoading(true); // チェック開始時にローディング状態にする
    try {
      const storedToken = localStorage.getItem('auth_token');
      console.log('[Auth] 保存されたトークン:', storedToken ? `あり (${storedToken.substring(0, 20)}...)` : 'なし');
      
      if (!storedToken) {
        console.log('[Auth] トークンが存在しません。未認証状態に設定します。');
        setUser(null);
        setToken(null);
        // setIsLoading(false) は finally で処理
        return;
      }

      setToken(storedToken); // まずトークンをセット

      try {
        const parts = storedToken.split('.');
        if (parts.length !== 3) {
          throw new Error('無効なJWTフォーマット');
        }

        const payload = JSON.parse(atob(parts[1]));
        console.log('[Auth] デコードされたペイロード:', payload);
        
        const currentTimeInSeconds = Date.now() / 1000;
        console.log('[Auth] 現在時刻 (秒):', currentTimeInSeconds, 'トークン有効期限 (秒):', payload.exp);
        
        if (payload.user_id && payload.exp > currentTimeInSeconds) {
          const userData = {
            id: payload.user_id,
            // バックエンドから実際のユーザー情報を取得するまではダミーデータ
            email: payload.email || `user${payload.user_id}@example.com`, 
            username: payload.username || `user${payload.user_id}`,
            name: payload.name || `ユーザー${payload.user_id}`
          };
          console.log('[Auth] トークンは有効。ユーザー情報を設定:', userData);
          setUser(userData);
        } else {
          console.log('[Auth] トークンが期限切れまたは無効 (user_idなし or exp切れ)。');
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        }
      } catch (decodeError) {
        console.error('[Auth] トークンデコードエラー:', decodeError);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] 認証確認中に予期せぬエラー:', error);
      // エラー発生時も未認証状態とする
      setUser(null);
      setToken(null);
    } finally {
      console.log('[Auth] 認証チェック完了');
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[Auth] ログアウト実行');
    localStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
    window.dispatchEvent(new Event('auth-state-changed')); // 状態変更を通知
  };

  const isAuthenticated = !!user && !!token;
  // このログはレンダリング毎に出力されるため、状態変化の追跡に役立つ
  console.log('[Auth] 現在の認証状態:', { isAuthenticated, userId: user?.id, hasToken: !!token, isLoading });

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    checkAuth
  };
};
