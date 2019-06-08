const del = require('del')
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const gutil = require('gulp-util')
const relativeSourcemapsSource = require('gulp-relative-sourcemaps-source')
const sourcemaps = require('gulp-sourcemaps')
const terser = require('gulp-terser')

gulp.task('clean', function () {
  return del(['dist'])
})

gulp.task('check', function () {
  return gulp.src(['src/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format('node_modules/eslint-friendly-formatter'))
    .pipe(eslint.failAfterError())
})

gulp.task('dist', function () {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(terser().on('error', gutil.log))
    // sources[0] would be relative to the output directory root
    // without the relativeSourcemapsSource plugin 
    .pipe(relativeSourcemapsSource({ dest: 'dist' }))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      // sources[0] will be set to the relative path to the source
      // file - relative from the directory of every built file,
      // that is why sourceRoot in map files should be always '.'
      sourceRoot: '.'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('check', 'dist'))
