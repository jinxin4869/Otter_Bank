# frozen_string_literal: true

class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where(revoked: false).where('expires_at > ?', Time.current) }

  def self.generate_for(user)
    create!(
      user: user,
      token: SecureRandom.hex(32),
      expires_at: 30.days.from_now
    )
  end

  def active?
    !revoked && expires_at > Time.current
  end

  def revoke!
    update!(revoked: true)
  end
end
