# frozen_string_literal: true

module Api
  module V1
    class ContactsController < ApplicationController
      def skip_authorization?
        true
      end

      def create
        @contact = Contact.new(contact_params)
        if @contact.save
          render json: { message: 'お問い合わせを受け付けました。' }, status: :created
        else
          render json: { errors: @contact.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def contact_params
        params.expect(contact: %i[name email subject message])
      end
    end
  end
end
