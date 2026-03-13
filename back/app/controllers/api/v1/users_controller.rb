# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      skip_before_action :authorize_request, only: [:create]

      def show
        render json: {
          id: @current_user.id,
          email: @current_user.email,
          username: @current_user.username,
          name: @current_user.name
        }
      end

      def create
        user = User.new(user_params)
        if user.save
          token = JsonWebToken.encode(user_id: user.id)
          render json: {
            status: 'success',
            message: 'ユーザー登録が正常に完了しました。',
            user: user.as_json(only: %i[id email username]),
            token: token
          }, status: :created
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      def update
        if @current_user.update(update_user_params)
          render json: {
            id: @current_user.id,
            email: @current_user.email,
            username: @current_user.username,
            name: @current_user.name
          }
        else
          render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
        end
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
