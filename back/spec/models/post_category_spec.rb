# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PostCategory, type: :model do
  # アソシエーション
  it { should belong_to(:post) }
  it { should belong_to(:category) }
end
