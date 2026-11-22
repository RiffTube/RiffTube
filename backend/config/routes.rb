# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      # ─── USERS ────────────────────────────────────────────
      post 'signup', to: 'users#signup' # POST   /api/v1/signup
      get  'me',     to: 'users#me', as: :dashboard # GET /api/v1/me

      # ─── SESSIONS ─────────────────────────────────────────
      post   'login',  to: 'sessions#create'     # POST   /api/v1/login
      delete 'logout', to: 'sessions#destroy'    # DELETE /api/v1/logout

      # ─── PROJECTS ─────────────────────────────────────────
      # GET/POST /api/v1/projects, GET /api/v1/projects/:id
      resources :projects, only: %i[index show create] do
        # GET/POST /api/v1/projects/:project_id/riffs
        # PATCH/DELETE /api/v1/projects/:project_id/riffs/:id
        resources :riffs, only: %i[index create update destroy]
      end

      # ─── RIFF VERSIONS ────────────────────────────────────
      # GET  /api/v1/riffs/:riff_id/versions
      get 'riffs/:riff_id/versions', to: 'riff_versions#index', as: :riff_versions
      # POST /api/v1/riffs/:riff_id/versions/:id/restore
      post 'riffs/:riff_id/versions/:id/restore', to: 'riff_versions#restore', as: :restore_riff_version

      # ─── OAUTH ───────────────────────────────────────────
      get 'auth/csrf',                   to: 'sessions#csrf'
      get 'auth/google_oauth2',          to: 'sessions#google_oauth2_redirect'
      get 'auth/google_oauth2/callback', to: 'sessions#google_oauth2_callback'
      get 'auth/failure',                to: 'sessions#failure' # namespaced failure

      # ─── CONFIRMATIONS ───────────────────────────────────
      resources :confirmations, only: [:create] # POST /api/v1/confirmations
      get 'confirm', to: 'confirmations#confirm', as: :confirm # GET /api/v1/confirm?token=XYZ

      # ─── PASSWORD RESETS ─────────────────────────────────
      resources :password_resets,
                only: %i[create update],
                param: :token,
                constraints: { token: /\h{40}/ }
      # POST  /api/v1/password_resets
      # PATCH /api/v1/password_resets/:token
    end
  end

  # OmniAuth failures are routed to /api/v1/auth/failure (see initializers/omniauth.rb).
  # /auth/failure itself is a frontend route, served by the SPA fallback below.

  # Health check for the hosting platform
  get '/up', to: proc { [200, { 'Content-Type' => 'text/plain' }, ['ok']] }

  # In production the built frontend lives in public/. Any non-API HTML request
  # that isn't a static file gets index.html so client-side routes work on reload.
  get '*path', to: 'spa#index', constraints: lambda { |req|
    !req.path.start_with?('/api') && req.format.html?
  }
  root 'spa#index'
end
