'use strict';

/* ==========================================================================
  DO NOT EDIT CODE BELOW THIS LINE
========================================================================== */

var isInitialized = false;
var isImagesLoaded = false;

if( 'readyState' in document ) {

  if ( document.readyState === 'complete' ) {
    isInitialized = true;
    initialize();
  }
}


if( isInitialized === false ) {

  if( 'onload' in window ) {
    window.onload = initialize;
  }

  else {
    setTimeout(function() {
      initialize();
    }, 1500);
  }
}


/* Sets the content of the advertisement - only runs when DOM is ready. */

function politeInit() {

  /* Get Content */
  var adContent = getContent();
  var imgMap = imageMap(adContent);

  /* Set Content */
  exitHandler(adContent);
  if (typeof setText === 'function') {
    setText(adContent);
  }
  setImages(imgMap);
}


/* Called when all images are loaded as a callback from imgpreload(imgs, callback). */

function onImagesLoaded() {
  isImagesLoaded = true;
}


function onVisible() {
  removeCover();
  animate();
}


/* Keeps checking until isImagesLoaded = true, then will run the animation when this condition is met. */

function checkLoaded() {
  if( isImagesLoaded === true ){
    onVisible();
  }
  else{
    setTimeout(function(){
      checkLoaded();
    }, 1000);
  }
}


/*
*  Sets background images in the DOM. Iterates over Object returned from imageMap(adContent).
*
*  @param imageAssignments: imageMap object with key:value pairs from imageMap(adContent) function.
*  @return:                 This function does not return anything.
*/

function setImages(imageAssignments) {
  var images = [];

  if ( imageAssignments.length <= 0 ) {
    onImagesLoaded();
  }

  else {

    for (var image in imageAssignments) {

      if (imageAssignments.hasOwnProperty(image)) {
        document.getElementById(image).style.background = 'url(' + imageAssignments[image] + ')';
        images.push(imageAssignments[image]);
      }
    }

    imgpreload(images, onImagesLoaded);
  }
}


/*
*  Checks all images are loaded, and when confirmed runs callback. Taken from https://gist.github.com/eikes/3925183
*
*  @param imgs:      Array of images added.
*  @param callback:  Callback function to be run once amount of images to be loaded are found.
*/

function imgpreload(imgs, callback) {
  var loaded = 0;
  var images = [];
  imgs = Object.prototype.toString.apply( imgs ) === '[object Array]' ? imgs : [imgs];
  var inc = function() {
    loaded += 1;

    if ( loaded === imgs.length && callback ) {
      callback( images );
    }
  };

  for ( var i = 0; i < imgs.length; i++ ) {
    images[i] = new Image();
    images[i].onabort = inc;
    images[i].onerror = inc;
    images[i].onload = inc;
    images[i].src = imgs[i];
  }
}


/*
*  Injects plain text or HTML into the DOM by its parent element ID.
*  Note: This will replace all current HTML in the parent element.
*
*  @param text:    The text/HTML (string) to be added.
*  @param element: The ID (string) of the element to be modified.
*  @return:        The action of setting DOM element content.
*/

function addText(text, element) {
  return (document.getElementById(element).innerHTML = text);
}


function removeCover() {
  return (document.getElementById('covering-div').classList.add('hide'));
}
