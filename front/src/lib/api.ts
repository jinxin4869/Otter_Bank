import { apiRequest, publicApiRequest } from '@/lib/api-client'
import type { ApiTransaction } from '@/types/transaction'
import type { ApiPost, ApiComment } from '@/types/post'
import type { AchievementResponse } from '@/types/achievement'

// ========== 型定義 ==========

type LoginResponse = {
  token: string
  refresh_token?: string
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

    /** パスワードリセット */
    resetPassword: (token: string, password: string) =>
      publicApiRequest<void>('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      }),
  },

  /** 取引 */
  transactions: {
    /** 取引一覧を取得する */
    list: (token: string) =>
      apiRequest<{ transactions: ApiTransaction[] }>('/transactions', { token }),

    /** 取引を作成する */
    create: (token: string, params: CreateTransactionParams) =>
      apiRequest<ApiTransaction>('/transactions', {
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
    /** 投稿一覧を取得する */
    list: (token: string) =>
      apiRequest<ApiPost[]>('/posts', { token }),

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
