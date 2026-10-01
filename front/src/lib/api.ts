import { apiRequest, publicApiRequest } from '@/lib/api-client'
import type { ApiMonthlySummary, ApiTransaction } from '@/types/transaction'
import type { ApiPost, ApiComment, ApiPostsResponse } from '@/types/post'
import type { AchievementResponse, ApiNewlyUnlockedAchievement } from '@/types/achievement'

// ========== 型定義 ==========

type LoginResponse = {
  token: string
}

type RefreshResponse = {
  token: string
}

type RegisterParams = {
  username: string
  email: string
  password: string
  password_confirmation: string
}

export type TransactionParams = {
  amount: number
  transaction_type: "income" | "expense"
  category: string
  description: string
  date: string
}

export type UpdateUserParams = {
  username?: string
  name?: string
  current_password?: string
  password?: string
  password_confirmation?: string
}

type CreatePostParams = {
  title: string
  content: string
  category_names: string[]
}

type ContactParams = {
  name: string
  email: string
  subject: string
  message: string
}

// ========== API ==========

export const api = {
  /** 認証 */
  auth: {
    // ログイン・登録の応答はリフレッシュトークンを Set-Cookie で返す。API は別オリジンなので、
    // credentials: 'include' が無いとブラウザが Cookie を捨て、30 分後の更新（refresh）が必ず失敗する
    /** ログイン */
    login: (email: string, password: string) =>
      publicApiRequest<LoginResponse>('/sessions', {
        method: 'POST',
        body: { email, password },
        credentials: 'include',
      }),

    /** ユーザー登録 */
    register: (params: RegisterParams) =>
      publicApiRequest<LoginResponse>('/users', {
        method: 'POST',
        body: { user: params },
        credentials: 'include',
      }),

    /** パスワードリセットメール送信 */
    requestPasswordReset: (email: string) =>
      publicApiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { email },
      }),

    /** パスワードリセット確定（トークン + 新パスワード） */
    resetPassword: (token: string, password: string) =>
      publicApiRequest<{ message: string }>('/auth/reset-password/confirm', {
        method: 'POST',
        body: { token, password },
      }),

    /** JWT トークンを検証してユーザー情報を取得する（形式は parseAuthUser で検証する）。
     *  期限切れの扱いは useAuth 側で行うため、apiRequest の自動リフレッシュは使わない */
    verify: (token: string) =>
      apiRequest<unknown>('/auth/verify', { token, retryOnExpired: false }),

    /** リフレッシュトークンを使ってアクセストークンを更新する（Cookie 経由） */
    refresh: () =>
      publicApiRequest<RefreshResponse>('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      }),

    /** ログアウトしてリフレッシュトークンを無効化する（Cookie 経由） */
    logout: (token: string | null) =>
      apiRequest<void>('/sessions', {
        method: 'DELETE',
        token: token ?? undefined,
        credentials: 'include',
      }),
  },

  /** 自分のアカウント */
  user: {
    /** プロフィール・パスワードを更新する（パスワード変更には current_password が必要） */
    update: (token: string, params: UpdateUserParams) =>
      apiRequest<unknown>('/user', {
        method: 'PATCH',
        token,
        body: { user: params },
        // パスワード変更時は他の端末のセッションが失効し、この端末には新しいリフレッシュトークンの Cookie が返る
        credentials: 'include',
      }),

    /** 退会する。リフレッシュトークンの Cookie も消えるので credentials を付ける */
    destroy: (token: string) =>
      apiRequest<void>('/user', { method: 'DELETE', token, credentials: 'include' }),
  },

  /** 取引 */
  transactions: {
    /** 取引一覧を取得する（期間は yyyy-MM-dd。has_more は件数上限で切られたとき true） */
    list: (token: string, range?: { startDate: string; endDate: string }) =>
      apiRequest<{
        transactions: ApiTransaction[]
        has_more?: boolean
        summary?: { total_income: number | string; total_expense: number | string; balance: number | string }
      }>(
        range ? `/transactions?${new URLSearchParams({ start_date: range.startDate, end_date: range.endDate })}` : '/transactions',
        { token }
      ),

    /** 今月を含む直近 months か月の収入・支出（古い月から） */
    monthlySummary: (token: string, months = 6) =>
      apiRequest<ApiMonthlySummary[]>(`/transactions/monthly_summary?${new URLSearchParams({ months: String(months) })}`, {
        token,
      }),

    /** 取引を作成する */
    create: (token: string, params: TransactionParams) =>
      apiRequest<{ transaction: ApiTransaction; newly_unlocked_achievements: ApiNewlyUnlockedAchievement[] }>('/transactions', {
        method: 'POST',
        token,
        body: { transaction: params },
      }),

    /** 取引を更新する */
    update: (token: string, id: string, params: TransactionParams) =>
      apiRequest<{ transaction: ApiTransaction; newly_unlocked_achievements: ApiNewlyUnlockedAchievement[] }>(`/transactions/${id}`, {
        method: 'PATCH',
        token,
        body: { transaction: params },
      }),

    /** 取引を削除する */
    delete: (token: string, id: string) =>
      apiRequest<void>(`/transactions/${id}`, { method: 'DELETE', token }),
  },

  /** 実績 */
  achievements: {
    /** 実績一覧を取得する */
    list: (token: string) =>
      apiRequest<AchievementResponse>('/achievements', { token }),
  },

  /** お問い合わせ */
  contacts: {
    /** お問い合わせを送信する */
    send: (params: ContactParams) =>
      publicApiRequest<void>('/contacts', {
        method: 'POST',
        body: { contact: params },
      }),
  },

  /** 投稿 */
  posts: {
    /** 投稿一覧を取得する（page: ページ番号, per: 1ページあたりの件数） */
    list: (token: string, page = 1, per = 20) =>
      apiRequest<ApiPostsResponse>(`/posts?page=${page}&per=${per}`, { token }),

    /** 投稿を作成する */
    create: (token: string, params: CreatePostParams) =>
      apiRequest<ApiPost>('/posts', {
        method: 'POST',
        token,
        body: { post: params },
      }),

    /** 投稿を更新する */
    update: (token: string, id: string, params: CreatePostParams) =>
      apiRequest<ApiPost>(`/posts/${id}`, {
        method: 'PATCH',
        token,
        body: { post: params },
      }),

    /** 投稿を削除する */
    delete: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}`, { method: 'DELETE', token }),

    /** 投稿にいいねする */
    like: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}/like`, { method: 'POST', token }),

    /** 投稿のいいねを取り消す */
    unlike: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}/unlike`, { method: 'POST', token }),

    /** 投稿をブックマークする */
    bookmark: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}/bookmark`, { method: 'POST', token }),

    /** 投稿のブックマークを削除する */
    unbookmark: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}/bookmark`, { method: 'DELETE', token }),

    /** 閲覧数を増加する */
    incrementViews: (token: string, id: string) =>
      apiRequest<void>(`/posts/${id}/increment_views`, { method: 'POST', token }),

    /** コメント */
    comments: {
      /** コメント一覧を取得する */
      list: (token: string, postId: string) =>
        apiRequest<ApiComment[]>(`/posts/${postId}/comments`, { token }),

      /** コメントを投稿する */
      create: (token: string, postId: string, content: string) =>
        apiRequest<ApiComment>(`/posts/${postId}/comments`, {
          method: 'POST',
          token,
          body: { comment: { content } },
        }),

      /** コメントにいいねする */
      like: (token: string, postId: string, commentId: string) =>
        apiRequest<void>(`/posts/${postId}/comments/${commentId}/like`, {
          method: 'POST',
          token,
        }),

      /** コメントのいいねを取り消す */
      unlike: (token: string, postId: string, commentId: string) =>
        apiRequest<void>(`/posts/${postId}/comments/${commentId}/unlike`, {
          method: 'POST',
          token,
        }),
    },
  },
}
