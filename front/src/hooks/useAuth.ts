"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";
import { parseAuthUser, type AuthUser } from "@/types/user";

// 認証状態が変わったことを、他の useAuth インスタンス（ヘッダー等）へ知らせるイベント名
const AUTH_STATE_CHANGED_EVENT = "auth-state-changed";

// 検証リクエストの完了までの間に、保存済みトークンが別のもの（ログアウト・再ログイン）に変わったか。
// 変わっていれば古い検証結果は状態へ反映しない
const isSuperseded = (checkedToken: string) => localStorage.getItem("authToken") !== checkedToken;

const clearAuthStorage = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUserEmail");
};

// リフレッシュトークンは使うたびに作り直されるため、並行して呼ぶと片方が失敗する。
// 複数のインスタンスが同時に期限切れを検知しても、リフレッシュは 1 回だけ行う
let refreshInFlight: Promise<string | null> | null = null;

const refreshAccessToken = (): Promise<string | null> => {
  refreshInFlight ??= api.auth
    .refresh()
    .then((data) => {
      const newToken = data?.token;
      if (typeof newToken !== "string") return null;
      localStorage.setItem("authToken", newToken);
      return newToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
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

  const notifyAuthStateChanged = useCallback(() => {
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGED_EVENT, { detail: { source: instanceRef.current } }));
  }, []);

  const applySession = useCallback((result: SessionResult) => {
    switch (result.kind) {
      case "superseded":
        return;
      case "authenticated":
        setUser(result.user);
        setToken(result.token);
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
      if ((event as CustomEvent<{ source?: unknown }>).detail?.source === instanceRef.current) return;
      void checkAuth();
    };
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthStateChanged);
  }, [checkAuth]);

  const login = useCallback(async (accessToken: string, email?: string) => {
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

  const logout = useCallback(async () => {
    try {
      await api.auth.logout(localStorage.getItem("authToken"));
    } catch (error) {
      console.error("[Auth] ログアウトエラー:", error);
    } finally {
      clearAuthStorage();
      setUser(null);
      setToken(null);
      notifyAuthStateChanged();
      router.push("/login");
    }
  }, [notifyAuthStateChanged, router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };
};
