"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
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

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// 認証状態の実体。アプリで 1 つだけ（AuthProvider）持ち、/auth/verify もマウント時に 1 回だけ呼ぶ
const useAuthState = (): AuthContextValue => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

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

    // API 呼び出し中の更新結果は api-client がイベントで知らせる
    const handleAuthStateChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ expired?: boolean }>).detail;
      // 更新失敗。再検証しても同じ結果なので、そのままセッション終了として扱う
      if (detail?.expired) {
        applySession({ kind: "rejected", expired: true });
        return;
      }
      void checkAuth();
    };
    // 更新成功。ユーザーは変わらないので、再検証せずトークンだけ差し替える
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

  // Provider はルートにあり遷移では再マウントされない。起動時に一時的な障害で確認できなかった
  // （保存済みトークンはあるのに未認証）場合は、ページ遷移のタイミングでやり直す
  const pathname = usePathname();
  const lastPathname = useRef(pathname);
  useEffect(() => {
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (user === null && localStorage.getItem("authToken")) void checkAuth();
  }, [pathname, user, checkAuth]);

  const login = useCallback(
    async (accessToken: string, email?: string) => {
      localStorage.setItem("authToken", accessToken);
      localStorage.setItem("isLoggedIn", "true");
      if (email) {
        localStorage.setItem("currentUserEmail", email);
      }
      setToken(accessToken);
      // トークン情報をもとに検証・セッション状態構築
      applySession(await resolveSession(accessToken));
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await api.auth.logout(localStorage.getItem("authToken"));
    } catch (error) {
      console.error("[Auth] ログアウトエラー:", error);
    } finally {
      clearAuthStorage();
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  }, [router]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 認証状態を読む。状態は AuthProvider が 1 つだけ持つので、どこから呼んでも同じ値になる
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth は AuthProvider の中で使ってください（app/layout.tsx で囲んでいます）");
  }
  return context;
};
