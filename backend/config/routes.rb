# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # ─── USERS ────────────────────────────────────────────
      post 'signup', to: 'users#signup',  as: :signup     # POST   /api/v1/signup
      get  'me',     to: 'users#me',      as: :dashboard  # GET    /api/v1/me

      # ─── SESSIONS ─────────────────────────────────────────
      post   'login',  to: 'sessions#create'   # POST   /api/v1/login
      delete 'logout', to: 'sessions#destroy'  # DELETE /api/v1/logout

      # ─── OAUTH ───────────────────────────────────────────
      get 'auth/google_oauth2',          to: 'sessions#google_oauth2_redirect'
      get 'auth/google_oauth2/callback', to: 'sessions#google_oauth2_callback'

      # ─── CONFIRMATIONS ───────────────────────────────────
      resources :confirmations, only: [:create] # POST   /api/v1/confirmations
      get 'confirm', to: 'confirmations#confirm', as: :confirm # GET    /api/v1/confirm?token=XYZ

      # ─── PASSWORD RESETS ─────────────────────────────────
      resources :password_resets,
                only: %i[create update],
                param: :token,
                constraints: { token: /\h{40}/ }
      # POST   /api/v1/password_resets
      # PATCH  /api/v1/password_resets/:token
    end
  end
end
