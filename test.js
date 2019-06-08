'use strict'

const gutil = require('gulp-util')
const path = require('path')
const assert = require('assert')
const relativeSourcemapsSource = require('./')

describe('relativeSourcemapsSource()', function () {
  it('should update the sourcemaps content path in a single output file', function (done) {
    // Simulate transpiling to an output directory in the project root
    const stream = relativeSourcemapsSource({ dest: 'dist' })
    const buffer = []
    const files = [
      // Source base directory in the project root
      new gutil.File({
        base: __dirname,
        path: path.join(__dirname, 'file.js')
      }),
      // Source base directory in the "src" directory in the project root
      // all files flat there
      new gutil.File({
        base: path.join(__dirname, 'src'),
        path: path.join(__dirname, 'src/file.js')
      }),
      // Source base directory in the "src" directory in the project root
      // files nested in different directory levels there
      new gutil.File({
        base: path.join(__dirname, 'src'),
        path: path.join(__dirname, 'src/folder/file.js')
      })
    ]
    // Simulate how gulp-sourcemaps sets paths to source files -
    // relatively to the source base directory
    files[0].sourceMap = { sources: ['file.ts'] }
    files[1].sourceMap = { sources: ['file.ts'] }
    files[2].sourceMap = { sources: ['folder/file.ts'] }

    stream.on('data', function (file) {
      buffer.push(file)
    })

    stream.on('end', function () {
      assert.equal(buffer.length, 3)
      // Updated paths point from the output file location in the "dist"
      // directory tree to the source file below the source base directory
      assert.equal(buffer[0].sourceMap.sources[0], '../file.ts')
      assert.equal(buffer[1].sourceMap.sources[0], '../src/file.ts')
      assert.equal(buffer[2].sourceMap.sources[0], '../../src/folder/file.ts')
      done()
    })

    files.forEach(function (file) {
      stream.write(file)
    })

    stream.end()
  })

  it('should update the sourcemaps content path in a multi-file output bundle', function (done) {
    // Simulate transpiling to an output directory in the project root
    const stream = relativeSourcemapsSource({ dest: 'dist' })
    const buffer = []
    const files = [
      new gutil.File({
        base: path.join(__dirname, 'src'),
        path: path.join(__dirname, 'src/bundle.js'),
        relative: 'bundle.js',
        cwd: __dirname
      }),
    ]
    // Simulate how gulp-sourcemaps sets paths to source files -
    // relatively to the source base directory
    files[0].sourceMap = {
      sources: [
        'file.ts',
        'folder/file.ts'
      ]
    }

    stream.on('data', function (file) {
      buffer.push(file)
    })

    stream.on('end', function () {
      assert.equal(buffer.length, 1)
      assert.equal(buffer[0].sourceMap.sources.length, 2)
      // Updated paths point from the output file location in the "dist"
      // directory tree to the source file below the source base directory
      assert.equal(buffer[0].sourceMap.sources[0], '../src/file.ts')
      assert.equal(buffer[0].sourceMap.sources[1], '../src/folder/file.ts')
      done()
    })

    files.forEach(function (file) {
      stream.write(file)
    })

    stream.end()
  })

  it('does not crash if sourcemaps source array is empty', function (done) {
    // Simulate transpiling to an output directory in the project root
    const stream = relativeSourcemapsSource({ dest: 'dist' })
    const buffer = []
    const files = [
      // Source base directory in the project root
      new gutil.File({
        base: __dirname,
        path: path.join(__dirname, 'file.d.ts')
      })
    ]
    // Simulate how gulp-sourcemaps sets paths to source files
    // which are not valid JavaScript
    files[0].sourceMap = { sources: [] }

    stream.on('data', function (file) {
      buffer.push(file)
    })

    stream.on('end', function () {
      assert.equal(buffer.length, 1)
      // No source list means no updates
      assert.equal(buffer[0].sourceMap.sources.length, 0)
      done()
    })

    files.forEach(function (file) {
      stream.write(file)
    })

    stream.end()
  })
})
