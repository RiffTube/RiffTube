# frozen_string_literal: true

# Provides wrapper methods for consistent JSON responses keyed by
# the record’s model name (e.g. { "user": { … } }).
module ResponseRenderable
  extend ActiveSupport::Concern

  # 200 OK
  def render_ok(record, serializer: nil)
    render json: { root_key(record) => record_payload(record, serializer) },
           status: :ok
  end

  # 201 Created
  def render_created(record, serializer: nil)
    render json: { root_key(record) => record_payload(record, serializer) },
           status: :created
  end

  # 422 Unprocessable Entity
  def render_unprocessable(record)
    render json: { errors: record.errors.messages },
           status: :unprocessable_entity
  end

  # 404 Not Found
  def render_not_found
    render json: { error: 'Not found' }, status: :not_found
  end

  private

  # Derive a JSON root key from the record’s model name,
  # falling back to "data" if we can’t detect one.
  def root_key(record)
    if record.respond_to?(:model_name)
      record.model_name.param_key
    else
      'data'
    end
  end

  # Optionally use a serializer, otherwise fall back to default slicing
  def record_payload(record, serializer)
    return serializer.new(record).serializable_hash if serializer

    default_payload(record)
  end

  # Default: for AR models slice these common fields
  def default_payload(record)
    if record.respond_to?(:slice)
      record.slice(:id, :email, :username, :name)
    else
      record
    end
  end
end
