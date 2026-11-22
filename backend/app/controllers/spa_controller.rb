# frozen_string_literal: true

# Serves the built single-page frontend (public/index.html) for client-side routes.
class SpaController < ActionController::API
  def index
    index_file = Rails.public_path.join('index.html')
    return head :not_found unless index_file.exist?

    send_file index_file, type: 'text/html', disposition: 'inline'
  end
end
