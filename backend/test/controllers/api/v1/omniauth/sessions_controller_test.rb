# frozen_string_literal: true

require 'test_helper'
require 'uri'

module OmniAuth
  # Tests for OmniAuth
  class SessionsControllerTest < ActionDispatch::IntegrationTest
    setup do
      OmniAuth.config.test_mode = true
      @old_frontend = ENV['FRONTEND_URL']
      ENV['FRONTEND_URL'] = 'http://localhost:5173'
    end

    teardown do
      ENV['FRONTEND_URL'] = @old_frontend
      OmniAuth.config.mock_auth[:google_oauth2] = nil
      OmniAuth.config.on_failure = nil
    end

    test 'a user can sign in with a Google account' do
      user = create(
        :user,
        email: 'joel@example.com',
        password: 'secret123',
        username: 'hax',
        uid: '1234567890',
        provider: 'google',
        name: 'Joel Hodgson'
      )

      OmniAuth.config.mock_auth[:google_oauth2] = AuthHash.new(
        provider: 'google',
        uid: user.uid,
        info: { email: user.email, name: user.name }
      )

      get '/api/v1/auth/google_oauth2/callback'
      assert_response :redirect
      assert_equal 'http://localhost:5173/auth/success', response.location

      get '/api/v1/me'
      assert_response :success
      verify_user_response(user)
    end

    test 'auth failure redirects' do
      OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials
      OmniAuth.config.on_failure = proc { |env| OmniAuth::FailureEndpoint.new(env).redirect_to_failure }

      get '/api/v1/auth/google_oauth2/callback'
      assert_redirected_to '/auth/failure?message=invalid_credentials&strategy=google_oauth2'

      get '/api/v1/auth/failure', params: { message: 'invalid_credentials', strategy: 'google_oauth2' }
      assert_response :redirect
      assert_equal(
        'http://localhost:5173/auth/failure?message=invalid_credentials&strategy=google_oauth2',
        response.location
      )
    end

    test 'redirect forwards query params to OmniAuth' do
      get '/api/v1/auth/google_oauth2', params: { signup: 'true' }
      assert_response :redirect

      uri = URI.parse(response.location)
      assert_equal '/auth/google_oauth2', uri.path
      assert_equal 'signup=true', uri.query
    end

    private

    def verify_user_response(user)
      payload = JSON.parse(response.body)
      assert_equal user.id,       payload.dig('user', 'id')
      assert_equal user.email,    payload.dig('user', 'email')
      assert_equal user.username, payload.dig('user', 'username')
    end
  end
end
