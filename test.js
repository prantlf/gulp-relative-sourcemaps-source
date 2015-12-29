'use strict';

var gutil = require('gulp-util'),
    path = require('path'),
    assert = require('assert'),
    relativeSourcemapsSource = require('./');

describe('relativeSourcemapsSource()', function () {

  it('should update the sourcemaps content path', function (done) {
    var stream = relativeSourcemapsSource({dest: 'dist'}),
        buffer = [],
        files = [
          new gutil.File({
            base: __dirname,
            path: path.join(__dirname, 'file.js')
          }),
          new gutil.File({
            base: path.join(__dirname, 'src'),
            path: path.join(__dirname, 'src/file.js')
          }),
          new gutil.File({
            base: path.join(__dirname, 'src'),
            path: path.join(__dirname, 'src/folder/file.js')
          })
        ];
    files[0].sourceMap = {sources: ['file.js']};
    files[1].sourceMap = {sources: ['file.js']};
    files[2].sourceMap = {sources: ['folder/file.js']};

    stream.on('data', function (file) {
      buffer.push(file);
    });

    stream.on('end', function () {
      assert.equal(buffer.length, 3);
      assert.equal(buffer[0].sourceMap.sources[0], '../file.js');
      assert.equal(buffer[1].sourceMap.sources[0], '../src/file.js');
      assert.equal(buffer[2].sourceMap.sources[0], '../../src/folder/file.js');
      done();
    });

    files.forEach(function (file) {
      stream.write(file);
    });

    stream.end();
  });

});
