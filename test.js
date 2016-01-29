'use strict';

var gutil = require('gulp-util'),
    path = require('path'),
    assert = require('assert'),
    relativeSourcemapsSource = require('./');

describe('relativeSourcemapsSource()', function () {

  it('should update the sourcemaps content path', function (done) {
    // Simulate transpiling to an output directory in the project root
    var stream = relativeSourcemapsSource({dest: 'dist'}),
        buffer = [],
        files = [
          // Source base directory in the project root
          new gutil.File({
            base: __dirname,
            path: path.join(__dirname, 'file.js')
          }),
          // Source base directory in the "src" directory in the project root;
          // all files flat there
          new gutil.File({
            base: path.join(__dirname, 'src'),
            path: path.join(__dirname, 'src/file.js')
          }),
          // Source base directory in the "src" directory in the project root;
          // files nested in different directory levels there
          new gutil.File({
            base: path.join(__dirname, 'src'),
            path: path.join(__dirname, 'src/folder/file.js')
          })
        ];
    // Simulate how gulp-sourcemaps sets paths to source files -
    // relatively to the source base directory
    files[0].sourceMap = {sources: ['file.ts']};
    files[1].sourceMap = {sources: ['file.ts']};
    files[2].sourceMap = {sources: ['folder/file.ts']};

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 3);
      // Updated paths point from the output file location in the "dist"
      // directory tree to the source file below the source base directory
      assert.equal(buffer[0].sourceMap.sources[0], '../file.ts');
      assert.equal(buffer[1].sourceMap.sources[0], '../src/file.ts');
      assert.equal(buffer[2].sourceMap.sources[0], '../../src/folder/file.ts');
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

});
