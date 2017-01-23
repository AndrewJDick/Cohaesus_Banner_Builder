'use strict';

import _config    from '../config/config.json';
import gulp       from 'gulp';
import {
  Master,
  Static,
  Doubleclick,
  isStatic,
  isDoubleclick,
  getSubDirectories,
  checkSettingsAndRun,
  _gulp
} from './functions';


// Convert scss to css, minimise and copy into appropriate production folders.
gulp.task(`styles`, () => {

  const copyAndPipe = (gulpSrc, gulpDest) => {
    return gulp.src(gulpSrc)
      .pipe(_gulp.newer(gulpDest))
      .pipe(_gulp.plumber())
      .pipe(_gulp.autoprefixer({
        browsers: [`IE >= 10`, `last 2 Firefox versions`, `Safari >= 6`, `last 2 Chrome versions`, `last 2 Edge versions`]
      }))
      .pipe(_gulp.sourcemaps.init())
      .pipe(_gulp.sass({ includePaths: [`src`] }).on(`error`, _gulp.sass.logError))
      .pipe(_gulp.cleanCSS())
      .pipe(_gulp.sourcemaps.write())
    .pipe(gulp.dest(gulpDest));
  };

  const runSass = (ad_type) => {
    if (isStatic(ad_type)) {
      return getSubDirectories(`scss`, copyAndPipe, true);
    } else if (isDoubleclick(ad_type)) {
      return getSubDirectories(`scss`, copyAndPipe, false);
    }
  };

  checkSettingsAndRun(Static, runSass, `static`);
  checkSettingsAndRun(Doubleclick, runSass, `doubleclick`);
});


// Scss Linting
gulp.task(`sass-lint`, () => {
  return gulp.src(_config.paths.scss.src.all)
    .pipe(_gulp.sassLint({
      configFile: _config.paths.scss.config
    }))
    .pipe(_gulp.sassLint.format())
    .pipe(_gulp.sassLint.failOnError());
});

