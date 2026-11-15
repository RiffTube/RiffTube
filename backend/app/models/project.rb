# frozen_string_literal: true

# The Project model represents a project in the system.
# It includes associations for ownership, riffs, collaborations, tags, and comments.
# Projects can also be forked from other projects and have various visibility settings.
class Project < ApplicationRecord
  ## Associations

  # Owner
  belongs_to :owner, class_name: 'User'

  # Fork relationship (optional)
  belongs_to :forked_from_project,
             class_name: 'Project',
             optional: true

  # Riffs
  has_many :project_riffs,
           dependent: :destroy
  has_many :riffs,
           through:   :project_riffs

  # Collaborations
  has_many :collaborations,
           dependent: :destroy
  has_many :collaborators,
           through: :collaborations,
           source: :user

  # Tags
  has_many :project_tags,
           dependent: :destroy
  has_many :tags,
           through:   :project_tags

  # Comments (polymorphic)
  has_many :comments,
           as: :commentable,
           dependent: :destroy

  ## Scopes
  scope :active, -> { where(deleted_at: nil) }

  ## Validations
  before_validation { title&.strip! }
  validates :title, presence: true, length: { maximum: 255 }
  validates :video_host,  presence: true
  validates :visibility,  inclusion: { in: %w[public private unlisted] }
  validates :shareable_link, uniqueness: true, allow_nil: true
end
