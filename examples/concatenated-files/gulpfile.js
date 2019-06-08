const del = require('del')
const eslint = require('gulp-eslint')
const gulp = require('gulp')
const gutil = require('gulp-util')
const relativeSourcemapsSource = require('gulp-relative-sourcemaps-source')
const rollup = require('rollup-stream')
const rename = require('gulp-rename')
const buffer = require('vinyl-buffer')
const source = require('vinyl-source-stream')
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
  return rollup({
    input: 'src/main.js',
    format: 'es',
    sourcemap: true
  })
    .pipe(source('main.js', './src'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(terser().on('error', gutil.log))
    // sources[] would be relative to the output directory root
    // without the relativeSourcemapsSource plugin 
    .pipe(rename('bundle.js'))
    .pipe(relativeSourcemapsSource({ dest: 'dist' }))
    .pipe(sourcemaps.write('.', {
      includeContent: false,
      // sources[] will be set to the relative paths to the source
      // files - relative from the directory of every built file,
      // that is why sourceRoot in map files should be always '.'
      sourceRoot: '.'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('default', gulp.series('check', 'dist'))
