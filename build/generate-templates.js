'use strict';

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import fse from 'fs-extra';

const appRoot = process.cwd();
const sizesFile = fs.readFileSync(appRoot + '/sizes.json', 'utf8');
const sizes = JSON.parse(sizesFile);
const isDoubleClick = sizes.DoubleClick;
const isStatic = sizes.Static;

const baseDirectory = `${appRoot}/base-template/`;
const sourceDirectory = `${appRoot}/src/`;
const DoubleClick = 'doubleclick';
const Static = 'static';
const img = 'img';

var versions;
let masterScss;

const masterBanner = {
  height: sizes.dimensions[0].height,
  width: sizes.dimensions[0].width,
  version: 0
}

// Get folder names inside a given directory (dir)
function getFolders(dir) {
  return fs.readdirSync(dir)
    .filter(function(file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
  });
}


class GenerateTemplates {
	constructor() {
		this.loadSizes();
		this.setupSource();

    // Recursively searches a directory, adding files to the filelist array, and passing any subdirectories back through itself as a parameter.
    this.walkSync = (dir, filelist = []) => {

      fs.readdirSync(dir).forEach(file => {

        filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? this.walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));

      });

      return filelist;
    };

    // Stores all files within the base-template folder (retrieves file basenames, i.e 'index.html')
    this.formatFiles = this.walkSync(`${baseDirectory}`).map((file) => {
      return file = path.basename(file);
    });
	}

	loadSizes() {
		const sizesFile = fs.readFileSync(`${appRoot}/sizes.json`, 'utf8');
		let sizes = JSON.parse(sizesFile);
		this.sizes = sizes.dimensions;
		this.DoubleClick = sizes.DoubleClick;
		this.Master = sizes.Master;
		this.Static = sizes.Static;
    this.masterScssCopied = false;
		versions = sizes.versions;

		versions = this.Master === true ? [versions[0]] : versions;
		this.sizes = this.Master === true ? [this.sizes[0]] : this.sizes;
	}

  isStatic() {
    if (this.Master && this.Static && !this.DoubleClick || !this.Master && this.Static) {
      return true;
    }
  }

	processSizes() {
		this.sizes.map((size) => {

      (size.suffix === '')
      ? this.checkTemplate(`${sourceDirectory}${size.width}x${size.height}`, size)
      : this.checkTemplate(`${sourceDirectory}${size.width}x${size.height}-${size.suffix}`, size);
		});
	}

	setupSource() {
		let that = this;
		fs.access(sourceDirectory, fs.F_OK, function(err) {
			if (!err) {
				console.info(chalk.yellow('[W] Source directory already exists'));
				that.processSizes();
			} else {
				that.createSource();
			}
		});
	}

	createSource() {
		let that = this;
		fs.mkdir(sourceDirectory, (err, folder) => {
			if (err) {
				console.error(chalk.red(`[E] Source directory could not be created: ${err}`));
			} else {
			  fs.mkdirSync(sourceDirectory + '/_global-scss');
        fs.mkdirSync(sourceDirectory + '/_global-images');
        console.info(chalk.green('Source directory has been created.'));
        that.populateSrc();
			}
		});
	}

	populateSrc() {

    // Import all global-scss files into src/_scss
    fse.copy(`${baseDirectory}scss/global`, `${sourceDirectory}_global-scss/`, (err) => {
      if (err) {
        return console.error(chalk.red(`[E] populateSrc():scss error: ${err}`, ));
      }
      console.log(chalk.green('Global scss files copied to src/_global-scss'));
    });

    // Import all base-template/img/global files into src/_global-images
    fse.copy(`${baseDirectory}img/global/`, `${sourceDirectory}_global-images/`, (err) => {
      if (err) {
        return console.error(chalk.red(`[E] populateSrc():global-images error: ${err}`));
      }
      console.info(chalk.green('Global images copied to src/_global-images'));
    });

		this.processSizes();
	}


	checkTemplate(dir, data) {
		let that = this;
		fs.access(dir, fs.F_OK, function(err) {
			if (!err) {
				console.info(chalk.yellow(`[W] `, `${dir}`.match(/([^\/]*)\/*$/)[1] + ` folder already exists`));
			} else {
				that.generateTemplate(dir, data);
			}
		});
	}

	// Build folders to house each ad by size name and their DoubleClick and Static subfolders
	generateTemplate(dir, data) {
		let that = this;


		fs.mkdir(dir, (err, folder) => {
			if (err) {
				console.log(err);
				console.error(chalk.red(`[E] ${dir} Could not be created`));
			} else {
				console.info(chalk.green(`${dir}`.match(/([^\/]*)\/*$/)[1] + ` folder has been created.`));


        if (this.DoubleClick) {
          fs.mkdir(`${dir}/${DoubleClick}`);
        }


				if (this.isStatic()) {
					var totalVersions = this.Master === true ? 1 : versions.length;
					var version = 0;

					// Make Static assets folder
					fs.mkdir(`${dir}/${Static}`, (err) => {
				    if (err) {
				        return console.error(chalk.red('[E] failed to write directory', err));
				    }
				    makeVersionDirectory(version);
					});


					// Make a folder inside Static assets folder for a particular version
					function makeVersionDirectory (version) {
						fs.mkdir(`${dir}/${Static}/${versions[version]}`, (err) => {
					    if (err) {
					        return console.error(chalk.red('[E] Failed to write directory', err));
					    }
					    makeImgDirectory(version);
						});
					}


					// Make an image folder inside the Static assets folder for a particular version
					function makeImgDirectory (version) {
						fs.mkdir(`${dir}/${Static}/${versions[version]}/${img}`, (err) => {
					    if (err) {
                return console.error(chalk.red(`[E] Failed to write directory: ${err}`));
					    }
					    copyImages(version); // Copy global images for this version before incrementing

					    version++;

					    if (version === totalVersions) {
					    	that.populateTemplate(dir, data); // Build files into folders when complete
					    } else {
					    	makeVersionDirectory(version); // Otherwise perform these tasks for each version
					    }
						});
					}


					function copyImages (version) {

            if (!sizes.Master && data.width === masterBanner.width && data.height === masterBanner.height && version === masterBanner.version) {

              /* Creates an empty image directory for each src banner. */
              fse.ensureDir(`${baseDirectory}img/master`, (err) => {
                if (err) {
                  return console.error(chalk.red(`[E] copyImages() error: ${err}`));
                }
              });

              /* Restores master images to the master banner */
              fse.copy(`${baseDirectory}img/master`, `${dir}/${Static}/${versions[0]}/${img}`, (err) => {
                if (err) {
                  return console.error(chalk.red(`[E] copyImages() error: ${err}`));
                } else {
                  console.info(chalk.green(`Master images copied to`, `${dir}`.match(/([^\/]*)\/*$/)[1] + `/${Static}/${versions[masterBanner.version]}/${img}`));
                }
              });
            }
          }
	      } else {
					that.populateTemplate(dir, data);
	      }
			}
		});
	}

  // Check for numberxnumber-overwite.scss, match the number and overwite the scss
  findEditedMasterScss() {

    var masterScssRegx = /([0-9]+x[0-9]+)-overwrite\.scss/;

    var test = fs.readdirSync('base-template/scss/master').filter((file) => {
      if (masterScssRegx.test(file)) {
        masterScss = file;
      }
      return masterScssRegx.test(file);
    });

    var dash = test[0].indexOf('-');
    //find out which size folder the edited overwrite.scss file belonged to
    var masterScssSize = test[0].slice(0, dash);

    getFolders('src').map((sizeFolder) => {

      if (sizeFolder === masterScssSize) {

        // If DoubleClick is true, retrieve the overwrite.scss file from the master's doubleclick folder.
        if (isDoubleClick) {
          fs.readdir(`src/${sizeFolder}/doubleclick`, (err, files) => {

            for (let file = 0; file < files.length; file++) {
              if (files[file] === 'overwrite.scss') {
                const stream = fs.createReadStream(`base-template/scss/master/${masterScss}`);
                stream.pipe(fs.createWriteStream(`src/${sizeFolder}/doubleclick/${files[file]}`));

                (err)
                ? console.log(chalk.red(`[E] findEditedMasterScss() doubleclick error: ${err}`))
                : console.info(chalk.green(`Master overwrite.scss file copied to src/${sizeFolder}/doubleclick/`));
              }
            }
          });
        }

        // If static is true, retrieve the overwrite.scss file from the first static version folder.
        if (isStatic) {
          fs.readdir(`src/${sizeFolder}/static/${sizes.versions[0]}`, (err, files) => {

            for (let file = 0; file < files.length; file++) {
              if (files[file] === 'overwrite.scss') {
                const stream = fs.createReadStream(`base-template/scss/master/${masterScss}`);

                for (let i = 0; i < sizes.versions.length; i++) {
                  stream.pipe(fs.createWriteStream(`src/${sizeFolder}/static/${sizes.versions[i]}/${files[file]}`));

                  (err)
                  ? console.log(chalk.red(`[E] findEditedMasterScss() static error: ${err}`))
                  : console.info(chalk.green(`Master overwrite.scss file copied to src/${sizeFolder}/static/${sizes.versions[i]}/${files[file]}`));
                }
              }
            }
          });
        }
      }
    });
  }

	populateTemplate(dir, data) {

    if (this.DoubleClick) {

      /* Creates an empty image directory for each src banner. */
      fse.ensureDir(`${dir}/${DoubleClick}/img`, (err) => {
        if (err) {
          return console.error(chalk.red(`[E] populateTemplate():fse.ensureDir error: ${err}`));
        }
      });

      /* Restore master images to the master banner */
      if (!sizes.Master && data.width === masterBanner.width && data.height === masterBanner.height) {

        fse.ensureDir(`${baseDirectory}img/master`, (err) => {
          if (err) {
            return console.error(chalk.red(`[E] populateTemplate(): fse.ensureDir error: ${err}`));
          }
        })

        fse.copy(`${baseDirectory}img/master`, `${dir}/${DoubleClick}/img`, (err) => {
          if (err) {
            return console.error(chalk.red("populateTemplate(): fse.copy error:", err));
          }
          console.info(chalk.green(`Master images copied to ` + `${dir}`.match(/([^\/]*)\/*$/)[1] + `/${DoubleClick}/img`));
        });
      }
    }

		this.formatFiles.map((file) => {
			this.formatPopulate(file, data, dir);
		});


    if (!this.Master) {
      this.findEditedMasterScss();
    }

	}

	format(str, obj) {
    return str.toString().replace(/\{{([^}]+)\}}/g, (match, group) => {
      return obj[group];
    });
	}

  baseReadStream(file, data) {

    let fileData;

    switch(path.extname(file)) {
      case '.js':
        fileData = fs.readFileSync(`${baseDirectory}js/${file}`, 'utf8');
        return this.format(fileData, data);
        break;
      case '.scss':
        fileData = fs.readFileSync(`${baseDirectory}scss/${file}`, 'utf8');
        return this.format(fileData, data);
        break;
      case '.html':
        fileData = fs.readFileSync(`${baseDirectory}${file}`, 'utf8');
        return this.format(fileData, data);
        break;
      default:
        break;
    }
  }

	// Copy files and their contents into their correct subfolders
	formatPopulate(file, data, dir) {

    let processedData;

		// Create individual folders for specific js files.
    if (this.isStatic()) {

      switch(file) {
        case 'main.js':
          processedData = this.baseReadStream(file, data);
          fs.writeFileSync(`${dir}/${file}`, processedData, 'utf8');
          break;
        case 'index.html':
        case 'overwrite.scss':
        case 'static.js':
          processedData = this.baseReadStream(file, data);
          for (var version in versions) {
            if(versions.hasOwnProperty(version)) {
              fs.writeFileSync(`${dir}/${Static}/${versions[version]}/${file}`, processedData, 'utf8');
            }
          }
          break;
        default:
          break;
      }
    }

    if (this.DoubleClick) {
      switch(file) {
        case 'index.html':
        case 'overwrite.scss':
        case 'doubleclick.js':
          processedData = this.baseReadStream(file, data);
          fs.writeFileSync(`${dir}/${DoubleClick}/${file}`, processedData, 'utf8');
          break;
        case 'main.js':
          processedData = this.baseReadStream(file, data);
          fs.writeFileSync(`${dir}/${file}`, processedData, 'utf8');
          break;
        default:
          break;
      }
    }
	}
}

!isDoubleClick && !isStatic
  ? console.error(chalk.red('[E] Doubleclick and Static cannot both be false. Set one or both to true in sizes.json'))
  : new GenerateTemplates();
