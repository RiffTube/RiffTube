# frozen_string_literal: true

module Api
  module V1
    # Manages login (create session) and logout (destroy session) actions.
    class SessionsController < ApplicationController
      include Authenticatable
      include ResponseRenderable

      def google_oauth2_redirect
        qs   = request.query_string.presence
        path = '/auth/google_oauth2'
        path = "#{path}?#{qs}" if qs
        redirect_to path, only_path: true
      end

      def google_oauth2_callback
        user = find_or_init_user
        return log_in_and_redirect(user) if user.persisted?

        build_from_oauth(user, auth.info)
        return render_unprocessable(user) unless user.save

        log_in_and_redirect(user)
      end

      def failure
        redirect_to_frontend(
          '/auth/failure',
          params: { message: params[:message].to_s, strategy: params[:strategy].to_s }
        )
      end

      def create
        return render_missing_credentials if blank_credentials?

        user = find_user_by_login(normalized_login)
        return render_invalid_credentials unless user&.authenticate(session_params[:password])

        log_in(user)
        render_ok(user)
      end

      def destroy
        log_out
        head :no_content
      end

      private

      def build_from_oauth(user, info)
        email         = info.email.to_s
        user.email    = email
        user.name     = info.name
        user.username = email.split('@').first
        user.password = SecureRandom.hex(16)
      end

      def session_params
        params.require(:user).permit(:login, :password)
      end

      def normalized_login
        session_params[:login].to_s.downcase.strip
      end

      def find_user_by_login(login)
        User.active.where('LOWER(email) = :l OR LOWER(username) = :l', l: login).first
      end

      def auth = request.env['omniauth.auth']

      def find_or_init_user
        User.active.find_or_initialize_by(provider: 'google', uid: auth.uid)
      end

      def log_in_and_redirect(user)
        log_in(user)
        redirect_to_frontend_success
      end

      def blank_credentials?
        normalized_login.blank? || session_params[:password].blank?
      end

      def render_missing_credentials
        render json: { error: 'Login and password are required' }, status: :bad_request
      end

      def render_invalid_credentials
        Rails.logger.warn "Failed login for #{normalized_login}"
        render json: { error: 'Invalid login or password' }, status: :unauthorized
      end
    end
  end
end
