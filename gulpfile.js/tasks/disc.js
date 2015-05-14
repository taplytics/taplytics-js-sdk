var path = require('path');
var gulp = require('gulp');
var config   = require('../config');
var browserify = require('browserify');
var open = require('opener');
var disc = require('disc');
var fs = require('fs');


gulp.task('build:disc', function() {
    var output = path.normalize(config.destDirectory + '/disc.html');

    var bundler = browserify(path.normalize(config.sourceDirectory + '/' + config.sourceEntry), {
      fullPaths: true
    });

    bundler.bundle()
      .pipe(disc())
      .pipe(fs.createWriteStream(output))
      .once('close', function() {
        open(output);
      });

});
