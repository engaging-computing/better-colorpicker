$:.push File.expand_path("../lib", __FILE__)

# Maintain your gem's version:
require "better_colorpicker/version"

# Describe your gem and declare its dependencies:
Gem::Specification.new do |s|
  s.name        = "better_colorpicker"
  s.version     = BetterColorpicker::VERSION
  s.authors     = ["Anthony Salani"]
  s.email       = ["Anthony_Salani@sstudent.uml.edu"]
  s.homepage    = ""
  s.summary     = "Picks colors"
  s.description = "HSV colorpicker written in CSS, JS"
  s.license     = "MIT"

  s.files = Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.rdoc"]
  s.test_files = Dir["test/**/*"]

  s.add_dependency "rails", "~> 4"
  s.add_dependency "coffee-rails"
  s.add_dependency "coffee-rails-source-maps"
  s.add_dependency "sass"


  s.add_development_dependency "sqlite3"
  s.add_development_dependency 'minitest'
  s.add_development_dependency 'capybara'
end
