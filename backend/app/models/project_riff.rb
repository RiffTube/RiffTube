# frozen_string_literal: true

# ProjectRiff represents the association between a project and a riff,
# including validations and optional sanity checks for time attributes.
class ProjectRiff < ApplicationRecord
  ## Associations
  belongs_to :project, touch: true
  belongs_to :riff

  ## Validations
  validates :project_id, :riff_id, presence: true
  validates :riff_id,
            uniqueness: { scope: :project_id,
                          message: 'already linked to this project' }

  # Optional sanity checks
  validates :start_time, :end_time,
            numericality: { greater_than_or_equal_to: 0 },
            allow_nil: true

  # The editor always places a riff at a definite time span.
  validates :start_time, :end_time, presence: true, on: :editor
  validate :end_time_after_start_time

  private

  def end_time_after_start_time
    return unless start_time.is_a?(Numeric) && end_time.is_a?(Numeric)
    return if end_time > start_time

    errors.add(:end_time, :greater_than, count: start_time)
  end
end
