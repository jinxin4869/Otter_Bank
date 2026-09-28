# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authorize_request, only: [:create]

      def show
        render json: user_json(@current_user)
      end

      def create
        user = User.new(user_params)
        if user.save
          token = issue_tokens_for(user)
          render json: {
            status: 'success',
            message: 'ユーザー登録が正常に完了しました。',
            user: user.as_json(only: %i[id email username]),
            token: token
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        # パスワードやメールアドレスの変更は、盗まれたアクセストークンだけではできないよう現在のパスワードを求める
        if changing_credentials? && !@current_user.authenticate(params.dig(:user, :current_password).to_s)
          render json: { error: '現在のパスワードが正しくありません', code: 'invalid_current_password' },
                 status: :unauthorized
          return
        end

        if @current_user.update(update_user_params)
          render json: user_json(@current_user)
        else
          render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @current_user.destroy
        head :no_content
      end

      private

      def user_params
        params.expect(user: %i[username email password password_confirmation])
      end

      def update_user_params
        params.expect(user: %i[username email name password password_confirmation])
      end

      def changing_credentials?
        user_params = params[:user]
        return false unless user_params.respond_to?(:key?)

        user_params.key?(:password) || (user_params.key?(:email) && user_params[:email] != @current_user.email)
      end
    end
  end
end
