# frozen_string_literal: true

# 投稿を扱うコントローラー共通の読み込み処理
module PostLookup
  extend ActiveSupport::Concern

  private

  # 投稿を @post に読み込む。見つからなければ 404 を返す（before_action から呼ぶと以降の処理は止まる）
  def load_post(id, relation = Post)
    @post = relation.find(id)
  rescue ActiveRecord::RecordNotFound
    render json: { error: '投稿が見つかりません' }, status: :not_found
  end
end
