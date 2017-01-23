# Cohaesus Banner Builder
=======


# Production Workflow

## 1. Local Setup (OSX)
- Clone the repository.
- Navigate to the project's root directory which contains *Gulpfile.js*.
- Run `$ sudo npm install gulp -g` to ensure you have [Gulp](https://www.npmjs.com/package/gulp) installed on your machine.
- Run `$ npm i` to install all necessary node modules, and create the *config/deploy.json* file.
- Install the [EditorConfig](http://editorconfig.org/) package in your text editor.
- Checkout into a new branch using the proper naming convention, i.e:
    - agency/campaign
    - hotfix/
    - enhancement/

<br>

## 2. Configure the Browser Matrix 
- In *gulp/styles.js*, configure the sass task's **browsers** attribute in accordance with the brief's browser matrix.
- A list of browser options is available on [Browserslist](https://github.com/ai/browserslist#queries).
<pre><code>.pipe(_gulp.autoprefixer({
  browsers: ['IE >= 10', 'last 2 Firefox versions', 'Safari >= 6', 'last 2 Chrome versions', 'last 2 Edge versions']
}))</pre></code>

<br>

## 3. Configure *sizes.json*

### Dimensions (array of objects): 
- Include an item in the array for each ad size required in the brief. 
- Ensure the 'Master' size in the brief is the 0th item in the array. 
- Use the suffix property if the banner size is also required to be Interstitial, Expanding, etc. <br>

```
{
  "dimensions":
  [
    {
      "width": 300,
      "height": 250,
      "suffix": ""
    },
    {
      "width": 300,
      "height": 250,
      "suffix": "interstitial"
    },
    {
      "width": 300,
      "height": 250,
      "suffix": "expanding"
    },
    {
      "width": 200,
      "height": 500,
      "suffix": ""
    }
  ]
}
```

<br>

### Versions (array of strings): 
- For Static banners. These will likely be served on the Google Display Network (GDN), and not through Doubleclick.
- If there are to be multiple versions of each size (e.g. brand names, differing messages etc.) include an item in the array as a label for each required version. <br>

```
{
  "versions":
    [
      "version1",
      "version2",
      "version3"
    ]
}
```

<br>

### Variables (boolean):
- **DoubleClick** : set to true if the ad is to be served through DoubleClick Studio.
- **Static** : set to true if the ad is to be served outside of DoubleClick Studio.
- **Master** : set to true when building the initial Master banner size.
- `$ npm run generate` will fail if both **Doubleclick** and **Static** are set to **false**. <br>

```
{
  "DoubleClick" : true,
  "Static" : false,
  "Master" : true
}
```

<br>

## 4. Build the Master Banner
- Ensure **Master** is set to **true** in *sizes.json*.
- Run `$ npm run generate` to create the *src/* directory. 


### HTML
- *index.html* can be found in the root of each banner size.
- When adding images to or injecting text on the banner, nest a **div** inside the desired frame, and use either *doubleclick.js* || *static.js* to set the background image / injected text.
- If you need to add additional frames, ensure they have an id and the following classes: `id="frame[n]" class="frame[n] slide-item"`, where [n] is the number of the frame. 


### SCSS
- Any scss that will be used across multiple banner sizes should be added to the *src/_global-scss* directory.
- *src/_global-scss* follows the [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/) methodology.
- Any banner-specific styling should be added to the banner's *overwrite.scss* file. This file automatically imports all of the global scss when you compile it to the *prod/* folder's *overwrite.css* file when you run `$ gulp`. 


### IMG
- Add any images that will be used across multiple banner sizes to *src/_global-images/*.
- Any images specific to the banner should be added to the banner's *img/* subdirectory (e.g. *src/300x250/doubleclick/img/*).
- Global images will be added to each banner's *img/* subdirectory in *prod/* when you run `$ gulp`. 


### JS
- *doubleclick.js* or *static.js* will be generated depending on your boolean variables in *sizes.json*. 
- Add your [TweenLite](https://greensock.com/tweenlite) animations using *doubleclick.js* || *static.js* **animate()**.
- Assign your images, text, or exit links using *doubleclick.js* || *static.js* **getContent()**.
- Map your background images to *index.html* frame ids using *doubleclick.js* || *static.js* **imgMap()**.
- Add injected text from **getContent()** to *index.html* frame ids using *doubleclick.js* **setText()**.
- *main.js* contains shared functionality for all banners. You should not need to edit anything in this file. 

    **Doubleclick (Spreadsheet Driven Vs. Non-Spreadsheet Driven):**
    - If the campaign is dynamic (i.e. spreadsheet driven), you will need to replace the Profile ID in *doubleclick.js* **getContent()** with the one generated from the code in Doubleclick Studio.
    - You will also need to replace **Cohaesus_Test_2016_300x250** with the relevant file path (also generated in Doublelclick Studio).
    - If the campaign is non-dynamic (not spreadsheet driven), comment out the **if** conditional below: <br>

``` 
/* Comment this conditional out if non-dynamic (not spreadsheet driven)  */
if (Enabler.isServingInLiveEnvironment()) {

  /* Taken from the Dynamic Profile code generation in DoubleClick. */
  Enabler.setProfileId(1234567);

  /* 'dynamicContent.' is required. 'Foobar_Test_2016_300x250' is taken from the Dynamic Profile code generation. */
  return dynamicContent.Cohaesus_Test_2016_300x250[0];
}
```

<br>

### Production
- Run `$ gulp` to generate the *prod/* directory and start the **watch** tasks for each of the file types.
- *src/_global-scss* and *overwrite.scss* will be compiled and minified to *overwrite.css*.
- *doubleclick.js* || *static.js* and *main.js* will be compiled and minified to *ad.js*.
- *src/global-images* and the banner's *img* sub-directory will be optimised, merged and added to the *prod/* banner's *img/* subdirectory.
- *index.html* will be minified and added to the root of the banner's directory. 

<br>

### Deploy to Staging (FTP)
- Once you are happy with the Master Banner, you can deploy to an FTP server.
- Replace the placeholder text in *config/deploy.json* with the relevant FTP credentials.
- The value for Project is what will appear in the url, e.g. http://foobar.codereach.co.uk/placeholder-project/
- The deployment will fail if either the production directory fails to build, or if any placeholder text is found in the FTP credentials.
- Remember to pull the latest version of the campaign **before** you push to FTP (otherwise you risk overwriting someone else's work).  
- Run `$ gulp deploy:staging` to deploy the contents of *prod/* to the *web/content/Project* directory of your FTP server.
- Once deployed, have the client sign off the Master Banner before proceeding to the next step.

<br>

## 5. Build Remaining Banners 
- Once the client is satisfied that the Master banner matches the brief and has signed it off, ensure that `gulp` is no longer running. 
- Run `$ gulp master` (This overwrites the respective base-template files with the Master files in *src/* and then deletes the *src/* & *prod/* directories).
- Set the **Master** property in *sizes.json* to **false** and save the file.
- Run `$ npm run generate` to restore the master banner, and generate all remaining banner sizes.
- Run `$ gulp` again to generate the *prod/* directory.  
- Make adjustments in *src/* as required in order to match the brief for each banner size, version, or type. 
- Deploy all banners to the FTP staging server and have them signed off by the client.

    **Auto-generate spreadsheets for dynamic Doubleclick campaigns**
    - Running `$ gulp export:csv` will extract information from the *doubleclick.js* **getContent()** objects in the *src/* directory. 
    - It will output one file per size to the *csv_exports/* directory in the project root, and will log what CSV files have been written in the console.
    - The task will only populate the first 3 rows in the CSV file: Columns, Default Row and First Row. The remaining rows need to be done manually.
    - Import the CSV files into the spreadsheet application in Doubleclick Studio.
    - **Import Settings:** Import Action("Replace current sheet"); Separator character("Comma"); Convert text to numbers and dates("Yes"). 

<br>

## 6. Shipping

### Doubleclick
- Upload all files to Doubleclick Studio.
- For non-dynamic builds, you will need to add *img/* to the Creative's *Path* column.


### Static
- Run `$ gulp export:zip` to compress each static production banner size and version into a zip file and create a global zip file containing all versions.
- Email the zipped banner folders to the client.

<br>

## General error handling
- If you get the following error: `no such file or directory, scandir 'src'` it means that you are missing the *src/* directory. Run `$ npm run generate`.
- If you generate the zip files and clicking on the zip file, generates a file with the `.cpgz` extension, then download this app [Unarchiver](https://itunes.apple.com/us/app/the-unarchiver/id425424353?mt=12) and it should fix it. This seems to be a mac bug.
- If your commit fails, it is likely due to one of the pre-commit lint tasks failing. Check your terminal output to ensure all errors are rectified. 

<br>

## Cheatsheets

### Node
- `$ npm i` : Installs all package dependancies for the project.
- `$ npm run generate` : Distributes *base-template/* files to the *src/* directory. 

### Gulp
- `$ gulp` : (Default) Deletes *prod/* if it exists; compiles all *src/* files to the *prod/* folder; opens the project in the browser, and watches for any changes to *src/* files.

    **`$ gulp [task]` :**
    - `connect` : Opens the *prod/* directory in Google Chrome.
    - `del` : Deletes the *prod/* and *src/* directories.
    - `del:prod` : Deletes the *prod/* directory.
    - `deploy:staging` : Deploys the contents of the *prod/* directory to an FTP server.
    - `dev` : Similar to the default task, but does not trigger the Watch or Connect tasks.
    - `export:csv` : Generates .csv files to *csv_exports/* that can be uploaded to Doubleclick Studio for dynamic campaigns.
    - `export:zip` : Zips the *prod/static/* directory and all individual static banners, and adds them to *zipped-banners/* in the project root.
    - `master` : Copies the master banner *src/* files to the respective *base-template/* subdirectories (*sizes.Master* must be **true**).
    - `lint` : Runs HTML, SCSS, and JS Linting on the *src/* directory files.
    - `test` : Opens a localhost server in Google Chrome, Firefox, and Safari to view the the *prod/* directory builds.
    - `watch` : Watches all *src/* directory files for any changes, and runs tasks based on the files that were changed.

<br>

## TL;DR Features
- Create any combination of DoubleClick banners, Dynamic DoubleClick banners, and/or non-DoubleClick banners with multiple versions for each ad size. 
- Create a Master banner version and apply these global changes to all required banner dimensions once completed.
- Use Gulp to copy all changes in html, js, scss, jpg, and png source files into optimised versions in their relative production folders.
- Automatically serve the production banners to a localhost in your browser
- Create javascript files for use in DoubleClick with Enabler and/or static non-DoubleClick versions with pure javascript.
- Use linting tools to check for code quality.
- Automatically deploy banners to an FTP server.
- Auto zip non-DoubleClick banners according to the banner size.
