# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authorize_request, only: [:create]

      def show; end

      def create
        user = User.new(user_params)
        if user.save
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            status: 'success', # 成功ステータスを追加
            message: 'ユーザー登録が正常に完了しました。',
            user: user.as_json(only: %i[id email username]), # パスワードダイジェストを除外
            token: token
          }, status: :created
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update; end

      private

      def user_params
        params.expect(user: %i[username email password password_confirmation])
      end
    end
  end
end
