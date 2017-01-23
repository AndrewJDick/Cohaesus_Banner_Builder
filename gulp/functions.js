'use strict';

import fs      from 'fs';
import fse     from 'fs-extra';
import chalk   from 'chalk';
import path    from 'path';
import merge2  from 'merge2';
import gulp    from 'gulp';
import plugins from 'gulp-load-plugins';

export const src         = 'src';
export const appRoot     = process.cwd();
export const sizesFile   = fs.readFileSync(`${appRoot}/sizes.json`, 'utf8');
export const sizes       = JSON.parse(sizesFile);
export const Doubleclick = sizes.DoubleClick;
export const Master      = sizes.Master;
export const Static      = sizes.Static;
export const sizeFolder  = sizes.sizeFolder;
export const _gulp       = plugins({
  rename: {
    'gulp-sass-lint': 'sassLint',
    'gulp-clean-css': 'cleanCSS',
    'gulp-remove-code': 'removeCode'
  }
});


// Get folder names inside a given directory (dir).
export const getFolders = (dir) => {
  const ignore = '_';

  return fs.readdirSync(dir).filter((file) => {

    // Ignore any folders in src with the '_' prefix
    if (file.substring(0, ignore.length) !== ignore) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    }
  });
}


export const folders = getFolders(src);


export const checkSettingsAndRun = (setting, execute, usingPath) => {
  if (setting) {
    return execute(usingPath);
  }
}


// Open the production folder in the browser.
export const connectOptions = (browser, port, live) => {
  return {
    root: ['./prod/'],
    port: port,
    livereload: {
      port: live
    },
    open: {
      browser: browser
    }
  };
}


export const isStatic = (ad) => {
  if (ad === 'static' && Master && Static && !Doubleclick || ad === 'static' && !Master && Static) {
    return true;
  }
}


export const isDoubleclick = (ad) => {
  if (ad === 'doubleclick') {
    return true;
  }
}


// Loop through the folders to get to the right sub-directories and apply their custom copy tasks to them.
export const getSubDirectories = (fileType, copyFunc, Static) => {
  return folders.map((sizeFolder) => {
    let ad;

    if (Static) {
      ad = 'static';

      const srcSizeAd = `${src}/${sizeFolder}/${ad}`;
      const typeFolder = getFolders(srcSizeAd);

      return typeFolder.map((versionFolder) => {
        const srcSizeAdVersion = `${src}/${sizeFolder}/${ad}/${versionFolder}`;

        const dest =
        fileType === 'img'
        ? `prod/${ad}/${sizeFolder}-${versionFolder}/img`
        : `prod/${ad}/${sizeFolder}-${versionFolder}`;

        const source =
        fileType === 'scss'
        ? [`${srcSizeAdVersion}/*.${fileType}`, `!src/*.scss`]
        : fileType === 'html'
        ? `${srcSizeAdVersion}/*.${fileType}`
        : fileType === 'img'
        ? [`${srcSizeAdVersion}/img/*`, `${src}/_global-images/*`]
        : fileType === 'js'
        ? [`${src}/${sizeFolder}/*.${fileType}`, `${srcSizeAd}/*.${fileType}`, `${srcSizeAdVersion}/*.${fileType}`]
        : false;

        return copyFunc(source, dest, path);
      });
    } else {
      ad = 'doubleclick';

      const dest =
      fileType === 'img'
      ? `prod/${ad}/${sizeFolder}/img`
      : `prod/${ad}/${sizeFolder}`;

      const source =
      fileType === 'js'
      ? [path.join(src, sizeFolder, `/**/${ad}.js`), path.join(src, sizeFolder, `/**/main.js`)]
      : fileType === 'img'
      ? [`${src}/${sizeFolder}/${ad}/img/*`, `${src}/_global-images/*`]
      : fileType === 'scss'
      ? [`${src}/${sizeFolder}/${ad}/*.scss`, `!${src}/*.scss`]
      : fileType === 'html'
      ? `${src}/${sizeFolder}/${ad}/*.html`
      : false;

      return copyFunc(source, dest);
    }
  });
}


// Ensures directory is empty. Deletes directory contents if directory is not empty. Directory created if it doesn't exist. Directory itself is not deleted.
export const emptyDirectory = (dir) => {
  try {
    fse.emptydirSync(dir)
  } catch (err) {
    console.error(chalk.red(`[E] emptyDirectory() error: ${err}`));
  }
}


// Retrieves files from source, strips the file path, and copies it to the destination
export const populateDir = (source, destination, base = 'default') => {
  return gulp.src(source)
    .pipe(_gulp.plumber())
    .pipe(_gulp.rename((path) => {
      path.dirname = '/';
      if (base !== 'default') {
        path.basename = base;
      }
    }))
    .pipe(gulp.dest(destination));
}


// Determines the state of sizes.json's Doubleclick and Static variables.
export const dcOrStatic = (ifDoubleclick, ifStatic) => {
  if (Doubleclick) {
    return ifDoubleclick;
  }
  if (Static && !Doubleclick) {
    return ifStatic;
  }
  console.info(chalk.yellow('[W] Looks like both Doubleclick and Static are false. Your problems are bigger than this.'));
  return null;
}


export const copyFiles = (source, dest) => {
  return merge2(populateDir(source, dest));
}
