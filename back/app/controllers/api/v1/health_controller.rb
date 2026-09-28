# frozen_string_literal: true

module Api
  module V1
    class HealthController < ApplicationController
      skip_before_action :authorize_request, only: %i[index]

      def index
        render json: { status: 'ok', timestamp: Time.current.iso8601 }
      end
    end
  end
end
