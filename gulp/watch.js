'use strict';

import _config from '../config/config.json';
import gulp    from 'gulp';


// Watch Task
gulp.task('watch', () => {
  gulp.watch(_config.paths.html.src.all, ['html']);
  gulp.watch(_config.paths.scss.src.all, ['styles']);
  gulp.watch(_config.paths.js.src.all,   ['scripts']);
  gulp.watch([_config.paths.img.src.doubleclick, _config.paths.img.src.static, _config.paths.img.src.global], ['img']);
});
