# frozen_string_literal: true

module Api
  module V1
    class GuestSessionsController < ApplicationController
      # 認証をスキップ（ゲストログインなのでログイン前の処理）
      def skip_authorization?
        action_name.in?(%w[create])
      end

      def create
        user = User.guest

        token = JsonWebToken.encode(user_id: user.id)

        render json: {
          logged_in: true,
          user: user.as_json(except: [:password_digest]),
          token: token
        }
      end
    end
  end
end
