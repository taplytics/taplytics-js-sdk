#! /bin/sh

./node_modules/browserify/bin/cmd.js --full-paths app/index.js > dist/bundle.js
discify dist/bundle.js > dist/disc.html
open dist/disc.html
