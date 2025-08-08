# frozen_string_literal: true

# ApplicationController is the base controller for all API controllers.
class ApplicationController < ActionController::API
  include ActionController::Helpers
  include Authenticatable
  include ResponseRenderable

  FRONTEND_FALLBACK = 'http://localhost:5173'
  ALLOWED_FRONTEND_HOSTS = %w[
    localhost
    127.0.0.1
    rifftube.app
    www.rifftube.app
  ].freeze

  private

  def frontend_base_url
    @frontend_base_url ||= begin
      raw = normalized_frontend_env
      uri = parse_uri(raw)
      validate_scheme!(uri)
      validate_host!(uri)
      raw
    end
  end

  def frontend_url(path = '/', params: {})
    base = frontend_base_url
    clean_path = path.to_s.start_with?('/') ? path : "/#{path}"
    url = +"#{base}#{clean_path}"
    if params.present?
      query = Rack::Utils.build_query(params)
      url << "?#{query}"
    end
    url
  end

  def redirect_to_frontend(path = '/', params: {}, **opts)
    redirect_to(frontend_url(path, params:), { allow_other_host: true }.merge(opts))
  end

  def frontend_success_url
    frontend_url('/auth/success')
  end

  def redirect_to_frontend_success(**opts)
    redirect_to frontend_success_url, { allow_other_host: true }.merge(opts)
  end

  def normalized_frontend_env
    ENV.fetch('FRONTEND_URL', FRONTEND_FALLBACK).to_s.strip.sub(%r{/\z}, '')
  end

  def parse_uri(str)
    URI.parse(str)
  rescue URI::InvalidURIError
    raise 'Invalid FRONTEND_URL'
  end

  def validate_scheme!(uri)
    return if %w[http https].include?(uri.scheme)

    raise 'FRONTEND_URL must use http or https'
  end

  def validate_host!(uri)
    return unless Rails.env.production? # only lock down in prod
    return if ALLOWED_FRONTEND_HOSTS.include?(uri.host)

    Rails.logger.error "Unsafe FRONTEND_URL host: #{uri.host.inspect}"
    raise ActionController::RoutingError, 'Invalid request'
  end
end
