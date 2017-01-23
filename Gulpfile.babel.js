'use strict';

import requireDir from 'require-dir';
import runSeq from 'run-sequence';
import chalk from 'chalk';
import gulp from 'gulp';
import gitGuppy from 'git-guppy';

const guppy = gitGuppy(gulp);
const tasks = requireDir('./gulp');


// Tasks
gulp.task('dev', ['img', 'styles', 'scripts', 'html']);
gulp.task('test', ['connect', 'ff', 'safari']);
gulp.task('lint', ['html-lint', 'js-lint', 'sass-lint']);
gulp.task('pre-commit', ['lint']);


// Default
gulp.task('default', (cb) => {
  runSeq('del:prod', 'dev', (cb) => {
    runSeq('watch', 'connect');
  });
});
