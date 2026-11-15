# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    # Listing, creating and deleting riffs on a project
    class RiffsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = log_in_new_user
        @project = create(:project, owner: @user)
        @path = "/api/v1/projects/#{@project.id}/riffs"
      end

      test 'index returns the flat riff shape sorted by start' do
        late = place_riff(@project, text: 'Late', start_time: 20, end_time: 23)
        early = place_riff(@project, text: 'Early', start_time: 2, end_time: 5)
        place_riff(@project, text: 'Gone').riff.soft_delete!

        get @path

        assert_response :ok
        riffs = json_body['riffs']
        assert_equal [early.riff_id, late.riff_id], riffs.pluck('id')
        assert_equal %w[end id start styling text title version], riffs.first.keys.sort
        assert_equal ['Early', 2.0, 5.0, 1], riffs.first.values_at('text', 'start', 'end', 'version')
        assert_equal({}, riffs.first['styling'])
      end

      test 'create builds the riff, its first version and its placement' do
        assert_difference %w[Riff.count RiffVersion.count ProjectRiff.count], 1 do
          post @path, params: { riff: { start: 3, end: 6, title: 'Zinger', text: 'Ha', styling: { color: '#fff' } } }
        end

        assert_response :created
        riff = Riff.find(json_body['riff']['id'])
        assert_equal @user.id, riff.created_by
        assert_equal [1, 'Ha'], [riff.current_version, riff.latest_revision.text_content]
        assert_equal({ 'color' => '#fff' }, json_body['riff']['styling'])
        assert_equal [3.0, 6.0, 'Zinger'], json_body['riff'].values_at('start', 'end', 'title')
      end

      test 'create rejects bad timing without leaving records behind' do
        invalid = [{ start: 5, end: 5 }, { start: 6, end: 2 }, { start: -1, end: 2 }, { end: 2 }, { start: 1 }]

        assert_no_difference %w[Riff.count RiffVersion.count ProjectRiff.count] do
          invalid.each do |timing|
            post @path, params: { riff: timing.merge(text: 'Nope') }

            assert_response :unprocessable_entity
            assert json_body['errors'].slice('start', 'end').values.flatten.any?, timing.inspect
          end
        end
      end

      test 'destroy soft-deletes the riff and hides it from the list' do
        placement = place_riff(@project)

        delete "#{@path}/#{placement.riff_id}"

        assert_response :no_content
        assert_not_nil placement.riff.reload.deleted_at
        get @path
        assert_empty json_body['riffs']

        delete "#{@path}/#{placement.riff_id}"
        assert_response :not_found
      end

      test 'every action requires authentication' do
        placement = place_riff(@project)
        delete '/api/v1/logout'

        get @path
        assert_response :unauthorized
        post @path, params: { riff: { start: 1, end: 2 } }
        assert_response :unauthorized
        patch "#{@path}/#{placement.riff_id}", params: { riff: { start: 2 } }
        assert_response :unauthorized
        delete "#{@path}/#{placement.riff_id}"
        assert_response :unauthorized
      end

      test "another user's project is a 404 for every action" do
        other = create(:project)
        placement = place_riff(other)
        path = "/api/v1/projects/#{other.id}/riffs"

        get path
        assert_response :not_found
        post path, params: { riff: { start: 1, end: 2 } }
        assert_response :not_found
        patch "#{path}/#{placement.riff_id}", params: { riff: { start: 2 } }
        assert_response :not_found
        delete "#{path}/#{placement.riff_id}"
        assert_response :not_found
        assert_nil placement.riff.reload.deleted_at
      end

      test 'a riff from another project is a 404' do
        placement = place_riff(create(:project, owner: @user))

        patch "#{@path}/#{placement.riff_id}", params: { riff: { start: 2 } }

        assert_response :not_found
      end
    end
  end
end
