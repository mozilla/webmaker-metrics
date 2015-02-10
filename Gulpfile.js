var gulp = require('gulp');
var jshint = require('gulp-jshint');

/**
 * Javascript linting
 */
gulp.task('lint', function() {
  return gulp.src([
      '*.js',
      './lib/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default', { verbose: true }));
});


gulp.task('default', ['lint']);
