# syntax=docker/dockerfile:1
#
# Single-service production image: builds the Vite frontend, then serves it
# from Rails' public/ folder alongside the API, so both share one origin
# (no CORS or cross-site cookies needed).

# ─── 1) Frontend build ─────────────────────────────────────────────
FROM node:20-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─── 2) Rails runtime ──────────────────────────────────────────────
FROM ruby:3.2.3-slim AS app
WORKDIR /app

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential libpq-dev libyaml-dev git && \
    rm -rf /var/lib/apt/lists/*

ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_WITHOUT="development:test" \
    BUNDLE_PATH=/usr/local/bundle \
    RAILS_SERVE_STATIC_FILES=1 \
    RAILS_LOG_TO_STDOUT=1

COPY backend/Gemfile backend/Gemfile.lock ./
# Ruby 3.2 ships Bundler 2.4 as a default gem, which pre-activates the default
# `logger` 1.5.3 and crashes because the lockfile wants 1.7.0. Merely installing
# a newer Bundler isn't enough: `require "bundler/setup"` (config/boot.rb) still
# loads the default copy. Upgrading RubyGems replaces the default Bundler itself.
# RubyGems 3.6.9 ships Bundler 2.6.9, matching BUNDLED WITH in Gemfile.lock.
RUN gem update --system 3.6.9 --no-document && \
    bundle install && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/cache

# Fail the build (not the deploy) if boot would load the wrong Bundler/logger.
RUN ruby -e 'require "bundler/setup"; require "logger"; \
  puts "bundler #{Bundler::VERSION}, logger #{Logger::VERSION}"; \
  abort "logger mismatch" unless Logger::VERSION == "1.7.0"'

COPY backend/ ./
COPY --from=frontend /app/frontend/dist/ ./public/

RUN bundle exec bootsnap precompile app/ lib/ || true

EXPOSE 3000
CMD ["sh", "-c", "bundle exec rails db:prepare && bundle exec puma -C config/puma.rb"]
