class OauthProvider < ApplicationRecord
  belongs_to :user
  
  validates :provider, presence: true
  validates :uid, presence: true
  validates :uid, uniqueness: { scope: :provider }
end
