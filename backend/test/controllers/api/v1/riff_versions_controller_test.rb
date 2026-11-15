# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    # Version history and restore for a riff
    class RiffVersionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = log_in_new_user
        @placement = place_riff(create(:project, owner: @user), text: 'First')
        @riff = @placement.riff
        @first = @riff.latest_revision
        @riff.add_version!(user: @user, text: 'Second', styling: { color: '#0f0' })
        @path = "/api/v1/riffs/#{@riff.id}/versions"
      end

      test 'index lists versions newest first' do
        get @path

        assert_response :ok
        versions = json_body['versions']
        assert_equal [2, 1], versions.pluck('version')
        assert_equal %w[Second First], versions.pluck('text')
        assert_equal %w[createdAt id styling text version], versions.first.keys.sort
        assert_equal({ 'color' => '#0f0' }, versions.first['styling'])
      end

      test 'restore copies the old version into a new one' do
        assert_difference '@riff.riff_versions.count', 1 do
          post "#{@path}/#{@first.id}/restore"
        end

        assert_response :created
        assert_equal ['First', 3, {}], json_body['riff'].values_at('text', 'version', 'styling')
        assert_equal [1.0, 4.0], json_body['riff'].values_at('start', 'end')
        assert_equal [3, 3], [@riff.reload.current_version, @riff.latest_revision.version_number]
        assert_equal 'First', @first.reload.text_content
      end

      test 'restore is a 404 for a version of another riff' do
        other = place_riff(@placement.project).riff

        post "#{@path}/#{other.latest_revision.id}/restore"

        assert_response :not_found
      end

      test 'both actions require authentication' do
        delete '/api/v1/logout'

        get @path
        assert_response :unauthorized
        post "#{@path}/#{@first.id}/restore"
        assert_response :unauthorized
      end

      test 'riffs the user does not own, or deleted, are a 404' do
        foreign = place_riff(create(:project)).riff
        @riff.soft_delete!

        [foreign, @riff].each do |riff|
          get "/api/v1/riffs/#{riff.id}/versions"
          assert_response :not_found
          post "/api/v1/riffs/#{riff.id}/versions/#{riff.latest_revision.id}/restore"
          assert_response :not_found
        end
        assert_equal 1, foreign.reload.current_version
      end
    end
  end
end
