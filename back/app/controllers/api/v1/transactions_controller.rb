# frozen_string_literal: true

module Api
  module V1
    class TransactionsController < ApplicationController
      before_action :set_transaction, only: %i[update destroy]

      def index
        @transactions = current_api_v1_user.transactions.order(date: :desc, created_at: :desc)

        # 期間フィルタ
        @transactions = @transactions.where(date: (params[:start_date])..) if params[:start_date].present?
        @transactions = @transactions.where(date: ..(params[:end_date])) if params[:end_date].present?

        # タイプフィルタ（income / expense）
        if params[:transaction_type].present?
          @transactions = @transactions.where(transaction_type: params[:transaction_type])
        end

        summary_amounts = @transactions.unscope(:order).group(:transaction_type).sum(:amount)
        total_income = summary_amounts['income'] || 0
        total_expense = summary_amounts['expense'] || 0

        render json: {
          transactions: @transactions,
          summary: {
            total_income: total_income,
            total_expense: total_expense,
            balance: total_income - total_expense
          }
        }
      end

      def create
        @transaction = current_api_v1_user.transactions.new(transaction_params)

        if @transaction.save
          newly_unlocked = with_achievement_tracking { update_achievements_for_transaction(@transaction) }
          render json: { transaction: @transaction, newly_unlocked_achievements: newly_unlocked }, status: :created
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @transaction.update(transaction_params)
          newly_unlocked = with_achievement_tracking { update_achievements_for_transaction(@transaction) }
          render json: { transaction: @transaction, newly_unlocked_achievements: newly_unlocked }
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        was_income = @transaction.income?
        @transaction.destroy
        update_milestone_achievements_after_destroy if was_income
        head :no_content
      end

      private

      def set_transaction
        @transaction = current_api_v1_user.transactions.find(params.expect(:id))
      rescue ActiveRecord::RecordNotFound
        render json: { error: '取引が見つかりません' }, status: :not_found
      end

      def transaction_params
        params.expect(transaction: %i[amount transaction_type category description date])
      end

      # 取引の登録・更新後に実績を更新する
      def update_achievements_for_transaction(transaction)
        service = AchievementService.new(current_api_v1_user)

        if transaction.income?
          service.update_savings_achievements(transaction.amount)
          service.update_milestone_achievements
          # 投資カテゴリの取引で investment_debut 実績を解除する
          service.update_special_achievements(:investment_debut) if transaction.category == 'investment'
        end

        # income/expense どちらの取引でもストリークを再計算する
        # （expense を先に登録した日に income が後から来たとき最新状態を反映させるため）
        service.update_streak_achievements(current_api_v1_user.current_streak)

        # expense 取引のとき予算実績をチェックする
        update_budget_achievements(service) if transaction.expense?
      rescue StandardError => e
        Rails.logger.error "実績更新エラー: #{e.message}"
      end

      # 収入取引の削除後にマイルストーン実績を再計算する
      def update_milestone_achievements_after_destroy
        service = AchievementService.new(current_api_v1_user)
        service.update_milestone_achievements
      rescue StandardError => e
        Rails.logger.error "実績更新エラー（削除後）: #{e.message}"
      end

      # 予算実績（budget_keeper_month / budget_master_3months）をチェックして更新する
      def update_budget_achievements(service)
        budget_status = build_budget_status(service)
        return unless budget_status

        service.update_expense_achievements(budget_status)
      end

      def build_budget_status(service)
        today = Date.current
        budget = current_api_v1_user.budgets.find_by(year: today.year, month: today.month)
        return nil unless budget

        within = service.within_current_month_budget?(budget.amount)
        budgets_by_month = current_api_v1_user.budgets.to_h do |b|
          [[b.year, b.month], b.amount]
        end
        consecutive = service.calculate_consecutive_budget_months(budgets_by_month)

        { budget_set: true, within_budget: within, consecutive_months: consecutive }
      end

      # 実績更新前後を比較し、新たに解除された実績を返す
      def with_achievement_tracking
        previously_unlocked_ids = current_api_v1_user.achievements.where(unlocked: true).pluck(:id)
        yield
        current_api_v1_user.achievements
                           .where(unlocked: true)
                           .where.not(id: previously_unlocked_ids)
                           .map { |a| achievement_json(a) }
      rescue StandardError
        []
      end

      def achievement_json(achievement)
        {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          tier: achievement.tier,
          category: achievement.category,
          reward: achievement.reward,
          image_url: achievement.image_url
        }
      end
    end
  end
end
