module Locomotive
  module Api
    class TranslationsController < BaseController

      include Concerns::LoadResource

      def index
        respond_with(@translations)
      end

      def show
        respond_with @translation
      end

      def create
        @translation.from_presenter(params[:translation])
        @translation.save
        respond_with @translation, location: main_app.locomotive_api_translation_path(@translation)
      end

      def update
        @translation.update_attributes(params[:translation])
        respond_with @translation, location: main_app.locomotive_api_translation_path(@translation)
      end

      def destroy
        @translation.destroy
        respond_with @translation
      end

    end
  end
end
