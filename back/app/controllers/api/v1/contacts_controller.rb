# frozen_string_literal: true

module Api
  module V1
    class ContactsController < ApplicationController
      skip_before_action :authorize_request, only: %i[create]

      def create
        @contact = Contact.new(contact_params)
        if @contact.save
          ContactMailer.confirmation(@contact).deliver_later
          # 運営への通知。宛先が未設定の環境（ローカルなど）では送らない
          ContactMailer.notify_admin(@contact).deliver_later if ENV.fetch('CONTACT_NOTIFY_TO', nil).present?
          render json: { message: 'お問い合わせを受け付けました。' }, status: :created
        else
          render json: { errors: @contact.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def contact_params
        params.expect(contact: %i[name email subject message])
      end
    end
  end
end
