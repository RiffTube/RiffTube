# frozen_string_literal: true

module Api
  module V1
    # CRUD for the riffs placed on one of the current user's projects.
    class RiffsController < ApplicationController
      include RiffSerializable

      FIELD_NAMES = { start_time: :start, end_time: :end, text_content: :text }.freeze

      before_action :authenticate_user!
      before_action :set_project
      before_action :set_project_riff, only: %i[update destroy]

      def index
        placements = active_placements.includes(riff: :latest_revision).order(:start_time, :created_at)
        render json: { riffs: placements.map { |placement| riff_json(placement) } }
      end

      def create
        placement = create_placement
        render json: { riff: riff_json(placement) }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render_riff_errors(e.record)
      end

      # Timing changes touch the placement only; text/styling changes add a version.
      def update
        ProjectRiff.transaction do
          update_title
          update_content
          update_timing
        end
        render json: { riff: riff_json(@project_riff) }
      rescue ActiveRecord::RecordInvalid => e
        render_riff_errors(e.record)
      end

      def destroy
        @project_riff.riff.soft_delete!
        head :no_content
      end

      private

      def set_project
        @project = current_user.projects.active.find_by(id: params[:project_id])
        render_not_found unless @project
      end

      def set_project_riff
        @project_riff = active_placements.find_by(riff_id: params[:id])
        render_not_found unless @project_riff
      end

      def active_placements
        @project.project_riffs.joins(:riff).where(riffs: { deleted_at: nil })
      end

      def riff_attrs
        @riff_attrs ||= params.fetch(:riff, {}).permit(:start, :end, :title, :text, styling: {}).to_h
      end

      def timing_attrs
        { start_time: riff_attrs[:start], end_time: riff_attrs[:end] }
      end

      # Only the keys the client actually sent, as keyword arguments.
      def slice_attrs(*keys)
        riff_attrs.slice(*keys).to_h.symbolize_keys
      end

      def create_placement
        ProjectRiff.transaction do
          riff = Riff.create_with_version!(creator: current_user, **slice_attrs(:title, :text, :styling))
          placement = @project.project_riffs.new(riff: riff, **timing_attrs)
          placement.save!(context: :editor)
          placement
        end
      end

      def update_timing
        timing = timing_attrs.compact
        return if timing.empty?

        @project_riff.assign_attributes(timing)
        @project_riff.save!(context: :editor)
      end

      def update_title
        return unless riff_attrs.key?(:title)

        @project_riff.riff.update!(title: riff_attrs[:title])
      end

      def update_content
        content = slice_attrs(:text, :styling)
        return if content.empty?

        @project_riff.riff.revise!(user: current_user, **content)
      end

      def render_riff_errors(record)
        errors = record.errors.messages.transform_keys { |key| FIELD_NAMES.fetch(key, key) }
        render json: { errors: errors }, status: :unprocessable_entity
      end
    end
  end
end
