# frozen_string_literal: true

module Api
  module V1
    # Version history for a riff on one of the current user's projects.
    class RiffVersionsController < ApplicationController
      include RiffSerializable

      before_action :authenticate_user!
      before_action :set_placement

      def index
        versions = @riff.riff_versions.order(version_number: :desc)
        render json: { versions: versions.map { |version| version_json(version) } }
      end

      # Restoring never rewrites history: it copies the old content into a new version.
      def restore
        source = @riff.riff_versions.find_by(id: params[:id])
        return render_not_found unless source

        @riff.add_version!(user: current_user, text: source.text_content, styling: source.styling)
        render json: { riff: riff_json(@placement) }, status: :created
      end

      private

      def set_placement
        @placement = owned_placements.find_by(riff_id: params[:riff_id])
        return render_not_found unless @placement

        @riff = @placement.riff
      end

      def owned_placements
        ProjectRiff.joins(:project, :riff)
                   .where(projects: { owner_id: current_user.id, deleted_at: nil })
                   .where(riffs: { deleted_at: nil })
      end
    end
  end
end
