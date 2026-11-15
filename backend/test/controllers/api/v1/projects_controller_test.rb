# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    # Test suite for the ProjectsController in the API V1 namespace
    class ProjectsControllerTest < ActionDispatch::IntegrationTest
      test 'create persists a project owned by the current user and returns it' do
        user = create(:user, password: 'secret123')
        log_in(user, 'secret123')

        post '/api/v1/projects', params: {
          project: {
            title: 'My first project',
            video_host: 'youtube',
            video_id: 'dQw4w9WgXcQ',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        }

        assert_response :created

        json = JSON.parse(response.body)['project']
        assert_equal 'My first project', json['title']
        assert_equal 'youtube', json['videoHost']
        assert_equal 'dQw4w9WgXcQ', json['videoId']
        assert_equal 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', json['videoUrl']
        assert_equal 'private', json['visibility']

        project = Project.find(json['id'])
        assert_equal user.id, project.owner_id
      end

      test 'create fails without a title' do
        user = create(:user, password: 'secret123')
        log_in(user, 'secret123')

        post '/api/v1/projects', params: {
          project: { title: '', video_host: 'youtube', video_id: 'dQw4w9WgXcQ' }
        }

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_includes json['errors']['title'], "can't be blank"
      end

      test "index lists only the current user's active projects, newest first" do
        user = log_in_new_user
        older = create(:project, owner: user, title: 'Older', updated_at: 2.days.ago)
        newer = create(:project, owner: user, title: 'Newer', video_id: 'abc123')
        create(:project, owner: user, deleted_at: Time.current)
        create(:project)

        get '/api/v1/projects'

        assert_response :ok
        projects = json_body['projects']
        assert_equal [newer.id, older.id], projects.pluck('id')
        assert_equal 'abc123', projects.first['videoId']
        assert projects.first['updatedAt'].present?
      end

      test 'index requires authentication' do
        get '/api/v1/projects'

        assert_response :unauthorized
      end

      test 'show returns the project to its owner' do
        user = log_in_new_user
        project = create(:project, owner: user, video_id: 'abc123')

        get "/api/v1/projects/#{project.id}"

        assert_response :ok
        assert_equal project.id, json_body['project']['id']
        assert_equal 'abc123', json_body['project']['videoId']
      end

      test 'show is a 404 for other users, deleted and unknown projects' do
        user = log_in_new_user
        deleted = create(:project, owner: user, deleted_at: Time.current)

        [create(:project).id, deleted.id, SecureRandom.uuid, 'nope'].each do |id|
          get "/api/v1/projects/#{id}"

          assert_response :not_found
        end
      end

      test 'create requires authentication' do
        post '/api/v1/projects', params: {
          project: { title: 'My first project', video_host: 'youtube', video_id: 'dQw4w9WgXcQ' }
        }

        assert_response :unauthorized
      end
    end
  end
end
