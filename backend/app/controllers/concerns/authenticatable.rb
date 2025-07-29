# app/controllers/concerns/authenticatable.rb
module Authenticatable
  extend ActiveSupport::Concern

  included do
    helper_method :current_user, :logged_in?
  end

  def log_in(user)
    return false unless user&.persisted?

    reset_session
    session[:user_id] = user.id
    @current_user = user
    true
  end

  def log_out
    reset_session
    @current_user = nil
  end

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = User.active.find_by(id: session[:user_id])
  end

  def logged_in?
    current_user.present?
  end

  def authenticate_user!
    return if logged_in?

    render json: { error: 'You must be logged in' }, status: :unauthorized
  end
end
