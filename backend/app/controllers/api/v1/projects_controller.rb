# frozen_string_literal: true

module Api
  module V1
    # Handles creation of projects owned by the current user.
    class ProjectsController < ApplicationController
      include Authenticatable
      include ResponseRenderable

      before_action :authenticate_user!

      def create
        project = current_user.projects.new(project_params)

        if project.save
          render json: { project: project_json(project) }, status: :created
        else
          render_unprocessable(project)
        end
      end

      private

      def project_params
        params.require(:project).permit(:title, :video_host, :video_id, :video_url, :visibility)
      end

      # camelCase shape the frontend's ProjectDTO expects.
      def project_json(project)
        {
          id: project.id,
          title: project.title,
          videoHost: project.video_host,
          videoId: project.video_id,
          videoUrl: project.video_url,
          visibility: project.visibility
        }
      end
    end
  end
end
