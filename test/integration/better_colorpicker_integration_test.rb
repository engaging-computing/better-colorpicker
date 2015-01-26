require 'test_helper'

describe "static assets integration" do

  it "provides better_colorpicker.js on the asset pipeline" do
    visit "/assets/better_colorpicker.js"
    page.text.must_include 'colorpicker'
  end

  it "provides better_colorpicker.css on the asset pipeline" do
    visit "/assets/better_colorpicker.css"
    page.text.must_include 'colorpicker'
  end
end