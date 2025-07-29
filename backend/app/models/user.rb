# frozen_string_literal: true

# Represents a registered RiffTube user. Handles:
# • Authentication (has_secure_password)
# • Email confirmation + password-reset (concerns)
# • Full set of content, collaboration, and social associations
# • Soft-delete helpers
class User < ApplicationRecord
  # -------------------------------------------------------------------------
  # Concerns
  # -------------------------------------------------------------------------
  include EmailConfirmable
  include PasswordResettable

  # -------------------------------------------------------------------------
  # Authentication & validation
  # -------------------------------------------------------------------------
  has_secure_password
  before_validation :normalize_email

  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            length: { maximum: 255 },
            format: { with: URI::MailTo::EMAIL_REGEXP }

  validates :username,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: /\A[a-zA-Z0-9_]+\z/,
                      message: 'letters, numbers, and underscores only' }

  validates :password,
            length: { minimum: 6 },
            allow_nil: true,
            if: -> { password_required? }

  validates :uid, uniqueness: true, allow_nil: true
  validate  :uid_presence_if_provider

  # -------------------------------------------------------------------------
  # Associations
  # -------------------------------------------------------------------------
  ## Owned projects
  has_many :projects,           foreign_key: :owner_id, inverse_of: :owner, dependent: :destroy
  ## Collaborations
  has_many :collaborations,     dependent: :destroy
  has_many :project_memberships, through: :collaborations, source: :project
  ## Content
  has_many :created_riffs,      class_name: 'Riff', foreign_key: :created_by, inverse_of: :creator, dependent: :destroy
  has_many :media_files,        dependent: :destroy
  has_many :comments,           dependent: :destroy
  has_many :riff_reactions,     dependent: :destroy
  has_many :riff_versions,      foreign_key: :changed_by, inverse_of: :changed_by_user, dependent: :nullify
  ## Logs & preferences
  has_many :audit_logs,         dependent: :nullify
  has_one  :user_preference,    dependent: :destroy
  ## Social graph
  has_many :user_relationships, foreign_key: :from_user_id, inverse_of: :from_user, dependent: :destroy
  has_many :received_relationships, class_name: 'UserRelationship', foreign_key: :to_user_id, inverse_of: :to_user,
                                    dependent: :destroy
  ## Subscriptions
  has_many :user_subscriptions, dependent: :destroy
  has_many :subscriptions,      through: :user_subscriptions

  # -------------------------------------------------------------------------
  # Soft-delete helpers
  # -------------------------------------------------------------------------
  scope :active, -> { where(deleted_at: nil) }

  def active?
    deleted_at.nil?
  end

  def inactive?
    !active?
  end

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def restore
    update!(deleted_at: nil)
  end

  # -------------------------------------------------------------------------
  # Private helpers
  # -------------------------------------------------------------------------
  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end

  def password_required?
    provider.blank? || (password_digest.blank? && provider_changed?)
  end

  def uid_presence_if_provider
    return unless provider.present? && uid.blank?

    errors.add(:uid, "can't be blank if provider is set")
  end
end
