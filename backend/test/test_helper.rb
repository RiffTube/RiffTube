# frozen_string_literal: true

ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

# Load any support files (e.g. integration helpers)
Dir[Rails.root.join('test/support/**/*.rb')].sort.each { |f| require f }

module ActiveSupport
  # This class provides test case functionality for ActiveSupport.
  class TestCase
    parallelize(workers: :number_of_processors)

    include FactoryBot::Syntax::Methods
  end
end

module ActionDispatch
  class IntegrationTest
    include IntegrationHelpers
    include RiffTestHelpers
  end
end
