'use strict'

const gutil = require('gulp-util')
const through = require('through2')
const path = require('path')

// Converts the relative path in file.sourceMap.sources[0] to be relative
// not to the source files base directory, but to the output directory of
// the particular file.
// For example, transpiling "src/folder/file.ts" to "dist/folder/file.js"
// needs the file.sourceMap.sources[0] value "../../src/folder/file.ts".
module.exports = function (options) {
  // {dest: 'dist'} => options
  if (!(options && options.dest)) {
    throw new gutil.PluginError({
      plugin: 'gulp-relative-sourcemaps-source',
      message: 'Missing "dest" key options.'
    })
  }
  return through.obj(function (file, encoding, done) {
    // Detect a file with a sourcemaps and an external content
    if (file.sourceMap && Array.isArray(file.sourceMap.sources) &&
        file.sourceMap.sources.length > 0) {
      // path.dirname('folder/file.js') => 'folder'
      const sourceDir = path.dirname(file.relative)
      // path.join('/project', 'dist', 'folder') => '/project/dist/folder'
      const outputDir = path.join(file.cwd, options.dest, sourceDir)
      file.sourceMap.sources = file.sourceMap.sources.map(function (source) {
        // path.join('/project/src/folder/', 'file.ts')
        const sourceFile = path.join(file.base, source)
        // path.relative('/project/dist/folder', '/project/src/folder/file.ts')
        //   => '../../src/folder/file.ts'
        return path.relative(outputDir, sourceFile)
      })
    }
    done(null, file)
  })
}
