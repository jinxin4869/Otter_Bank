# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # 認証関連
      resources :users, only: %i[create]
      resource :user, only: %i[show update destroy]
      resources :sessions, only: %i[create destroy]
      get 'auth/verify', to: 'auth#verify'
      post 'auth/logout', to: 'auth#logout'
      get 'auth/google', to: 'auth#google'
      get 'auth/google/callback', to: 'auth#google_callback'

      # 家計簿管理
      resources :transactions, only: %i[index create update destroy] # 取引関連
      resources :savings_goals, only: %i[index create update destroy] # 貯金目標関連
      resources :achievements, only: %i[index show update] # 実績関連

      # 掲示板管理
      resources :posts do
        member do
          post 'increment_views'
          # いいね関連
          post 'like', to: 'likes#create_post_like'
          post 'unlike', to: 'likes#destroy_post_like'
        end
        # コメント関連
        resources :comments, only: %i[index create update destroy] do
          member do
            # いいね関連
            post 'like', to: 'likes#create_comment_like'
            post 'unlike', to: 'likes#destroy_comment_like'
          end
        end
        # ブックマーク関連
        resource :bookmark, only: %i[create destroy]
      end

      # ヘルスチェック
      get 'health', to: 'health#index'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
