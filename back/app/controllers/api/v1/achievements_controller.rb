class Api::V1::AchievementsController < ApplicationController
  before_action :authorize
  
  def index
        achievements = current_user.achievements.order(:original_achievement_id) # original_achievement_id でソート
        render json: achievements.map { |ach|
          {
            id: ach.id, # DB上のID
            original_achievement_id: ach.original_achievement_id, # フロントエンドと紐づくID
            title: ach.title,
            description: ach.description,
            category: ach.category,
            unlocked: ach.unlocked,
            progress: ach.progress,
            image_url: ach.image_url,
            reward: ach.reward,
            tier: ach.tier,
            created_at: ach.created_at,
            updated_at: ach.updated_at
            # 必要に応じて、進捗目標値 (progress_target) なども返す
          }
        }
      end

  def update
        achievement = current_user.achievements.find_by(id: params[:id])

        if achievement
          if achievement.update(achievement_params)
            # フロントエンドで使う主要な情報を返す
            render json: {
              id: achievement.id,
              original_achievement_id: achievement.original_achievement_id,
              title: achievement.title,
              description: achievement.description,
              category: achievement.category,
              unlocked: achievement.unlocked,
              progress: achievement.progress,
              image_url: achievement.image_url,
              reward: achievement.reward,
              tier: achievement.tier
            }, status: :ok
          else
            render json: { errors: achievement.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { error: "Achievement not found" }, status: :not_found
        end
      end

  def show
    achievement = current_user.achievements.find(params[:id])
    render json: achievement
  rescue ActiveRecord::RecordNotFound
    render json: { error: '実績が見つかりません' }, status: :not_found
  end

  private

  def achievement_params
    # progress, unlocked など、更新可能なパラメータを指定
    params.require(:achievement).permit(:progress, :unlocked)
  end
end
