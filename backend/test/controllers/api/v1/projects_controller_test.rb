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

      test 'create requires authentication' do
        post '/api/v1/projects', params: {
          project: { title: 'My first project', video_host: 'youtube', video_id: 'dQw4w9WgXcQ' }
        }

        assert_response :unauthorized
      end
    end
  end
end
