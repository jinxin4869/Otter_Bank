# frozen_string_literal: true

class RefreshToken < ApplicationRecord
  belongs_to :user

  attr_accessor :token # 平文トークンを保持する

  validates :token_digest, presence: true, uniqueness: true
  validates :expires_at, presence: true

  before_validation :set_token_digest, if: -> { token.present? }

  scope :active, -> { where(revoked: false).where('expires_at > ?', Time.current) }

  def self.generate_for(user)
    plain_token = SecureRandom.hex(32)
    refresh_token = new(
      user: user,
      token: plain_token,
      expires_at: 14.days.from_now
    )
    refresh_token.save!
    refresh_token
  end

  def self.find_active_by_token(plain_token)
    record = find_by_plain_token(plain_token)
    record&.active? ? record : nil
  end

  def self.find_by_plain_token(plain_token)
    # DB検索による一致確認後、secure_compareでの固定時間比較を行い、タイミング攻撃を防ぐ
    record = find_by(token_digest: digest(plain_token))
    return nil unless record
    return record if ActiveSupport::SecurityUtils.secure_compare(record.token_digest, digest(plain_token))
    
    nil
  end

  def self.digest(plain_token)
    OpenSSL::HMAC.hexdigest('SHA256', Rails.application.credentials.secret_key_base || ENV.fetch('JWT_SECRET', 'fallback'), plain_token.to_s)
  end

  def active?
    !revoked && expires_at > Time.current
  end

  def revoke!
    update!(revoked: true)
  end

  private

  def set_token_digest
    self.token_digest = self.class.digest(token)
  end
end
