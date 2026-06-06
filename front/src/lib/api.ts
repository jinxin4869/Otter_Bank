import { apiRequest, publicApiRequest } from '@/lib/api-client'
import type { ApiTransaction } from '@/types/transaction'
import type { ApiPost, ApiComment, ApiPostsResponse } from '@/types/post'
import type { AchievementResponse, ApiNewlyUnlockedAchievement } from '@/types/achievement'
import type { User } from '@/types/user'

// ========== 型定義 ==========

type LoginResponse = {
  token: string
}

type RefreshResponse = {
  token: string
}

type VerifyResponse = {
  user: User
}

type RegisterParams = {
  username: string
  email: string
  password: string
  password_confirmation: string
}

type CreateTransactionParams = {
  amount: number
  transaction_type: "income" | "expense"
  category: string
  description: string
  date: string
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
    /** ログイン */
    login: (email: string, password: string) =>
      publicApiRequest<LoginResponse>('/sessions', {
        method: 'POST',
        body: { email, password },
      }),

    /** ユーザー登録 */
    register: (params: RegisterParams) =>
      publicApiRequest<LoginResponse>('/users', {
        method: 'POST',
        body: { user: params },
      }),

    /** Google OAuth コールバック */
    googleCallback: (code: string) =>
      publicApiRequest<{ token: string }>('/auth/google/callback', {
        method: 'POST',
        body: { code },
      }),

    /** パスワードリセットメール送信 */
    requestPasswordReset: (email: string) =>
      publicApiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { email },
      }),

    /** パスワードリセット確定（トークン + 新パスワード） */
    /** パスワードリセット */
    resetPassword: (token: string, password: string) =>
      publicApiRequest<{ message: string }>('/auth/reset-password/confirm', {
        method: 'POST',
        body: { token, password },
      }),

    /** JWT トークンを検証してユーザー情報を取得する */
    verify: (token: string) =>
      apiRequest<VerifyResponse>('/auth/verify', { token }),

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

  /** 取引 */
  transactions: {
    /** 取引一覧を取得する */
    list: (token: string) =>
      apiRequest<{ transactions: ApiTransaction[] }>('/transactions', { token }),

    /** 取引を作成する */
    create: (token: string, params: CreateTransactionParams) =>
      apiRequest<{ transaction: ApiTransaction; newly_unlocked_achievements: ApiNewlyUnlockedAchievement[] }>('/transactions', {
        method: 'POST',
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

    /** 実績の進捗・解除状態を更新する */
    update: (token: string, id: number, params: { progress?: number; unlocked?: boolean }) =>
      apiRequest<AchievementResponse['achievements'][number]>(`/achievements/${id}`, {
        method: 'PATCH',
        token,
        body: { achievement: params },
      }),
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
