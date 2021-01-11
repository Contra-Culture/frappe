# frozen_string_literal: true
require "fileutils"
require "bundler"
Bundler.require(:default)

# dir = File.dirname(__FILE__)
# source_dir = File.expand_path(dir, "../lib")
# dest_dir = File.expand_path(dir, "assets")
# files = Dir.entries(source_dir).map{|f| File.expand_path(f, "../lib")}.filter{|f| !File.directory?(f)}
# puts "\tcopying files from #{source_dir} to #{dest_dir} ..."
# files.each {|f| puts "\t\t file #{f} copied"}
# FileUtils.cp files, dest_dir
# puts "\tdone!"

app = Rack::Static.new nil,
                       urls: ["/"],
                       root: "../lib",
                       header_rules: [
                         [['js','mjs'], "Content-Type" => "application/javascript"],
                         [['html'], "Content-Type" => "text/html"],
                       ]
Rack::Handler::WEBrick.run app
