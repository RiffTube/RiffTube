# frozen_string_literal: true

# Provides authentication helper methods for controllers, including login, logout, and user session management.
module Authenticatable
  extend ActiveSupport::Concern

  included do
    helper_method :current_user, :logged_in?
    before_action :clear_stale_session!
  end

  def log_in(user)
    return unless user&.persisted? && user.active?

    reset_session # rotate session id
    session[:user_id] = user.id
    @current_user = user
  end

  def log_out
    reset_session
    @current_user = nil
  end

  def current_user
    @current_user ||= User.active.find_by(id: session[:user_id])
  end

  def logged_in?
    current_user.present?
  end

  def authenticate_user!
    return if logged_in?

    render json: { error: 'You must be logged in' }, status: :unauthorized
  end

  private

  def clear_stale_session!
    uid = session[:user_id]
    return unless uid

    @current_user ||= User.active.find_by(id: uid)
    session.delete(:user_id) if @current_user.nil?
  end
end
