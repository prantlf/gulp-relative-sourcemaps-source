var del = require('del'),
    eslint = require('gulp-eslint'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    relativeSourcemapsSource = require('gulp-relative-sourcemaps-source'),
    run = require('run-sequence'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify');

gulp.task('clean', function () {
  return del(['dist']);
});

gulp.task('check', function () {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError());
});

gulp.task('dist', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(uglify().on('error', gutil.log))
    // sources[0] would be relative to the output directory root
    // without the relativeSourcemapsSource plugin 
    .pipe(relativeSourcemapsSource({dest: 'dist'}))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      // sources[0] will be set to the relative path to the source
      // file - relative from the directory of every built file,
      // that is why sourceRoot in map files should be always '.'
      sourceRoot: '.'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', function (done) {
  run('clean', ['check', 'dist'], done);
});
