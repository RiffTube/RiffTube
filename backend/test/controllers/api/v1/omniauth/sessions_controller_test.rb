# frozen_string_literal: true

require 'test_helper'

module OmniAuth
  # Tests for OmniAuth
  class SessionsControllerTest < ActionDispatch::IntegrationTest
    setup do
      OmniAuth.config.test_mode = true
    end

    # Assert that an existing user can log in
    test 'a user can sign in with a Google account' do
      # New user logging in
      user = create(
        :user,
        email: 'joel@example.com',
        password: 'secret123',
        username: 'hax',
        uid: '1234567890',
        provider: 'google',
        name: 'Joel Hodgeson'
      )
      OmniAuth.config.mock_auth[:google_oauth2] = AuthHash.new(
        {
          provider: 'google',
          uid: user.uid,
          info: {
            email: user.email,
            name: user.name
          }
        }
      )

      get '/api/v1/auth/google_oauth2/callback'

      # Should redirect here
      assert_redirected_to '/api/v1/me'

      # Find user and assert session id
      user = User.find_by(email: 'joel@example.com')
      assert_equal session[:user_id], user.id
    end

    # Assert that failure redirects
    test 'auth failure redirects' do
      # New user logging in
      OmniAuth.config.mock_auth[:google_oauth2] = :invalid_credentials

      OmniAuth.config.on_failure = proc do |env|
        OmniAuth::FailureEndpoint.new(env).redirect_to_failure
      end

      get '/api/v1/auth/google_oauth2/callback'

      # Should redirect to failure
      assert_redirected_to '/auth/failure?message=invalid_credentials&strategy=google_oauth2'
    end
  end
end
