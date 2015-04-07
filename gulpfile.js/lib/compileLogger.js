var gutil        = require("gulp-util");
var prettifyTime = require('./prettifyTime');
var handleErrors = require('./handleErrors');

module.exports = function(files) {
  var file = (files && files.length) ? files[0] : files;

  var startTime = new Date();

  if (file)
    gutil.log('Starting', gutil.colors.cyan('browserify:development'), 'for', gutil.colors.green(file), '...');

  return function() {
    var endTime = new Date();
    var compileTime = prettifyTime(endTime - startTime);

    if (file)
      gutil.log('Finished', gutil.colors.cyan('browserify:development'), 'for', gutil.colors.green(file), 'after', gutil.colors.magenta(compileTime));
  };
};