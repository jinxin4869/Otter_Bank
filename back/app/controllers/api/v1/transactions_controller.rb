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
          update_achievements_for_transaction(@transaction)
          render json: @transaction, status: :created
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @transaction.update(transaction_params)
          update_achievements_for_transaction(@transaction)
          render json: @transaction
        else
          render json: { errors: @transaction.errors.full_messages }, status: :unprocessable_entity
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
        @transaction = current_api_v1_user.transactions.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: '取引が見つかりません' }, status: :not_found
      end

      def transaction_params
        params.expect(transaction: %i[amount transaction_type category description date])
      end

      # 収入取引の登録・更新後に実績を更新する
      def update_achievements_for_transaction(transaction)
        return unless transaction.income?

        service = AchievementService.new(current_api_v1_user)
        service.update_savings_achievements(transaction.amount)
        service.update_milestone_achievements
        service.update_streak_achievements(current_api_v1_user.current_streak)
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
    end
  end
end
