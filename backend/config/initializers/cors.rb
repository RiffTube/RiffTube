# frozen_string_literal: true

DEFAULT_DEV_ORIGIN = 'http://localhost:5173'

# CSV or whitespace list, e.g.:
# FRONTEND_ORIGINS="https://app.example.com, https://admin.example.com, http://localhost:5173"
# or
# FRONTEND_ORIGINS="https://app.example.com https://admin.example.com http://localhost:5173"
ALLOWED_ORIGINS = ENV.fetch('FRONTEND_ORIGINS', DEFAULT_DEV_ORIGIN)
                     .split(/[, \s]+/)
                     .map { |o| o.strip.downcase.sub(%r{/\z}, '') } # normalize: trim, lowercase, no trailing slash
                     .reject { |o| o.empty? || o == '*' || o == 'null' }
                     .uniq
                     .freeze

LOCAL_OR_PRIVATE_ORIGIN_REGEX = %r{
  \Ahttps?://
  (?:
    localhost |
    127\.0\.0\.1 |
    0\.0\.0\.0 |
    \[::1\] |
    10\.\d{1,3}\.\d{1,3}\.\d{1,3} |
    192\.168\.\d{1,3}\.\d{1,3} |
    172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}
  )
  (?::\d+)?
  \z
}x

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*ALLOWED_ORIGINS)
    resource '*',
             headers: :any,
             methods: %i[get post put patch delete options head],
             credentials: true,
             max_age: 600
  end
end

if Rails.env.production?
  raise 'CORS misconfiguration: empty allow-list' if ALLOWED_ORIGINS.empty?

  # Block localhost/loopback/private ranges in prod
  if ALLOWED_ORIGINS.any? { |o| o.match?(LOCAL_OR_PRIVATE_ORIGIN_REGEX) }
    raise 'CORS misconfiguration: remove local/private origins from FRONTEND_ORIGINS in production'
  end

  # Require HTTPS in prod
  if ALLOWED_ORIGINS.any? { |o| o.start_with?('http://') }
    raise 'CORS misconfiguration: use HTTPS origins in production'
  end

  # Prevent shipping with only the dev default
  if ALLOWED_ORIGINS == [DEFAULT_DEV_ORIGIN]
    raise 'CORS misconfiguration: FRONTEND_ORIGINS is still localhost-only in production'
  end
end
