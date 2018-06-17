# gulp-relative-sourcemaps-source
[![NPM version](https://badge.fury.io/js/gulp-relative-sourcemaps-source.png)](http://badge.fury.io/js/gulp-relative-sourcemaps-source)
[![Build Status](https://travis-ci.org/prantlf/gulp-relative-sourcemaps-source.svg?branch=master)](https://travis-ci.org/prantlf/gulp-relative-sourcemaps-source)
[![Dependency Status](https://david-dm.org/prantlf/gulp-relative-sourcemaps-source.svg)](https://david-dm.org/prantlf/gulp-relative-sourcemaps-source)
[![devDependency Status](https://david-dm.org/prantlf/gulp-relative-sourcemaps-source/dev-status.svg)](https://david-dm.org/prantlf/gulp-relative-sourcemaps-source#info=devDependencies)

> Convert paths to files with the sourcemaps content to be relative to the output file directories

[![NPM Downloads](https://nodei.co/npm/gulp-relative-sourcemaps-source.png?downloads=true&stars=true)](https://www.npmjs.com/package/gulp-relative-sourcemaps-source)

Enables debugging in IDEs like `WebStorm` or `VSCode` with sourcemaps generated by `gulp-sourcemaps` 1 for a `Node.js` application transpiled by `babel`. These IDEs ignore inline sourcemaps content and are able to read the original source files only if their paths are relative to the output file directories.

**For `gulp-sourcemaps` >= 1.7.0 users:** Do not use this plugin any more.  `gulp-sourcemaps` < 1.7.0 did not adapt `sourceRoot` in source maps dynamically for every file according to the relative source path, but the newer `gulp-sourcemaps` does it, if you specify *`sourceRoot` as a relative path*.  If you use this plugin with the newer `gulp-sourcemaps`, you will get both `sources[0]` and `sourceRoot` updated, which will make a wrong path, when combined together.  You might find some usage scenario for this plugin with `gulp-sourcemaps` >= 1.7.0, if you specified `sourceRoot` as an absolute path.

The following code is the usage example from below updated for `gulp-sourcemaps` >= 1.7.0:

```js
gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(babel())
  // Remove relativeSourcemapsSource used for sourcemaps 1
  //.pipe(relativeSourcemapsSource({dest: 'dist'}))
  .pipe(sourcemaps.write('.', {
    includeContent: false,
    // Change '.' used with relativeSourcemapsSource to '../src';
    // sourcemaps 2 will make paths of dist/**/*.js relative to
    // the directory you get from dist to - to src
    sourceRoot: '../src'
  }))
  .pipe(gulp.dest('dist'));
```

## Install

```
$ npm install --save-dev gulp-relative-sourcemaps-source
```

## Usage

Update the source file paths in sourcemaps before you call `sourcemaps.write()`:

```js
var babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    relativeSourcemapsSource = require('gulp-relative-sourcemaps-source');
// Pass the base directory for the source files
gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(babel())
  // Pass the same directory as passed to gulp.dest()
  .pipe(relativeSourcemapsSource({dest: 'dist'}))
  // Write sourcemaps to the same directory as the transpiled files are
  // written to and do not let the sourceRoot affect the relative path
  .pipe(sourcemaps.write('.', {
    includeContent: false,
    sourceRoot: '.'
  }))
  .pipe(gulp.dest('dist'));
```

### Example

The following sample project consists of two ES6 source files, which are transpiled to ES5 by babel.

Project source hierarchy:

```text
src/
  folder/
    file.js
  main.js
```

Gulp build task:

```js
var babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps');
return gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(sourcemaps.write('.', {
    includeContent: false,
    sourceRoot: 'src'
  }))
  .pipe(gulp.dest('dist'));
```

Build output hierarchy:

```text
dist/
  folder/
    file.js
    file.js.map
  main.js
  main.js.map
```

Content of the `main.js.map` file:

```json
{
  "version": 3,
  "sources": ["main.js"],
  "names":[],
  "mappings": "...",
  "file": "main.js",
  "sourceRoot": "src"
}
```

Content of the `file.js.map` file:

```json
{
  "version": 3,
  "sources": ["folder/file.js"],
  "names":[],
  "mappings": "...",
  "file": "folder/file.js",
  "sourceRoot": "src"
}
```

Although it would appear that the path made of `sourceRoot` and `sources[0]` parts, which points to source files when taking the project root as the root directory, should be usable by the debuggers, they will fail to find the source files.  Apparently they do not look for the source files starting in the project root.  Using an absolute source base directory for `sourceRoot` does not help, for example: `"sourceRoot": "/src"`.  What helps, is making the combination of `sourceRoot` and `sources[0]` relative to the output directory of the particular file.

Updated Gulp build task:

```js
var babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    relativeSourcemapsSource = require('gulp-relative-sourcemaps-source');
return gulp.src(['src/**/*.js'])
  .pipe(sourcemaps.init())
  .pipe(babel())
  .pipe(relativeSourcemapsSource({dest: 'dist'}))
  .pipe(sourcemaps.write('.', {
    includeContent: false,
    sourceRoot: '.'
  }))
  .pipe(gulp.dest('dist'));
```

Updated content of the `main.js.map` file:

```json
{
  "version": 3,
  "sources": ["../src/main.js"],
  "names":[],
  "mappings": "...",
  "file": "main.js",
  "sourceRoot": "."
}
```

Updated content of the `file.js.map` file:

```json
{
  "version": 3,
  "sources": ["../../src/folder/file.js"],
  "names":[],
  "mappings": "...",
  "file": "folder/file.js",
  "sourceRoot": "."
}
```

WebStorm debugger will use the correct source files right away. VSCode will need the following settings in the launch configuration:

```json
{
  "cwd": ".",
  "sourceMaps": true,
  "outDir": "./dist"
}
```

## API

### relativeSourcemapsSource(options)

Returns a [transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform) with a modified source file path in `sourceMap.sources[0]`.  No other changes.

#### options

Type: `object`

#### options.dest

Type: `string`
Default: `undefined`

Root output directory to write the transpiled files to.  Mandatory.

## Release History

 * 2018-04-27   v1.0.0   Dropped support of Node.js 4
 * 2016-12-21   v0.1.5   Add example, update dependencies
 * 2016-10-02   v0.1.4   Fix running with an ampty array of source map sources
 * 2016-26-08   v0.1.3   Upgrade dependencies
 * 2016-02-01   v0.1.2   Fix transpiling files fith other file extension;
                         *.ts to *.js with TypeScript, for example.
 * 2015-12-30   v0.1.1   Initial release.

## License

MIT © 2015-2018 [Ferdinand Prantl](http://prantl.tk)
