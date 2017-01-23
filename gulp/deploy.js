'use strict';

import _deploy  from '../config/deploy.json';
import chalk    from 'chalk';
import ftp      from 'vinyl-ftp';
import gulp     from 'gulp';
import runSeq   from 'run-sequence';
import {
  _gulp
} from './functions';


const ftpHost = _deploy.staging.host;
const ftpUser = _deploy.staging.user;
const ftpPass = _deploy.staging.pass;
const project = _deploy.staging.project;


// FTP Staging Environment
gulp.task('ftp:staging', () => {

  const conn = ftp.create( {
    host:     ftpHost,
    user:     ftpUser,
    password: ftpPass,
    parallel: 10,
    debug:    true,
    log:      _gulp.util.log
  });

  const globs = [
    'prod/**',
  ];

  return gulp.src(globs, { base: './prod/', buffer: false })
    .pipe(conn.newer(`/web/content/${project}/`))
    .pipe(conn.dest(`/web/content/${project}/`));
});


// FTP Deploy Task
gulp.task('deploy:staging', (cb) => {

  const ftpDetails = [ftpHost, ftpUser, ftpPass, project];

  // Reject the deployment if any FTP credential in deploy.json contains placeholder text.
  for (let detail of ftpDetails) {

    if (detail.includes('placeholder-')) {
      console.info(chalk.yellow('[W] One or more of the deploy.json FTP credentials contain placeholder text. Please amend the details and re-run the task'));
      process.exit();
    }
  }

  // Build the production folder, and reject the deployment if either task returns any errors.
  runSeq('dev', 'ftp:staging', (err) => {

      if (err) {
        console.error(chalk.red('[E] deploy:staging task failed: ${err}'));
        return process.exit();
      } else {
        console.info(chalk.green('Production banners have been successfully deployed to the FTP server'));
        return cb();
      }
    }
  );
});
