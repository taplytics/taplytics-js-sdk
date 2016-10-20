var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var logger = require('../lib/compileLogger');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var config = require('../config');

gulp.task('browserify:production', function() {
  var bundler = browserify(config.sourceDirectory + '/' + config.sourceEntry);

  function bundle(files) {
    return bundler.bundle()
                .pipe(source("taplytics.min.js"))
                .pipe(buffer())
                .pipe(uglify().on('error', function(err) {
                    console.log("uglify error: ");
                    console.dir(err);
                }))
                .pipe(gulp.dest(config.destDirectory));
  }

  return bundle();
});
