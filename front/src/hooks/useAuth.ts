"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { AUTH_STATE_CHANGED_EVENT, AUTH_TOKEN_REFRESHED_EVENT, refreshAccessToken } from "@/lib/api-client";
import { parseAuthUser, type AuthUser } from "@/types/user";

// 検証リクエストの完了までの間に、保存済みトークンが別のもの（ログアウト・再ログイン）に変わったか。
// 変わっていれば古い検証結果は状態へ反映しない
const isSuperseded = (checkedToken: string) => localStorage.getItem("authToken") !== checkedToken;

const clearAuthStorage = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUserEmail");
};

type SessionResult =
  | { kind: "authenticated"; user: AuthUser; token: string }
  | { kind: "rejected"; expired: boolean } // サーバーが認証を拒否した（保存済みトークンを消す）
  | { kind: "unavailable" } // ネットワーク障害など一時的な失敗（トークンは残し、次回の確認でやり直す）
  | { kind: "superseded" }; // 確認中にログアウト・再ログインされた（結果を使わない）

// トークンを検証してユーザーを確定する。期限切れなら 1 回だけリフレッシュしてやり直す
const resolveSession = async (accessToken: string): Promise<SessionResult> => {
  let current = accessToken;
  try {
    let data: unknown;
    try {
      data = await api.auth.verify(current);
    } catch (error) {
      if (!(error instanceof ApiError && error.code === "token_expired")) throw error;
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return isSuperseded(current) ? { kind: "superseded" } : { kind: "rejected", expired: true };
      }
      current = refreshed;
      data = await api.auth.verify(current);
    }
    if (isSuperseded(current)) return { kind: "superseded" };

    const user = parseAuthUser(data);
    return user ? { kind: "authenticated", user, token: current } : { kind: "rejected", expired: false };
  } catch (error) {
    if (isSuperseded(current)) return { kind: "superseded" };
    console.error("[Auth] 認証の確認に失敗しました:", error);
    return error instanceof ApiError ? { kind: "rejected", expired: false } : { kind: "unavailable" };
  }
};

export const useAuth = () => {
  const router = useRouter();
  // イベントの発火元を識別し、発火元自身が再検証しないようにする
  const instanceRef = useRef({});
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  // 自分でログアウトした（期限切れ・未ログインとは区別する）。ログイン必須ページが /login へ飛ばさないために使う
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  const notifyAuthStateChanged = useCallback((extra: { loggedOut?: boolean } = {}) => {
    window.dispatchEvent(
      new CustomEvent(AUTH_STATE_CHANGED_EVENT, { detail: { source: instanceRef.current, ...extra } })
    );
  }, []);

  const applySession = useCallback((result: SessionResult) => {
    switch (result.kind) {
      case "superseded":
        return;
      case "authenticated":
        setUser(result.user);
        setToken(result.token);
        setHasLoggedOut(false);
        localStorage.setItem("isLoggedIn", "true");
        return;
      case "unavailable":
        setUser(null);
        setToken(null);
        return;
      case "rejected":
        clearAuthStorage();
        setUser(null);
        setToken(null);
        if (result.expired) {
          // 複数インスタンスが同時に失敗しても 1 件だけ表示する
          toast.error("認証期限切れ", {
            id: "auth-expired",
            description: "認証期限が切れました。再度ログインしてください。",
          });
        }
        return;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      applySession(await resolveSession(storedToken));
    } else {
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  }, [applySession]);

  useEffect(() => {
    void checkAuth();

    // useAuth は呼び出しごとに状態を持つため、他のインスタンス（ログイン画面など）の
    // ログイン・ログアウトをヘッダー等へ反映するためにイベントで再検証する
    const handleAuthStateChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: unknown; expired?: boolean; loggedOut?: boolean }>).detail;
      if (detail?.source === instanceRef.current) return;
      // 他のインスタンス（ヘッダーなど）で自分でログアウトした。ログイン必須ページが /login へ飛ばさないよう区別する
      if (detail?.loggedOut) {
        setUser(null);
        setToken(null);
        setHasLoggedOut(true);
        return;
      }
      // API 呼び出し中の更新失敗。再検証しても同じ結果なので、そのままセッション終了として扱う
      if (detail?.expired) {
        applySession({ kind: "rejected", expired: true });
        return;
      }
      void checkAuth();
    };
    // API 呼び出し中にトークンが更新された。ユーザーは変わらないので、再検証せずトークンだけ差し替える
    const handleTokenRefreshed = (event: Event) => {
      const token = (event as CustomEvent<{ token?: unknown }>).detail?.token;
      if (typeof token === "string") setToken(token);
    };
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    window.addEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
      window.removeEventListener(AUTH_TOKEN_REFRESHED_EVENT, handleTokenRefreshed);
    };
  }, [checkAuth, applySession]);

  const login = useCallback(async (accessToken: string, email?: string) => {
    // 検証の結果（失敗を含む）を待たずに、ログアウト済みの印は外す
    setHasLoggedOut(false);
    localStorage.setItem("authToken", accessToken);
    localStorage.setItem("isLoggedIn", "true");
    if (email) {
      localStorage.setItem("currentUserEmail", email);
    }
    setToken(accessToken);
    // トークン情報をもとに検証・セッション状態構築
    applySession(await resolveSession(accessToken));
    notifyAuthStateChanged();
  }, [applySession, notifyAuthStateChanged]);

  // 自分の操作でセッションを終える（ログアウト・退会）。ログイン必須ページが /login へ飛ばさないよう印を立て、
  // ログインフォームではなくトップ（ログイン・新規登録の導線あり）へ戻す
  const endSession = useCallback((message: string) => {
    clearAuthStorage();
    setUser(null);
    setToken(null);
    setHasLoggedOut(true);
    notifyAuthStateChanged({ loggedOut: true });
    toast.success(message);
    router.push("/");
  }, [notifyAuthStateChanged, router]);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout(localStorage.getItem("authToken"));
    } catch (error) {
      console.error("[Auth] ログアウトエラー:", error);
    } finally {
      endSession("ログアウトしました");
    }
  }, [endSession]);

  /** 退会（アカウントと家計データの削除）。成功したらセッションを終えてトップへ。失敗はトーストで知らせて false */
  const deleteAccount = useCallback(async (): Promise<boolean> => {
    if (!token) return false;
    try {
      await api.user.destroy(token);
    } catch (error) {
      console.error("[Auth] 退会エラー:", error);
      toast.error("退会できませんでした", {
        description: error instanceof Error ? error.message : "時間をおいて再度お試しください",
      });
      return false;
    }
    // サーバー側でトークンごと消えているので、ログアウト API は呼ばない
    endSession("退会しました。ご利用ありがとうございました");
    return true;
  }, [token, endSession]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    hasLoggedOut,
    login,
    logout,
    deleteAccount,
    // プロフィールを更新したあと、表示中のユーザー情報を取り直す
    refreshUser: checkAuth,
  };
};
