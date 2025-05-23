module ExceptionHandler
  extend ActiveSupport::Concern
  
  class InvalidToken < StandardError; end
  
  included do
    rescue_from ActiveRecord::RecordNotFound do |e|
      render json: { error: e.message }, status: :not_found
    end
    
    rescue_from ActiveRecord::RecordInvalid do |e|
      render json: { error: e.message }, status: :unprocessable_entity
    end
    
    rescue_from ExceptionHandler::InvalidToken do |e|
      render json: { error: e.message }, status: :unauthorized
    end
  end
end