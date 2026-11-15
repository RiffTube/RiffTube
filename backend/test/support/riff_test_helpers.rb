# frozen_string_literal: true

# Helpers for tests that need riffs placed on a project.
module RiffTestHelpers
  def log_in_new_user
    user = create(:user, password: 'secret123')
    log_in(user)
    user
  end

  def place_riff(project, text: 'Hello', start_time: 1.0, end_time: 4.0)
    riff = Riff.create_with_version!(creator: project.owner, title: 'Riff', text: text, styling: {})
    create(:project_riff, project: project, riff: riff, start_time: start_time, end_time: end_time)
  end
end
