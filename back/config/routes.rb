Rails.application.routes.draw do
  namespace :api do
    namespace :vi do
      get 'user_actions/index'
    end
    namespace :v1 do
      get 'likes/create_post_like'
      get 'likes/destroy_post_like'
      get 'likes/create_comment_like'
      get 'likes/destroy_comment_like'
      get 'comments/index'
      get 'comments/create'
      get 'comments/update'
      get 'comments/destroy'
      get 'bookmarks/create'
      get 'bookmarks/destroy'
      get 'auth/verify', to: 'auth#verify'
      resources :posts do
        member do
          post 'increment_views'
          # いいね関連
          post 'like', to: 'likes#create_post_like'
          post 'unlike', to: 'likes#destroy_post_like'
        end
        # コメント関連
        resources :comments, only: [:index, :create, :update, :destroy] do
          member do
            # いいね関連
            post 'like', to: 'likes#create_comment_like'
            post 'unlike', to: 'likes#destroy_comment_like'
          end
        end
        # ブックマーク関連
        resources :bookmarks, only: [:create, :destroy]
      end

      get 'posts/index'
      get 'posts/show'
      get 'posts/create'
      get 'auth/google_callback'

      # ユーザー関連
      resources :users, only: [:create, :update, :destroy]
      resources :sessions, only: [:create, :destroy]
      
      # 取引関連
      resources :transactions, only: [:index, :create, :update, :destroy]

      # 貯金目標関連
      resources :savings_goals, only: [:index, :create, :update, :destroy]

      # 実績関連
      resources :achievements, only: [:index, :show, :update]
      resources :user_actions, only: [:index, :create] 

      # Auth関連
      get 'auth/google', to: 'auth#google'
      get 'auth/google/callback', to: 'auth#google_callback'

      get 'health', to: 'health#index'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
