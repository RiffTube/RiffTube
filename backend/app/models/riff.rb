# frozen_string_literal: true

# The Riff model represents a musical riff created by a user.
# It includes associations for creator, revisions, projects, comments, and reactions.
class Riff < ApplicationRecord
  ## Associations

  # Creator
  belongs_to :creator,
             class_name: 'User',
             foreign_key: :created_by,
             inverse_of: :created_riffs

  # Latest revision (nullable)
  belongs_to :latest_revision,
             class_name: 'RiffVersion',
             optional: true

  # All revisions
  has_many :riff_versions,
           dependent: :destroy

  # Project placement
  has_many :project_riffs,
           dependent: :destroy
  has_many :projects,
           through:   :project_riffs

  # Community
  has_many :comments,
           as: :commentable,
           dependent: :destroy
  has_many :riff_reactions,
           dependent: :destroy

  ## Validations
  validates :created_by, presence: true

  # Creates a riff together with its first version.
  def self.create_with_version!(creator:, title: nil, text: '', styling: {})
    transaction do
      riff = create!(creator: creator, title: title, current_version: 1)
      riff.add_version!(user: creator, text: text, styling: styling)
      riff
    end
  end

  def current_text
    latest_revision&.text_content.to_s
  end

  def current_styling
    latest_revision&.styling || {}
  end

  # Appends a new version and makes it the current one.
  def add_version!(user:, text:, styling:)
    with_lock do
      number = riff_versions.maximum(:version_number).to_i + 1
      version = riff_versions.create!(version_number: number, changed_by_user: user, **version_content(text, styling))
      update!(latest_revision: version, current_version: number)
      version
    end
  end

  # Adds a version only when the text or styling actually changed.
  def revise!(user:, text: current_text, styling: current_styling)
    return latest_revision if text.to_s == current_text && normalize_styling(styling) == current_styling

    add_version!(user: user, text: text, styling: styling)
  end

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  private

  def version_content(text, styling)
    { text_content: text.to_s, styling: normalize_styling(styling) }
  end

  def normalize_styling(styling)
    (styling || {}).to_h.deep_stringify_keys
  end
end
