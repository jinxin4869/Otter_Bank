Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # ユーザー関連
      resources :users, only: [:create, :update, :destroy]
      resources :sessions, only: [:create, :destroy]
      
      # 取引関連
      resources :transactions, only: [:index, :create, :update, :destroy]

      # 貯金目標関連
      resources :savings_goals, only: [:index, :create, :update, :destroy]

      # 実績関連
      resources :achievements, only: [:index, :show]

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
