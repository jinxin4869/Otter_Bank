class Api::V1::AchievementsController < ApplicationController
  before_action :authorize
  
  def index
    achievements = current_user.achievements
    render json: achievements
  end

  def show
    achievement = current_user.achievements.find(params[:id])
    render json: achievement
  rescue ActiveRecord::RecordNotFound
    render json: { error: '実績が見つかりません' }, status: :not_found
  end
end
