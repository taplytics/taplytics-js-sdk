var gulp = require('gulp');
var _ = require('lodash');
var browserify = require('browserify');
var watchify = require('watchify');
var config = require('../config');
var logger = require('../lib/compileLogger');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

gulp.task('browserify:development', function() {

  var bundler;

  bundler = watchify(browserify(config.sourceDirectory + '/' + config.sourceEntry, _.merge(watchify.args, {
    fullPaths: true
  })));

  bundler.on('update', bundle);

  function bundle(files) {
    return bundler.bundle()
        .on('end', logger(files))
        .pipe(source("taplytics.js"))
        .pipe(buffer())
        .pipe(gulp.dest(config.destDirectory));
  }

  return bundle();
});
