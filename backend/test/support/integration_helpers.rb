# frozen_string_literal: true

# This module provides helper methods for integration tests,
# including JSON response parsing and user login functionality.
module IntegrationHelpers
  def json_body
    JSON.parse(response.body) if response.body.present?
  end

  def log_in(user, password = 'secret123')
    post '/api/v1/login',
         params: { user: { login: user.email, password: password } },
         as: :json
  end
end
