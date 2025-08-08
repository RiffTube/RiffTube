# frozen_string_literal: true

host =
  if Rails.env.production?
    ENV.fetch('BACKEND_PUBLIC_URL') # e.g. https://api.rifftube.app
  else
    'http://localhost:3000'
  end

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV['GOOGLE_CLIENT_ID'],
           ENV['GOOGLE_CLIENT_SECRET'],
           {
             prompt: 'select_account',
             scope: 'email,profile',
             access_type: 'offline',
             redirect_uri: "#{host}/api/v1/auth/google_oauth2/callback",
             callback_path: '/api/v1/auth/google_oauth2/callback'
           }
end

OmniAuth.config.logger = Rails.logger
if Rails.env.development? || Rails.env.test?
  OmniAuth.config.allowed_request_methods = %i[get]
  OmniAuth.config.silence_get_warning = true
else
  OmniAuth.config.allowed_request_methods = %i[post]
end

# Send OmniAuth failures to our namespaced endpoint, which will bounce to the SPA
OmniAuth.config.on_failure = proc do |env|
  error = env['omniauth.error.type'].to_s
  strat = env['omniauth.error.strategy']&.name.to_s
  path  = "/api/v1/auth/failure?message=#{Rack::Utils.escape(error)}&strategy=#{Rack::Utils.escape(strat)}"
  Rack::Response.new([], 302, 'Location' => path).finish
end
