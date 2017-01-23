'use strict';

import _config      from '../config/config.json';
import gulp         from 'gulp';
import connectMulti from 'gulp-connect-multi';
import {
  Static,
  isStatic,
  Doubleclick,
  isDoubleclick,
  sizeFolder,
  getSubDirectories,
  checkSettingsAndRun,
  connectOptions,
  _gulp
} from './functions';


const ff      = connectMulti();
const safari  = connectMulti();
const connect = connectMulti();


// Combine various javascript files and minimise them before copying into relevant production folders.
gulp.task('scripts', () => {

  const copyAndPipe = (gulpSrc, gulpDest) => {
    return gulp.src(gulpSrc)
      .pipe(_gulp.plumber())
      .pipe(_gulp.newer(gulpDest))
      .pipe(_gulp.sourcemaps.init())
      .pipe(_gulp.concat(`${sizeFolder}.js`))
      .pipe(_gulp.uglify())
      .pipe(_gulp.rename('ad.js'))
      .pipe(_gulp.sourcemaps.write())
      .pipe(gulp.dest(gulpDest));
  };

  const runJS = (ad_type) => {
    if (isStatic(ad_type)) {
      return getSubDirectories('js', copyAndPipe, true);
    } else if (isDoubleclick(ad_type)) {
      return getSubDirectories('js', copyAndPipe, false);
    }
  };

  checkSettingsAndRun(Static, runJS, 'static');
  checkSettingsAndRun(Doubleclick, runJS, 'doubleclick');
});


// Javascript Lint
gulp.task('js-lint', () => {
  return gulp.src(_config.paths.js.src.all)
    .pipe(_gulp.jshint())
    .pipe(_gulp.jshint.reporter('jshint-stylish'))
    .pipe(_gulp.jshint.reporter('fail'));
});


// Setup localhost server to view production files.
gulp.task('connect', connect.server(connectOptions('Google Chrome', 8000, 35729))); // default
gulp.task('ff', ff.server(connectOptions('firefox', 1337, 35727)));
gulp.task('safari', safari.server(connectOptions('safari', 8080, 35722)));

