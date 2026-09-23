"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api-client";
import { parseAuthUser, type AuthUser } from "@/types/user";

// 認証状態が変わったことを、他の useAuth インスタンス（ヘッダー等）へ知らせるイベント名
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";

// 検証リクエストの完了までの間に、保存済みトークンが別のもの（ログアウト・再ログイン）に変わったか。
// 変わっていれば古い検証結果は状態へ反映しない
const isSuperseded = (checkedToken: string) => localStorage.getItem("authToken") !== checkedToken;

export const useAuth = () => {
  const router = useRouter();
  // イベントの発火元を識別し、発火元自身が再検証しないようにする
  const instanceRef = useRef({});
  const notifyAuthStateChanged = () =>
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, { detail: { source: instanceRef.current } }));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    void checkAuth();

    // useAuth は呼び出しごとに状態を持つため、他のインスタンス（ログイン画面など）の
    // ログイン・ログアウトをヘッダー等へ反映するためにイベントで再検証する
    const handleAuthStateChanged = (event: Event) => {
      if ((event as CustomEvent<{ source?: unknown }>).detail?.source === instanceRef.current) return;
      void checkAuth();
    };
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
  }, []);

  // リフレッシュトークンを使ってアクセストークンを更新する
  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) return null;

      const data = await response.json();
      localStorage.setItem("authToken", data.token);
      return data.token as string;
    } catch {
      return null;
    }
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("authToken");

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });
      if (isSuperseded(storedToken)) return;

      if (!response.ok) {
        const errorData = await response.json();

        // JWT期限切れの場合はリフレッシュを試みる
        if (errorData.code === "token_expired") {
          const newToken = await refreshAccessToken();
          if (newToken) {
            // リフレッシュ成功: 新しいトークンで再検証
            await checkAuthWithToken(newToken);
            return;
          }
          // リフレッシュ失敗: ログアウト状態に
          throw new Error("認証期限が切れました。再度ログインしてください。");
        }

        throw new Error(errorData.error || "Token verification failed");
      }

      const verifiedUser = parseAuthUser(await response.json());
      if (!verifiedUser) throw new Error("ユーザー情報の取得に失敗しました");
      setUser(verifiedUser);
      setToken(storedToken);
      localStorage.setItem("isLoggedIn", "true");
    } catch (error) {
      if (isSuperseded(storedToken)) return;
      console.error("[Auth] JWT Token verification failed:", error);
      clearAuthStorage();
      setUser(null);
      setToken(null);

      // JWT期限切れ（リフレッシュ失敗含む）の場合のみトーストを表示
      if (
        error instanceof Error &&
        error.message.includes("認証期限が切れました")
      ) {
        // 複数インスタンスが同時に失敗しても 1 件だけ表示する
        toast.error("認証期限切れ", {
          id: "auth-expired",
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
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (isSuperseded(accessToken)) return;

      if (!response.ok) throw new Error("Token verification failed");

      const verifiedUser = parseAuthUser(await response.json());
      if (!verifiedUser) throw new Error("ユーザー情報の取得に失敗しました");
      setUser(verifiedUser);
      setToken(accessToken);
      localStorage.setItem("isLoggedIn", "true");
    } catch {
      if (isSuperseded(accessToken)) return;
      clearAuthStorage();
      setUser(null);
      setToken(null);
    }
  };

  const loginAuth = async (
    accessToken: string,
    email?: string,
  ) => {
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("isLoggedIn", "true");
    if (email) {
      localStorage.setItem("currentUserEmail", email);
    }

    setToken(accessToken);
    // トークン情報をもとに検証・セッション状態構築
    await checkAuthWithToken(accessToken);
    notifyAuthStateChanged();
  };

  const clearAuthStorage = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUserEmail");
  };

  const saveAuth = (
    newToken: string,
    email?: string,
  ) => {
    localStorage.setItem("authToken", newToken);
    localStorage.setItem("isLoggedIn", "true");
    if (email) {
      localStorage.setItem("currentUserEmail", email);
    }
    setToken(newToken);
    notifyAuthStateChanged();
  };

  // 新しい関数: 認証エラーの共通処理
  const handleAuthError = (error: unknown) => {
    clearAuthStorage();
    setToken(null);
    setUser(null);

    if (error instanceof Error) {
      toast.error("認証エラー", {
        description: error.message,
      });
    } else {
      toast.error("認証エラー", {
        description: "予期せぬエラーが発生しました",
      });
    }

    router.push("/login");
  };

  const logout = async () => {
    try {
      const currentToken = localStorage.getItem("authToken");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (currentToken) {
        headers["Authorization"] = `Bearer ${currentToken}`;
      }

      await fetch(`${getApiUrl()}/api/v1/sessions`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
    } catch (error) {
      console.error("[Auth] ログアウトエラー:", error);
    } finally {
      clearAuthStorage();
      setUser(null);
      setToken(null);
      notifyAuthStateChanged();
      router.push("/login");
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login: loginAuth,
    logout,
    checkAuth,
    refreshAccessToken,
    handleAuthError,
    saveAuth,
  };
};
