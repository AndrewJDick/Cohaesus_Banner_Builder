'use strict';

import _config from  '../config/config.json';
import fs      from  'fs';
import gulp    from  'gulp';

import {
  Static,
  Doubleclick,
  isStatic,
  isDoubleclick,
  getSubDirectories,
  checkSettingsAndRun,
  _gulp
} from './functions';


// Minimise html files and copy into appropriate folders. Also removes enabler script tag for GDN versions.
gulp.task('html', () => {

  const copyAndPipe = (gulpSrc, gulpDest, Static) => {
    return Static
    ? gulp.src(gulpSrc)
        .pipe(_gulp.plumber())
        .pipe(_gulp.removeCode({ Static: true }))
        .pipe(_gulp.newer(gulpDest))
        .pipe(_gulp.htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(gulpDest))

    : gulp.src(gulpSrc)
        .pipe(_gulp.plumber())
        .pipe(_gulp.newer(gulpDest))
        .pipe(_gulp.htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(gulpDest));
  };

  const runHtml = (ad_type) => {
    if (isStatic(ad_type)) {
      return getSubDirectories('html', copyAndPipe, true);
    } else if (isDoubleclick(ad_type)) {
      return getSubDirectories('html', copyAndPipe, false);
    }
  };

  checkSettingsAndRun(Static, runHtml, 'static');
  checkSettingsAndRun(Doubleclick, runHtml, 'doubleclick');
});


// HTML Lint
gulp.task('html-lint', () => {
  return gulp.src(_config.paths.html.src.all)
    .pipe(_gulp.htmllint({
      config: _config.paths.html.config
    }, htmllintReporter));
});


// HTML Lint Reporter
function htmllintReporter(filepath, issues) {

  const filepathSplit = filepath.split('/');
  const fileName = filepathSplit[filepathSplit.length - 1];

  if (issues.length > 0) {

    issues.forEach((issue) => {
        _gulp.util.log(_gulp.util.colors.red('[gulp-htmllint] ') + _gulp.util.colors.white(`${filepath} [${issue.line},${issue.column}]: `) + _gulp.util.colors.red(`(${issue.code}) ${issue.msg}`));
    });

    process.exitCode = 1;
  }
}
