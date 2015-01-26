module BetterColorpicker
  class Engine < ::Rails::Engine
    initializer 'better_colorpicker.load_static_assets' do |app|
      app.middleware.use ::ActionDispatch::Static, "#{root}/vendor"
    end
  end
end