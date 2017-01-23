'use strict';

function initialize() {
  if (Enabler.isInitialized()) {
    onInitialized();
  }
  else {
    Enabler.addEventListener(studio.events.StudioEvent.INIT, onInitialized);
  }
}


/*
*  Program flow for when the Enabler Object is ready.
*  Because of the window.onload event in main.js and initialize() in doubleclick.js this function will only run when:
*    - Initial DOM content for the advert iframe has been loaded.
*    - The Enabler object is Initialized.
*/

function onInitialized() {

  politeInit();

  if ( !Enabler.isVisible() ) {
    Enabler.addEventListener( studio.events.StudioEvent.VISIBLE,checkLoaded );
  } else {
     checkLoaded();
  }
}


/*
*  Creates Exit link handlers.
*  @param adContent: The Enabler object with dynamic content that is passed in.
*/

function exitHandler(adContent) {

  var element = document.getElementById('bg-exit');

  if (element.addEventListener) {
      element.addEventListener('click', function() { Enabler.exitOverride('Exit1', adContent.exit.Url); });
  }

  /* IE8 and earlier */
  else if (element.attachEvent) {
      element.attachEvent('onclick', function() { Enabler.exitOverride('Exit1', adContent.exit.Url); });
  }
}


/* Returns either the Dynamic Feed Content (using the DoubleClick Enabler), or Static content from the devDynamicContent object. */

function getContent() {

  /*
  *  - If doubleClick is dynamic (spreadsheet driven):
  *     - Use relative file paths and the devDynamicContent.DoubleClick object for local testing.
  *     - Replace the Profile ID with the one found in the Dynamic Profile code generation in DoubleClick.
  *     - Replace '.Cohaesus_Test_2016_300x250[0]' with the respective name, which can also be found in the code generation.
  *     - The dynamicContent object will replace devDynamicContent in a live environment (i.e. once uploaded to DoubleClick).
  *
  *  - If doubleClick is not dynamic (non-spreadsheet driven):
  *      - Use relative paths in the devDynamicContent object below (e.g. img/blue.png)
  *      - Comment out the 'Enabler.isServingInLiveEnvironment()' conditional below.
  *
  *  - The devDynamicContent object below can simply be replaced with the auto-generated object from DoubleClick.
  */

  var devDynamicContent = {};
  devDynamicContent.DoubleClick = [{}];
  devDynamicContent.DoubleClick[0]._id = 0;

  /* Used for adding Images */

  devDynamicContent.DoubleClick[0].main_image = {};
  devDynamicContent.DoubleClick[0].main_image.Type = 'file';
  devDynamicContent.DoubleClick[0].main_image.Url = 'img/red.jpg';
  devDynamicContent.DoubleClick[0].image_url_1 = {};
  devDynamicContent.DoubleClick[0].image_url_1.Type = 'file';
  devDynamicContent.DoubleClick[0].image_url_1.Url = 'img/blue.jpg';
  devDynamicContent.DoubleClick[0].image_url_2 = {};
  devDynamicContent.DoubleClick[0].image_url_2.Type = 'file';
  devDynamicContent.DoubleClick[0].image_url_2.Url = 'img/green.jpg';
  devDynamicContent.DoubleClick[0].image_url_3 = {};
  devDynamicContent.DoubleClick[0].image_url_3.Type = 'file';
  devDynamicContent.DoubleClick[0].image_url_3.Url = 'img/orange.jpg';

  /* Used for adding Text/HTML (Optional) */

  devDynamicContent.DoubleClick[0].text_1_textID = 'frame2';
  devDynamicContent.DoubleClick[0].text_1_copy = '<p class="dummy-text">FRAME 2<br />Injected Text</p>';

  /* Used for adding Exit Links */

  devDynamicContent.DoubleClick[0].exit = {};
  devDynamicContent.DoubleClick[0].exit.Url = 'http://www.google.com/';


  if (typeof Enabler !== 'undefined') {

    Enabler.setDevDynamicContent(devDynamicContent);

    /* Comment this conditional out if non-dynamic (not spreadsheet driven)  */
    if (Enabler.isServingInLiveEnvironment()) {

      /* Taken from the Dynamic Profile code generation in DoubleClick. */
      Enabler.setProfileId(1088029);

      /* 'dynamicContent.' is required. 'Cohaesus_Test_2016_300x250' is taken from the Dynamic Profile code generation. */
      return dynamicContent.Cohaesus_Test_2016_300x250[0];
    }
  }

  return devDynamicContent.DoubleClick[0];
}


/*
*  Controller Function for the addition of HTML/Text into the DOM.
*  @param adContent: The Enabler object with dynamic content that is passed in.
*/

function setText(adContent) {
  addText(adContent.text_1_copy, adContent.text_1_textID);
}


/*
*  Contains key:value map of images such that "Element ID : Dynamic Content Address"
*  @param adContent: The Enabler object with dynamic content that is passed in.
*  @return:          The key:value object.
*/

function imageMap(adContent) {
  return {
  'banner' : adContent.main_image.Url,
  'frame1' : adContent.image_url_1.Url,
  'frame2' : adContent.image_url_2.Url,
  'frame3' : adContent.image_url_3.Url
  };
}


/* Contains the animations for advertisement. Animations are constructed using the TweenLite library (https://greensock.com/tweenlite) */

function animate() {

  /* For 5 seconds, show frame 1 */
  TweenLite.to(document.getElementById('frame1'), 0.4, { delay: 5, ease: 'easeInOut', opacity: 0 });
  /* After 5 seconds, show frame 2 */
  TweenLite.to(document.getElementById('frame2'), 0.4, { delay: 5, ease: 'easeInOut', opacity: 1 });
  /* After 5 seconds, hide frame 2 and show frame 3 */
  TweenLite.to(document.getElementById('frame2'), 0.4, { delay: 10, ease: 'easeInOut', opacity: 0 });
  TweenLite.to(document.getElementById('frame3'), 0.4, { delay: 10, ease: 'easeInOut', opacity: 1 });

}
