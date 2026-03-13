# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    class AchievementsControllerTest < ActionDispatch::IntegrationTest
      test 'should get index' do
        get api_v1_achievements_index_url
        assert_response :success
      end

      test 'should get show' do
        get api_v1_achievements_show_url
        assert_response :success
      end
    end
  end
end
