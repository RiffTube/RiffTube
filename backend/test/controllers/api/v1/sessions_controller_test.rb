# frozen_string_literal: true

require 'test_helper'

module Api
  module V1
    # Test suite for the SessionsController in the API V1 namespace.
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      test 'login succeeds with valid credentials' do
        user = create(:user, email: 'foo@bar.com', password: 'secret123')

        log_in(user) # helper sends nested JSON

        assert_response :ok
        assert_equal user.id, session[:user_id]

        json = json_body
        assert_equal user.email, json['user']['email']
        assert_not json['user'].key?('password_digest')
      end

      test 'login is case-insensitive for email' do
        user = create(:user, email: 'foo@bar.com', password: 'secret123')

        post '/api/v1/login',
             params: { user: { login: 'FoO@BaR.Com', password: 'secret123' } },
             as: :json

        assert_response :ok
        assert_equal user.id, session[:user_id]
      end

      test 'login fails when credentials are missing or blank' do
        post '/api/v1/login',
             params: { user: { login: '', password: '' } },
             as: :json

        assert_response :bad_request
        assert_match(/required/i, json_body['error'])
      end

      test 'login fails with non-existent user' do
        post '/api/v1/login',
             params: { user: { login: 'nope@example.com', password: 'whatever' } },
             as: :json

        assert_response :unauthorized
        assert_match(/invalid/i, json_body['error'])
      end

      test 'login fails with wrong password' do
        user = create(:user, password: 'correct')

        post '/api/v1/login',
             params: { user: { login: user.email, password: 'wrongpassword' } },
             as: :json

        assert_response :unauthorized
        assert_match(/invalid/i, json_body['error'])
      end

      test 'login fails for soft-deleted user' do
        user = create(:user, password: 'correct', deleted_at: Time.current)

        post '/api/v1/login',
             params: { user: { login: user.email, password: 'correct' } },
             as: :json

        assert_response :unauthorized
      end

      test 'signup fails when reusing email of soft-deleted user' do
        soft_deleted = create(:user, email: 'deleted@example.com',
                                     deleted_at: Time.current)

        post '/api/v1/signup', params: {
          user: {
            email: soft_deleted.email,
            username: 'AnotherUser',
            name: 'Soft Deleted',
            password: 'secret123'
          }
        }

        assert_response :unprocessable_entity
        assert_includes json_body['errors']['email'], 'has already been taken'
      end

      test 'logout clears the session' do
        user = create(:user, password: 'secret123')
        log_in(user)

        delete '/api/v1/logout'

        assert_response :no_content
        assert_nil session[:user_id]
      end
    end
  end
end
