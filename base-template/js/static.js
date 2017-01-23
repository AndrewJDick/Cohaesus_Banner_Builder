'use strict';

/*
*  Initializer - actions when DOM is ready.
*
*  politeInit()  = populates the DOM.
*  checkLoaded() = checks the status of isImagesLoaded variable in main.js and runs animation when all is ready
*/

function initialize() {

  politeInit();
  checkLoaded();
}


/* ==========================================================================
  ONLY EDIT CODE BELOW THIS LINE
========================================================================== */

/*
*  Creates Exit link handlers.
*  @param adContent: Static content from getContent() object that is passed in.
*/

function exitHandler(adContent) {

  var element = document.getElementById('bg-exit');

  if (element.addEventListener) {
    element.addEventListener('click', function() { window.open(adContent.exit.Url, '_blank'); });
  }

  /* IE8 and earlier */

  else if (element.attachEvent) {
    element.attachEvent('onclick', function() { window.open(adContent.exit.Url, '_blank'); });
  }
}


/*
*  Contatins key:value map of images such that 'Element_ID' : 'Image_Address'.
*  These Images will be set as backgrounds to the Elements.
*
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


/*
*  Contains image location and names for the banner.
*  Used by imageMap(adContent) to get the images and set as background to elements in the DOM.
*
*  @return:          The devDynamicContent.Static[0] object.
*/

function getContent() {

  var devDynamicContent = {};
  devDynamicContent.Static = [{}];

  /* Used for adding Images */
  devDynamicContent.Static[0].main_image = {};
  devDynamicContent.Static[0].main_image.Url = 'img/red.jpg';
  devDynamicContent.Static[0].image_url_1 = {};
  devDynamicContent.Static[0].image_url_1.Url = 'img/blue.jpg';
  devDynamicContent.Static[0].image_url_2 = {};
  devDynamicContent.Static[0].image_url_2.Url = 'img/green.jpg';
  devDynamicContent.Static[0].image_url_3 = {};
  devDynamicContent.Static[0].image_url_3.Url = 'img/orange.jpg';

  /* Used for adding Exit Links */
  devDynamicContent.Static[0].exit = {};
  devDynamicContent.Static[0].exit.Url = 'http://www.google.com/';

  return devDynamicContent.Static[0];
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
