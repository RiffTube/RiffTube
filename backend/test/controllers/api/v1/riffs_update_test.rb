# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    # PATCH /projects/:id/riffs/:id — timing vs. versioned content
    class RiffsUpdateTest < ActionDispatch::IntegrationTest
      setup do
        @user = log_in_new_user
        @project = create(:project, owner: @user)
        @placement = place_riff(@project, text: 'Original', start_time: 1, end_time: 4)
        @riff = @placement.riff
        @path = "/api/v1/projects/#{@project.id}/riffs/#{@riff.id}"
      end

      test 'timing edits update the placement without a new version' do
        assert_no_difference 'RiffVersion.count' do
          patch @path, params: { riff: { start: 2.5, end: 7 } }
        end

        assert_response :ok
        assert_equal [2.5, 7.0, 1], json_body['riff'].values_at('start', 'end', 'version')
        assert_equal [2.5, 7.0], [@placement.reload.start_time, @placement.end_time]
      end

      test 'a single timing field is checked against the stored one' do
        patch @path, params: { riff: { end: 9 } }
        assert_response :ok
        assert_equal [1.0, 9.0], json_body['riff'].values_at('start', 'end')

        patch @path, params: { riff: { start: 9 } }
        assert_response :unprocessable_entity
        assert json_body['errors']['end'].present?
        assert_in_delta 1.0, @placement.reload.start_time
      end

      test 'text edits create a new version and move the riff to it' do
        assert_difference '@riff.riff_versions.count', 1 do
          patch @path, params: { riff: { text: 'Rewritten' } }
        end

        assert_response :ok
        assert_equal ['Rewritten', 2], json_body['riff'].values_at('text', 'version')
        @riff.reload
        assert_equal 2, @riff.current_version
        latest = @riff.latest_revision
        assert_equal [2, 'Rewritten', @user.id], [latest.version_number, latest.text_content, latest.changed_by]
        assert_equal 'Original', @riff.riff_versions.find_by(version_number: 1).text_content
      end

      test 'styling edits create a new version and keep the text' do
        patch @path, params: { riff: { styling: { color: '#f00', size: 'lg' } } }

        assert_response :ok
        assert_equal ['Original', 2], json_body['riff'].values_at('text', 'version')
        assert_equal({ 'color' => '#f00', 'size' => 'lg' }, @riff.reload.latest_revision.styling)
      end

      test 'unchanged content and title-only edits do not create a version' do
        assert_no_difference 'RiffVersion.count' do
          patch @path, params: { riff: { text: 'Original', title: 'Renamed' } }
        end

        assert_response :ok
        assert_equal ['Renamed', 1], json_body['riff'].values_at('title', 'version')
        assert_equal 'Renamed', @riff.reload.title
      end

      test 'invalid timing rolls back a content change in the same request' do
        assert_no_difference 'RiffVersion.count' do
          patch @path, params: { riff: { text: 'Rewritten', title: 'Renamed', start: 10, end: 3 } }
        end

        assert_response :unprocessable_entity
        assert_equal ['Riff', 1], [@riff.reload.title, @riff.current_version]
      end
    end
  end
end
