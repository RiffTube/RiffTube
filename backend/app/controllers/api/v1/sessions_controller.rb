# frozen_string_literal: true

module Api
  module V1
    # Manages login (create session) and logout (destroy session) actions.
    class SessionsController < ApplicationController
      include Authenticatable
      include ResponseRenderable

      # ────────────────────────────────────────────

      def google_oauth2_redirect
        redirect_to '/auth/google_oauth2'
      end

      def google_oauth2_callback
        user = find_or_init_user

        if user.persisted?
          log_in_and_redirect user
        elsif user.save
          setup_new_user user, auth.info
          log_in_and_redirect user
        else
          render_unprocessable(user)
        end
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

      def session_params
        params.require(:user).permit(:login, :password)
      end

      def normalized_login
        session_params[:login].to_s.downcase.strip
      end

      def find_user_by_login(login)
        User.active
            .where('LOWER(email) = :l OR LOWER(username) = :l', l: login)
            .first
      end

      def auth = request.env['omniauth.auth']

      def find_or_init_user
        User.active.find_or_initialize_by(provider: 'google', uid: auth.uid)
      end

      def setup_new_user(user, info)
        user.email    = info.email
        user.name     = info.name
        user.username = info.email.split('@').first
        user.password = SecureRandom.hex(16)
      end

      def log_in_and_redirect(user)
        log_in(user)
        redirect_to controller: :users, action: :me
      end

      # ----- predicates & error renderers (unchanged) -----
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
