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
          render_created(project, serializer: ProjectSerializer)
        else
          render_unprocessable(project)
        end
      end

      private

      def project_params
        params.require(:project).permit(:title, :video_host, :video_id, :video_url, :visibility)
      end
    end
  end
end
