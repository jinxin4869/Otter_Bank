# frozen_string_literal: true

module Api
  module V1
    class GuestSessionsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create]

      def create
        user = User.guest

        token = issue_tokens_for(user)

        render json: {
          logged_in: true,
          user: user.as_json(only: %i[id email username]), # 他のログイン経路と同じく許可したキーだけ返す
          token: token
        }
      end
    end
  end
end
