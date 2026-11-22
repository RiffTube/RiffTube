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
# Ruby 3.2's bundled Bundler (2.4) pre-activates the default `logger` gem and
# crashes when the lockfile wants a newer one; use the locked Bundler instead.
RUN gem install bundler -v "$(tail -1 Gemfile.lock | tr -d ' ')" --no-document && \
    bundle install && rm -rf ~/.bundle "${BUNDLE_PATH}"/ruby/*/cache

COPY backend/ ./
COPY --from=frontend /app/frontend/dist/ ./public/

RUN bundle exec bootsnap precompile app/ lib/ || true

EXPOSE 3000
CMD ["sh", "-c", "bin/rails db:prepare && bundle exec puma -C config/puma.rb"]
