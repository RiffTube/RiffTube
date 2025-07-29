# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  # DEVELOPMENT: allow localhost frontend
  allow do
    origins 'http://localhost:5173'
    resource '*',
             headers: :any,
             methods: %i[get post put patch delete options head],
             credentials: true
  end

  # PRODUCTION: allow frontend domain
  # TODO: before deploying to production, replace the placeholder domain below
  # actual frontend URL (e.g. https://rifftube.net)

  allow do
    origins 'https://your-frontend-domain.com'
    resource '*',
             headers: :any,
             methods: %i[get post put patch delete options head],
             credentials: true
  end
end
