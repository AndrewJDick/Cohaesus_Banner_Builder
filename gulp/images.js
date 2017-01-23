'use strict';

import _config from '../config/config.json';
import gulp    from 'gulp';
import {
  Master,
  Doubleclick,
  Static,
  getSubDirectories,
  _gulp
} from './functions';


// Optimise and copy images across into production static folders
gulp.task('img', () => {

  const copyAndPipe = (gulpSrc, gulpDest) => {

    return gulp.src(gulpSrc)
      .pipe(_gulp.plumber())
      .pipe(_gulp.newer(gulpDest))
      .pipe(gulp.dest(gulpDest))
      .pipe(_gulp.imagemin())
      .pipe(gulp.dest(gulpDest));
  };

  if (Master && Static && !Doubleclick || !Master && Static) {
    getSubDirectories('img', copyAndPipe, true);
  }

  if (Doubleclick === true) {
    getSubDirectories('img', copyAndPipe, false);
  }

});
