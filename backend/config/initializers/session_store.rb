# frozen_string_literal: true

Rails.application.config.session_store :cookie_store,
                                       key: '_rifftube_session',
                                       same_site: :none,
                                       secure: Rails.env.production?,
                                       httponly: true
