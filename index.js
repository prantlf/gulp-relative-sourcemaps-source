'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    path = require('path');

// Converts the relative path in file.sourceMap.sources[0] to be relative
// not to the source files root, but to the single source file directory.
// For example, transpiling "src/folder/file.js" to "dist/folder/file.js"
// needs the file.sourceMap.sources[0] value "../../src/folder/file.js".
module.exports = function (options) {
  // {dest: 'dist'} => options
  if (!(options && options.dest)) {
    throw new gutil.PluginError({
      plugin: 'gulp-relative-sourcemaps-source',
      message: 'Missing "dest" key options.'
    });
  }
  return through.obj(function (file, encoding, done) {
    // Detect a file with a sourcemaps and an external content
    if (file.sourceMap && Array.isArray(file.sourceMap.sources)) {
      // path.dirname('folder/file.js') => 'folder'
      var sourceDir = path.dirname(file.relative),
      // path.join('/project', 'dist', 'folder') => '/project/dist/folder'
          outputDir = path.join(file.cwd, options.dest, sourceDir);
      // path.relative('/project/dist/folder', '/project/src/folder/file.js')
      //   => '../../src/folder/file.js'
      file.sourceMap.sources[0] = path.relative(outputDir, file.path);
    }
    done(null, file);
  });
};
