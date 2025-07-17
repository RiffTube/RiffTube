# frozen_string_literal: true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV['GOOGLE_CLIENT_ID'],
           ENV['GOOGLE_CLIENT_SECRET'],
           {
             prompt: 'select_account',
             scope: 'email,profile',
             access_type: 'offline',
             redirect_uri: "#{
               if Rails.env.production?
                 'https://rifftube-backend.onrender.com'
               else
                 'http://localhost:3000'
               end
             }/api/v1/auth/google_oauth2/callback",
             callback_path: '/api/v1/auth/google_oauth2/callback'
           }
end
OmniAuth.config.allowed_request_methods = %i[get]
OmniAuth.config.logger = Rails.logger
