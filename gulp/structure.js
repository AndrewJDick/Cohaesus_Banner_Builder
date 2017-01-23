'use strict';

import _config     from '../config/config.json';
import chalk       from 'chalk';
import del         from 'del';
import gulp        from 'gulp';
import runSequence from 'run-sequence';
import {
  Master,
  sizes,
  dcOrStatic,
  Static,
  emptyDirectory,
  getFolders,
  populateDir,
  copyFiles,
  applyZip,
  _gulp
} from './functions';


// Clears the global cache
gulp.task('clear', () => {
  _gulp.cache.clearAll();
});


// Deletes the prod/ and src/ directories
gulp.task('del', () => {
  del(['prod', 'src']).then(() => {
    console.info(chalk.green('Src and prod folders have been successfully deleted.'));
  });
});


// Deletes the prod/ directory
gulp.task('del:prod', () => {
  return del(['prod']);
});


// Copies the master banner files to the respecitve directories in base-template/
gulp.task('master', (cb) => {
  if (Master) {
    runSequence('overwrite:images', 'overwrite:styles', 'overwrite:scripts', 'overwrite:html', (cb) => {
      gulp.start('del');
      console.info(chalk.green('Master files successfully saved to base-template. Now change Master to false and rerun npm run generate.'));
    });
  } else {
    console.info(chalk.yellow('[W] Unable to run this command, as Master is set to false.'));
  }
});


// Copies the master banner's index.html to base-template/
gulp.task('overwrite:html', () => {
  const source = _config.paths.html.src.index;

  return copyFiles(source, _config.paths.baseTemplate.root);
});


// Copies the master javascript files to base-template/js/
gulp.task('overwrite:scripts', () => {
  let sources = [_config.paths.js.src.main];

  dcOrStatic(sources.push(_config.paths.js.src.doubleclick), sources.push(_config.paths.js.src.static));

  return copyFiles(sources, _config.paths.baseTemplate.js.root);
});


// Copies the master banner's overwrite.scss to base-template/scss/master, and global scss to base-template/scss/global
gulp.task('overwrite:styles', () => {
  const overwritePath = dcOrStatic('/doubleclick/overwrite.scss', `/static/${sizes.versions[0]}/overwrite.scss`);
  const masterScss = `src/${sizes.dimensions[0].width}x${sizes.dimensions[0].height}${overwritePath}`;
  const masterRename = `${sizes.dimensions[0].width}x${sizes.dimensions[0].height}-overwrite`;

  emptyDirectory(_config.paths.baseTemplate.img.global);
  emptyDirectory(_config.paths.baseTemplate.img.master);

  populateDir(_config.paths.scss.src.global, _config.paths.baseTemplate.scss.global);
  populateDir(masterScss, _config.paths.baseTemplate.scss.master, masterRename);
});


// Copies the master banner's images to base-template/img/master, and global images to base-template/img/global
gulp.task('overwrite:images', () => {
  const imgPath = dcOrStatic('doubleclick', `static/${sizes.versions[0]}`);
  const masterImg = `src/**/${imgPath}/img/*`;

  emptyDirectory(_config.paths.baseTemplate.img.global);
  emptyDirectory(_config.paths.baseTemplate.img.master);

  populateDir(_config.paths.img.src.global, _config.paths.baseTemplate.img.global);
  populateDir(masterImg, _config.paths.baseTemplate.img.master);
});
