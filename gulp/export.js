'use strict';

import csvExport from 'json2csv';
import vm        from 'vm';
import chalk     from 'chalk';
import fs        from 'fs';
import gulp      from 'gulp';
import path      from 'path';
import {
  getFolders,
  Static,
  Master,
  _gulp
} from './functions';


// Zip the static folder and zip all individual static banners.
gulp.task('export:zip', () => {
  if (!Static) {
    console.info(chalk.yellow(`[W] Export:Zip task requires sizes.Static to be true. Check yo' self!`));
  } else {
    const folders = getFolders('prod/static');
    const applyZip = (source, name) => {
      return gulp.src(source)
        .pipe(_gulp.zip(`${name}.zip`))
        .pipe(gulp.dest('zipped-banners'));
    }

    applyZip('prod/static/**', 'static');

    for (let folder in folders) {
      if(folders.hasOwnProperty(folder)) {
        console.log(folders[folder]);
        applyZip(`prod/static/${folders[folder]}/**`, folders[folder].toString());
      }
    };
  }
});


// Export DoubleClick content as CSV for upload to spreadsheet
gulp.task('export:csv', () => {

    const srcFolders = getFolders('src');
    const foldersLen = srcFolders.length;
    let srcPath, folderPath, count = 0;

    (!Master) ? runExport() : console.info(chalk.yellow('[W] export:csv can only be run after setting master to false in sizes.json'));

    function runExport(){
        for (let i = 0; i < foldersLen; i++) {
            srcPath = `./src/${srcFolders[i]}/doubleclick/doubleclick.js`;
            if (fs.existsSync(srcPath)) {
                folderPath = `./csv_export`;
                !fs.existsSync(folderPath) ? fs.mkdirSync(folderPath) : null;
                exportToCSV(srcPath, srcFolders[i]);
                count++;
            }
        }
        if (count === 0){
          return console.info(chalk.yellow('No DoubleClick builds to export. Static does not require spreadsheet functionality.'));
        }else{
            return false;
        }
    }

});


/*
*  Points to note:
*  Always output a minumum of 3 rows:
*    - 1 = Column titles.
*    - 2 = Default row.
*    - 3 = First row (same as default apart from unique_id, creative_content, reporting_label and is_default columns)
*/
function exportToCSV(srcPath, currentSize){

    let context = {}, contentObject = {}, fields = [], csvContent = [], rowName, reportingValue, defaultValue, count = 0;

    try {
      vm.runInNewContext(fs.readFileSync(srcPath, 'utf8', 'r'), context, srcPath);
      contentObject = context.getContent();
    } catch(err) {
        throw err;
    }

    //init fields with required fields
    fields = [
          'unique_id',
          'campaign_id',
          'creative_content',
          'reporting_label',
          'start_date',
          'end_date',
          'is_default',
          'is_active'
    ];

    for (let i = 0; i < 2; i++) {

        if( count !== parseInt(0) ){
            reportingValue = 'Feed_Row_'+count;
            defaultValue = 'FALSE';
        } else{
            reportingValue = 'Feed_Default';
            defaultValue = 'TRUE';
        }

        csvContent[count] = {};
        csvContent[count]['unique_id'] = count+1;
        csvContent[count]['campaign_id'] = 1000001;
        csvContent[count]['creative_content'] = reportingValue;
        csvContent[count]['reporting_label'] = reportingValue;
        csvContent[count]['start_date'] = '';
        csvContent[count]['end_date'] = '';
        csvContent[count]['is_default'] = defaultValue;
        csvContent[count]['is_active'] = 'TRUE';

        for (let column in contentObject) {

            if( count !== parseInt(0) ){
                //populates second row
                if (contentObject[column]['Url']){
                    csvContent[count][column] = contentObject[column]['Url'];
                }else if(typeof contentObject[column] === 'string'){
                    csvContent[count][column] = contentObject[column];
                }
            }else{
                //populates default row
                if (contentObject[column]['Url']){
                    csvContent[count][column] = contentObject[column]['Url'];
                    fields.push(column);//required for first run to populate columns
                }else if (typeof contentObject[column] === 'string'){
                    csvContent[count][column] = contentObject[column];
                    fields.push(column);//required for first run to populate columns
                }
            }
        }
        count++;
    }

    let csv = csvExport({ data: csvContent, fields: fields });
    try {
        fs.writeFileSync(path.join(__dirname, `../csv_export/${currentSize}.csv`), csv, 'utf8', 'w');
        console.info(chalk.green(`The CSV file has been exported for ${currentSize}.`));
    } catch(err) {
        throw err;
    }

}
