# frozen_string_literal: true

# Serializes a Project into the camelCase shape the frontend expects.
class ProjectSerializer
  def initialize(project)
    @project = project
  end

  def serializable_hash
    {
      id: @project.id,
      title: @project.title,
      videoHost: @project.video_host,
      videoId: @project.video_id,
      videoUrl: @project.video_url,
      visibility: @project.visibility
    }
  end
end
