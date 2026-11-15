# frozen_string_literal: true

# JSON shapes for riffs and their versions, shared by the riff controllers.
module RiffSerializable
  extend ActiveSupport::Concern

  private

  # Flat shape the editor works with: placement + riff + current version.
  def riff_json(project_riff)
    riff = project_riff.riff
    {
      id: riff.id,
      start: project_riff.start_time,
      end: project_riff.end_time,
      title: riff.title,
      text: riff.current_text,
      styling: riff.current_styling,
      version: riff.current_version
    }
  end

  def version_json(version)
    {
      id: version.id,
      version: version.version_number,
      text: version.text_content.to_s,
      styling: version.styling || {},
      createdAt: version.created_at
    }
  end
end
