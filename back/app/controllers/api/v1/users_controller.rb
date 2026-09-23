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
    end
  end
end
