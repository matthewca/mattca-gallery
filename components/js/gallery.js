/*!
 *
 * @license Copyright (c) 2014, Matthew Smith. All rights reserved.
 * This work is subject to the terms at http://www.matt.ca/8cHk/terms-of-use.html
 *
 * @author: Matthew Smith, matt@matt.ca
 *
 **/

function mattcaGallery(photos, backURL, buffer) {
  
  
  /* Variables */
  
  var theBody; //reference to the body tag
  var gallery; //the gallery is a div that contains div.photo's
  var photoArray; // array of photo urls
  var startImageObjectArray; // array of images to load at the start
  var startIconObjectArray; // array of icons to load at the start
  var imageObjectArray; // array of image objects
  var galleryOpen = false; // false if gallery is not open (loading screen still visible)
  var i; // counter
  var j; // counter
  var str; // html for the photos and divs that go inside #gallery
  var userHasHiddenIcons; // true if the user has clicked or tapped on the screen to hide the icons
  var startLeft; // initial scrollLeft value for #gallery
  var endLeft; // final scrollLeft value for #gallery
  var swipedLeft; // boolean value used touchEnd and mouseEnd functions
  var swipedRight; // boolean value used touchEnd and mouseEnd functions
  var w; // inner width of the browser window
  var h; // inner height of the browser window
  var photos; // a reference to the photo containers (div.photo) inside #gallery
  var timeout; // reference to the setTimeout result used in showIconsIfNotHiddenByUser function
  var position = 0; //the current photo position in photoArray
  var translateX = 0; //the amount the gallery is shifted
  var loading = 0; //the number of photos needing to be loaded
  var url; // the address 
  var regExp; // regular expression
  var regRes; // regular express result matches
  var buffer; // this is the number of images in front and behind the position that will be loaded in the dom
  var bufferTimeout; // reference to the setTimeout result used in movePosition function
  var backURL;
  var moveTimeout;
  
  var inTransition = false; // true if in between photo transition
  var isPanning = false; // true if using one finger to move element while zoomed in
  var isZooming = false; // true if two fingers are being used to zoom
  var isZoomedIn = false; // true if zoomed in
  
  
  /* Icons */
  
  var iconLoader;
  var iconArrows;
  var iconBack;
  var rightButton;
  var leftButton;
  var closeButton;
  
  
  /* Swiping Variables */
  
  var startX0; // initial pageX value for the finger or mouse
  var endX0; // final pageX value for the finger or mouse
  
  
  /* Panning Variables */
  
  var panningStartX0;
  var panningStartY0;
  var panningEndX0;
  var panningEndY0;
  var panningTranslateFromTranslatingX;
  var panningTranslateFromTranslatingY;
  var panningContinuousTranslateX = 0;
  var panningContinuousTranslateY = 0;
  var panningNewTranslateX;
  var panningNewTranslateY;
  
  
  /* Zooming Variables */
  
  var zoomingStartFingerX0;
  var zoomingStartFingerY0;
  var zoomingStartFingerX1;
  var zoomingStartFingerY1;
  var zoomingStartDistanceBetweenFingers;
  
  var zoomingEndFingerX0;
  var zoomingEndFingerY0;
  var zoomingEndFingerX1;
  var zoomingEndFingerY1;
  var zoomingEndDistanceBetweenFingers;
  
  var zoomingScale = 1;
  var zoomingContinuousScale = 1;
  var zoomingContinuousTranslateX = 0;
  var zoomingContinuousTranslateY = 0;
  var zoomingOriginX;
  var zoomingOriginY;
  var zoomingLeftOffset = 0;
  var zoomingTopOffset = 0;
  var zoomingCurrentOriginX = 0;
  var zoomingCurrentOriginY = 0;
  var zoomingNewTranslateX = 0;
  var zoomingNewTranslateY = 0;
  
  var delta; //from mouse wheel
  
  
  /* Initial Setup */
  
  if (document.readyState == 'complete') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      init()
    }, false);
  }
  
  function init() {
    //console.log('init');
    //get the width of the inner browser
    w = window.innerWidth;
    h = window.innerHeight;
    //add interface components
    theBody = document.querySelector('body');
    var navigation = '<div id="loading"><p>Loading...</p></div>' + '<div class="close-icon"></div>' + '<div class="right-arrow-icon arrow"></div>' + '<div class="left-arrow-icon arrow"></div>' + '<div id="gallery" style="position:absolute; left: -'+w+'px; width: '+3*w+'px"></div>';
    theBody.classList.add('fade-left-arrow');
    theBody.innerHTML = navigation;
    gallery = document.getElementById('gallery');
    rightButton = document.querySelector('.right-arrow-icon');
    leftButton = document.querySelector('.left-arrow-icon');
    closeButton = document.querySelector('.close-icon');
    //enable photo transitions
    enablePhotoTransition();
    photoArray = photos; //assign array of photos urls to 
    //if a photo position is requested
    url = window.location.search;
    regExp = /photo=(\d*)/;
    regRes = regExp.exec(url);
    //load start images
    loadStartImages();
    //add event listeners
    addEventListeners();
    //if backurl is set
    console.log(backURL);
    if (backURL == null || backURL == '') {
      closeButton.style.display = 'none';
      backURL = '';
    } else {
      backURL = backURL;
    }
    console.log(backURL);
    if (buffer == null) {
      buffer = 3;
    } else {
      buffer = buffer;
    }
  }
  
  function loadStartImages() {
    //create an array of initial buffered image objects
    startImageObjectArray = new Array();
    //if a photo position has been selected
    if (regRes != null && regRes[1] != '' && regRes[1] < photoArray.length && regRes[1] >= 0) {
      //set the position
      position = regRes[1] - 0; //minus zero forces it to be a number
      //load the buffer images
      i = 0;
      while (i < photoArray.length) {
        if (i >= position - buffer && i <= position + buffer) {
          loading++;
          image = new Image();
          image.addEventListener("load", imageLoaded, false);
          image.src = photoArray[i];
          startImageObjectArray.push(image);
        }
        i++;
      }
    } else {
      //just need to load initially the image from 0 to the buffer
      i = 0;
      while (i < buffer) {
        loading++;
        startImageObjectArray[i] = new Image();
        //add listener
        startImageObjectArray[i].addEventListener("load", imageLoaded, false);
        startImageObjectArray[i].src = photoArray[i];
        i++;
      }
    }
    //create an array of initial buffered icons
    startIconObjectArray = new Array();
    loading++;
    iconLoader = new Image();
    iconLoader.addEventListener("load", imageLoaded, false);
    iconLoader.src = 'https://s3-us-west-2.amazonaws.com/mattca-images/gallery-script/ajax-loader.gif';
    startIconObjectArray.push(iconLoader);
    loading++;
    iconArrows = new Image();
    iconArrows.addEventListener("load", imageLoaded, false);
    iconArrows.src = 'https://s3-us-west-2.amazonaws.com/mattca-images/gallery-script/arrows.png';
    startIconObjectArray.push(iconArrows);
    loading++;
    iconBack = new Image();
    iconBack.addEventListener("load", imageLoaded, false);
    iconBack.src = 'https://s3-us-west-2.amazonaws.com/mattca-images/gallery-script/back-button.png';
    startIconObjectArray.push(iconBack);
  }
  
  function loadRemainingImages() {
    //create an array of the image objects
    imageObjectArray = new Array(photoArray.length);
    i = 0;
    while (i < photoArray.length) {
      //see if the image is in the initial load, otherwise just add it
      j = 0;
      var found = false;
      while (j < startImageObjectArray.length) {
        if (startImageObjectArray[j].src == photoArray[i]) {
          imageObjectArray[i] = startImageObjectArray[j];
          found = true;
        }
        j++;
      }
      //if the image was not found in the initial array add it
      if (!found) {
        imageObjectArray[i] = new Image();
        imageObjectArray[i].src = photoArray[i];
      }
      i++;
    }
  }
  
  //function that checks if all the images are loading
  function imageLoaded() {
    loading--;
    //if all the images are loaded open the gallery
    if (loading == 0) {
      openGallery();
    }
  }
  
  //function that opens the gallery when all the images are loaded
  function openGallery() {
    //load images that were not loaded initially
    loadRemainingImages();
    //flag the gallery as opened
    galleryOpen = true;
    //add photos to dom
    i = 0;
    str = '';
    while (i < photoArray.length) {
      str = str + '<div class="container"><div class="photo"></div></div>';
      i++;
    }
    gallery.innerHTML = str;
    //set the icons to not be hidden by the user
    userHasHiddenIcons = false;
    //set dimensions of the 
    imgWidth = currentWidth = w;
    imgHeight = currentHeight = h;
    //get a reference to the photos
    photos = document.querySelectorAll('#gallery .photo');
    //match pictures to screen width
    setPhotoWidths();
    //fix issue with landscape safari on ios 7 by setting the scroll
    window.scrollTo(0, 0);
    //fadeout the left arrow, because we are at the beginning
    handleFadeArrows();
    //if an initial position is selected move to it
    if (regRes != null && regRes[1] != '' && regRes[1] < photoArray.length && regRes[1] >= 0) {
      movePosition(parseInt(regRes[1]));
    } else {
      movePosition(0);
    }
    //add some delay so that the fast movement isn't displayed, and the icons have time to load
    setTimeout(hideLoading, 510);
    setTimeout(showIcons, 1010);
    //remove the start image array
    startImageObjectArray = null;
  }
  
  function hideLoading() {
    document.querySelector('#loading').classList.add('loaded');
  }
  
  
  /* Touch Functions */
  
  function touchStart(event) {
    console.log('touch start');
    event.preventDefault(); //stop any mouse events from being called
    if (inTransition) return;
    if (event.touches.length == 1 && !isZoomedIn) { 
      //regular
      isPanning = false;
      isZooming = false;
      isZoomedIn = false;
      startX0 = event.targetTouches[0].pageX;
      startY0 = event.targetTouches[0].pageY;
    } else if (event.touches.length == 1 && isZoomedIn) {
      //panning
      console.log('start panning');
      isPanning = true;
      isZooming = false;
      isZoomedIn = true;
      panningStartX0 = event.targetTouches[0].pageX;
      panningStartY0 = event.targetTouches[0].pageY;
    } else if (event.touches.length == 2) {
      //zooming
      console.log('start zooming');
      isPanning = false;
      isZooming = true;
      isZoomedIn = true;
      zoomingStartFingerX0 = event.targetTouches[0].pageX;
      zoomingStartFingerY0 = event.targetTouches[0].pageY;
      zoomingStartFingerX1 = event.targetTouches[1].pageX;
      zoomingStartFingerY1 = event.targetTouches[1].pageY;
      zoomingStartDistanceBetweenFingers = Math.sqrt(Math.pow((zoomingStartFingerX1 - zoomingStartFingerX0), 2) + Math.pow((zoomingStartFingerY1 - zoomingStartFingerY0), 2));
      if (zoomingScale = 1) {
        zoomingCurrentOriginX = (zoomingStartFingerX0 + zoomingStartFingerX1) / 2;
        zoomingCurrentOriginY = (zoomingStartFingerY0 + zoomingStartFingerY1) / 2;
      }
      //hide icons when zooming
      hideIcons();
      //make sure in position
      setTranslateX(0);
    }
  }
  
  function touchMove(event) {
    console.log('touch move');
    event.preventDefault(); //fix touchEnd not firing on Android
    if (inTransition) return;
    if (!isPanning && !isZooming && !isZoomedIn) { 
      //regular
      disablePhotoTransition();
      var newTranslateX = parseFloat(event.targetTouches[0].pageX) - parseFloat(startX0);
      setTranslateX(newTranslateX);
      //hide icons when grabbing
      hideIcons();
    } else if (isPanning) {
      console.log('panning');
      panningEndX0 = event.touches[0].pageX;
      panningEndY0 = event.touches[0].pageY;
      panningTranslateFromTranslatingX = panningEndX0 - panningStartX0;
      panningTranslateFromTranslatingY = panningEndY0 - panningStartY0;
      panningNewTranslateX = panningContinuousTranslateX + panningTranslateFromTranslatingX;
      panningNewTranslateY = panningContinuousTranslateY + panningTranslateFromTranslatingY;
      //make sure there's no wasted space around the image
      if(panningNewTranslateX+zoomingOriginX+(w - zoomingOriginX)*zoomingScale <= w){
        panningNewTranslateX = 0;
        zoomingOriginX = w;
      }
      else if (panningNewTranslateX+zoomingOriginX*(1-zoomingScale) >= 0){
        panningNewTranslateX = 0;
        zoomingOriginX = 0;        
      }
      if(panningNewTranslateY+zoomingOriginY+(h - zoomingOriginY)*zoomingScale <= h){
        panningNewTranslateY = 0;
        zoomingOriginY = h;
      }
      else if (panningNewTranslateY+zoomingOriginY*(1-zoomingScale) >= 0){
        panningNewTranslateY = 0;
        zoomingOriginY = 0;
      }
      //update the location
      setPhotoTransfrom(zoomingOriginX, zoomingOriginY, panningNewTranslateX, panningNewTranslateY, zoomingScale);
    } else if (isZooming) {
      if (event.touches.length != 2) return;
      if (!theBody.classList.contains('zoomed')) theBody.classList.add('zoomed');
      zoomingEndFingerX0 = event.targetTouches[0].pageX;
      zoomingEndFingerY0 = event.targetTouches[0].pageY;
      zoomingEndFingerX1 = event.targetTouches[1].pageX;
      zoomingEndFingerY1 = event.targetTouches[1].pageY;
      zoomingEndDistanceBetweenFingers = Math.sqrt(Math.pow((zoomingEndFingerX1 - zoomingEndFingerX0), 2) + Math.pow((zoomingEndFingerY1 - zoomingEndFingerY0), 2));
      zoomingScale = (zoomingEndDistanceBetweenFingers / zoomingStartDistanceBetweenFingers) * zoomingContinuousScale;
      if (zoomingScale < 1) zoomingScale = 1;
      if (zoomingScale > 5) zoomingScale = 5;
      if (zoomingScale == 1 && zoomingContinuousScale == 1) return;
      if (zoomingScale == 5 && zoomingContinuousScale == 5) return;
      zoomingOriginX = (((zoomingStartFingerX0 + zoomingStartFingerX1) / 2) - zoomingLeftOffset) / zoomingContinuousScale;
      zoomingOriginY = (((zoomingStartFingerY0 + zoomingStartFingerY1) / 2) - zoomingTopOffset) / zoomingContinuousScale;
      zoomingNewTranslateX = zoomingCurrentOriginX - zoomingOriginX;
      zoomingNewTranslateY = zoomingCurrentOriginY - zoomingOriginY;
      if (zoomingScale == 1) {
        zoomingNewTranslateX = 0;
        zoomingNewTranslateY = 0;
      }
      //make sure there's no wasted space around the image
      if(zoomingNewTranslateX+zoomingOriginX+(w - zoomingOriginX)*zoomingScale <= w){
        zoomingNewTranslateX = 0;
        zoomingOriginX = w;
      }
      else if (zoomingNewTranslateX+zoomingOriginX*(1-zoomingScale) >= 0){
        zoomingNewTranslateX = 0;
        zoomingOriginX = 0;        
      }
      if(zoomingNewTranslateY+zoomingOriginY+(h - zoomingOriginY)*zoomingScale <= h){
        zoomingNewTranslateY = 0;
        zoomingOriginY = h;
      }
      else if (zoomingNewTranslateY+zoomingOriginY*(1-zoomingScale) >= 0){
        zoomingNewTranslateY = 0;
        zoomingOriginY = 0;
      }
      //update the location
      setPhotoTransfrom(zoomingOriginX, zoomingOriginY, zoomingNewTranslateX, zoomingNewTranslateY, zoomingScale);
    }
  }
  
  function touchEnd(event) {
    console.log('touch end');
    event.preventDefault(); //stop any mouse events from being called
    if (inTransition) return;
    if (!isPanning && !isZooming && !isZoomedIn) {
      //regular
      //enable photo transitions
      enablePhotoTransition();
      //disable active arrows (they get stuck on mobile)
      rightButton.classList.remove('active');
      leftButton.classList.remove('active');
      endX0 = event.changedTouches[0].pageX;
      endY0 = event.changedTouches[0].pageY;
      //if a tap display or hide icons
      if (startX0 <= endX0 + 5 && startX0 >= endX0 - 5 && startY0 <= endY0 + 5 && startY0 >= endY0 - 5) {
        toggleIcons();
      } else {
        if (startX0 > endX0) {
          //mouse left
          if (hasNext()) {
            //movePosition(position + 1);
            slideNext();
          } else {
            enablePhotoTransition();
            setTranslateX(0);
          }
        } else {
          if (hasPrevious()) {
            //movePosition(position - 1);
            slidePrevious();
          } else {
            enablePhotoTransition();
            setTranslateX(0);
          }
        }
        setTimeout(showIconsIfNotHiddenByUser, 500, true);
      }
    } else if (isPanning) {
      panningContinuousTranslateY = panningNewTranslateY;
      panningContinuousTranslateX = panningNewTranslateX;
      zoomingCurrentOriginX = zoomingOriginX;
      zoomingCurrentOriginY = zoomingOriginY;
      zoomingContinuousTranslateX = panningNewTranslateX;
      zoomingContinuousTranslateY = panningNewTranslateY;
      zoomingLeftOffset = photos[position].getBoundingClientRect().left;
      zoomingTopOffset = photos[position].getBoundingClientRect().top;
    } else if (isZooming) {
      zoomingContinuousScale = zoomingScale;
      zoomingCurrentOriginX = zoomingOriginX;
      zoomingCurrentOriginY = zoomingOriginY;
      zoomingContinuousTranslateX = zoomingNewTranslateX;
      zoomingContinuousTranslateY = zoomingNewTranslateY;
      zoomingLeftOffset = photos[position].getBoundingClientRect().left;
      zoomingTopOffset = photos[position].getBoundingClientRect().top;
      if (zoomingScale == 1) {
        isZoomedIn = false;
        showIconsIfNotHiddenByUser();
        //enable photo transitions
        enablePhotoTransition();
      }
      panningContinuousTranslateY = zoomingNewTranslateX;
      panningContinuousTranslateX = zoomingNewTranslateY;
    }
    
  }
  
  function touchCancel(event) {
    console.log('touch cancel');
  }
  
  function zoomOut() {
    photos[position].style['-webkit-transform-origin'] = '';
    photos[position].style['-moz-transform-origin'] = '';
    photos[position].style['-ms-transform-origin'] = '';
    photos[position].style['transform-origin'] = '';
    photos[position].style['-webkit-transform'] = "translateX(0px) translateY(0px) scale(1)";
    photos[position].style['-moz-transform'] = "translateX(0px) translateY(0px) scale(1)";
    photos[position].style['-ms-transform'] = "translateX(0px) translateY(0px) scale(1)";
    photos[position].style['transform'] = "translateX(0px) translateY(0px) scale(1)";
    zoomingContinuousScale = 1;
    zoomingCurrentOriginX = 0;
    zoomingCurrentOriginY = 0;
    zoomingContinuousTranslateX = 0;
    zoomingContinuousTranslateY = 0;
    panningContinuousTranslateY = zoomingNewTranslateX;
    panningContinuousTranslateX = zoomingNewTranslateY;
    zoomingLeftOffset = 0;
    zoomingTopOffset = 0;
  }
  
  function arrowTouchStart(event) {
    console.log('arrow touch start');
    event.preventDefault();
    event.target.classList.add('active');
  }
  
  function arrowTouchEnd(event) {
    console.log('arrow touch end');
    event.preventDefault();
    if (event.target.classList.contains('right-arrow-icon')) {
      onRightIconClick();
    } else {
      onLeftIconClick();
    }
    event.target.classList.remove('active');
  }
  
  
  /* Mouse Functions */
  
  function mouseStart(event) {
    //console.profile();
    //console.log('mouse start');
    event.preventDefault();
    startX0 = event.clientX;
    startY0 = event.clientY;
    gallery.addEventListener("mousemove", mouseMove, false);
    gallery.classList.add('moving');
    //disable photo transitions
    disablePhotoTransition();
    //console.profileEnd();
  }
  
  function mouseMove(event) {
    console.log('mouse move');
    event.preventDefault();
    if (isZoomedIn) {
      //panning
      console.log('panning');
      endX0 = event.clientX;
      endY0 = event.clientY;
      //console.log(zoomingLeftOffset + (startX0 - endX0));
      zoomingNewTranslateX = zoomingContinuousTranslateX - (startX0 - endX0);
      zoomingNewTranslateY = zoomingContinuousTranslateY - (startY0 - endY0);
      //limit frame shifts
      var width = w;
      var height = h;
      if(zoomingNewTranslateX+zoomingOriginX+(width - zoomingOriginX)*zoomingContinuousScale <= width){
        zoomingNewTranslateX = 0;
        zoomingOriginX = width;
      }
      else if (zoomingNewTranslateX+zoomingOriginX*(1-zoomingContinuousScale) >= 0){
        zoomingNewTranslateX = 0;
        zoomingOriginX = 0;        
      }
      if(zoomingNewTranslateY+zoomingOriginY+(height - zoomingOriginY)*zoomingContinuousScale <= height){
        zoomingNewTranslateY = 0;
        zoomingOriginY = height;
      }
      else if (zoomingNewTranslateY+zoomingOriginY*(1-zoomingContinuousScale) >= 0){
        zoomingNewTranslateY = 0;
        zoomingOriginY = 0;
      }
      setPhotoTransfrom(zoomingOriginX, zoomingOriginY, zoomingNewTranslateX, zoomingNewTranslateY, zoomingContinuousScale);
    } else {
      //grab to switch position
      //var newTranslateX = parseFloat(-position * w) + parseFloat(event.clientX) - parseFloat(startX0);
      var newTranslateX = parseFloat(event.clientX) - parseFloat(startX0);
      setTranslateX(newTranslateX);
      //hide icons when grabbing
      //hideIcons();
    }
  }
  
  function mouseEnd(event) {
    console.log('mouse end');
    event.preventDefault();
    gallery.removeEventListener("mousemove", mouseMove, false);
    gallery.classList.remove('moving');
    //enable photo transitions
    enablePhotoTransition();
    if (isZoomedIn) {
      //finished panning
      zoomingContinuousTranslateX = zoomingNewTranslateX;
      zoomingContinuousTranslateY = zoomingNewTranslateY;
      if (startX0 == endX0 || endX0 == null) {
        //console.log('toggle icons');
        toggleIcons();
      } 
    } else {
      //switch positions
      endX0 = event.clientX;
      //if a tap display or hide icons
      if (startX0 == endX0) {
        //console.log('toggle icons');
        toggleIcons();
      } else {
        if (startX0 > endX0) {
          //mouse left
          if (hasNext()) {
            slideNext();
            //movePosition(position + 1);
          } else {
            enablePhotoTransition();
            setTranslateX(0);
            //movePosition(position);
          }
        } else {
          if (hasPrevious()) {
            slidePrevious();
            //movePosition(position - 1);
          } else {
            enablePhotoTransition();
            setTranslateX(0);
            //movePosition(position);
          }
        }
        setTimeout(showIconsIfNotHiddenByUser, 500, true);
      }
    }
  }
  
  function mouseWheel(event) {
    //console.log((event.wheelDelta == null));
    if (event.type == 'DOMMouseScroll') {
      //firefox
      delta = event.detail*(-120);
    } else {
      //webkit, ie
      delta = event.wheelDelta;
    }
    console.log('delta = '+delta);
    if (delta > 0) {
      //hide icons
      hideIcons();
      isZoomedIn = true;
    }
    //new scale
    var newScale = zoomingContinuousScale + delta/1000;
    // scale limits
    var maxscale = 20;
    if(newScale<1){
      newScale = 1;
      showIconsIfNotHiddenByUser();
      isZoomedIn = false;
    }
    else if(newScale>maxscale){
      newScale = maxscale;
    }
    //current current position on image
    var imageX = event.clientX - zoomingLeftOffset;
    var imageY = event.clientY - zoomingTopOffset;
    //previous cursor position on image
    var prevOrigX = zoomingCurrentOriginX*zoomingContinuousScale;
    var prevOrigY = zoomingCurrentOriginY*zoomingContinuousScale;
    //set origin to current cursor position
    zoomingOriginX = imageX/zoomingContinuousScale;
    zoomingOriginY = imageY/zoomingContinuousScale;
    // move zooming frame to current cursor position
    if ((Math.abs(imageX-prevOrigX)>1 || Math.abs(imageY-prevOrigY)>1) && zoomingContinuousScale < maxscale) {
      zoomingContinuousTranslateX = zoomingContinuousTranslateX + (imageX-prevOrigX)*(1-1/zoomingContinuousScale);
      zoomingContinuousTranslateY = zoomingContinuousTranslateY + (imageY-prevOrigY)*(1-1/zoomingContinuousScale);
    }
    // stabilize position by zooming on previous cursor position
    else if(zoomingContinuousScale != 1 || imageX != prevOrigX && imageY != prevOrigY) {
      zoomingOriginX = prevOrigX/zoomingContinuousScale;
      zoomingOriginY = prevOrigY/zoomingContinuousScale;
      //frame limit
    }
    // on zoom-out limit frame shifts to original frame
    if(delta <= 0){
      var width = w;
      var height = h;
      if(zoomingContinuousTranslateX+zoomingOriginX+(width - zoomingOriginX)*newScale <= width){
        zoomingContinuousTranslateX = 0;
        zoomingOriginX = width;
      }
      else if (zoomingContinuousTranslateX+zoomingOriginX*(1-newScale) >= 0){
        zoomingContinuousTranslateX = 0;
        zoomingOriginX = 0;        
      }
      if(zoomingContinuousTranslateY+zoomingOriginY+(height - zoomingOriginY)*newScale <= height){
        zoomingContinuousTranslateY = 0;
        zoomingOriginY = height;
      }
      else if (zoomingContinuousTranslateY+zoomingOriginY*(1-newScale) >= 0){
        zoomingContinuousTranslateY = 0;
        zoomingOriginY = 0;
      }
    }
    //update the location
    setPhotoTransfrom(zoomingOriginX, zoomingOriginY, zoomingContinuousTranslateX, zoomingContinuousTranslateY, newScale);
    //update values
    zoomingLeftOffset = photos[position].getBoundingClientRect().left;
    zoomingTopOffset = photos[position].getBoundingClientRect().top;
    zoomingScale = newScale;
    zoomingContinuousScale = newScale;
    zoomingCurrentOriginX = zoomingOriginX;
    zoomingCurrentOriginY = zoomingOriginY;
    panningContinuousTranslateY = zoomingContinuousTranslateX;
    panningContinuousTranslateX = zoomingContinuousTranslateY;
  }
  
  function arrowMouseOver(event) {
    console.log('mouse over');
    event.preventDefault();
    event.target.classList.add('active');
  }
  
  function arrowMouseOut(event) {
    console.log('mouse out');
    event.preventDefault();
    event.target.classList.remove('active');
  }
  
  
  /* Keyboard Functions */
  
  function onKeyUp(e) {
    //console.log('on key up');
    //if (isZoomedIn) return;
    /*var key = e.keyCode ? e.keyCode : e.which;
    if (key == 39 || key == 40) {
      if (hasNext()) movePosition(position + 1);
    } else if (key == 37 || key == 38) {
      if (hasPrevious()) movePosition(position - 1);
    }*/
    e.preventDefault();
    rightButton.classList.remove('active');
    leftButton.classList.remove('active');
  }
  
  function onKeyDown(e) {
    //console.log('on key down');
    e.preventDefault();
    //if (isZoomedIn) return;
    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 39 || key == 40) {
      rightButton.classList.add('active');
      if (hasNext()) slideNext();
    } else if (key == 37 || key == 38) {
      leftButton.classList.add('active');
      if (hasPrevious()) slidePrevious();
    }
  }
  
  
  /* Icon Functions */
  
  function toggleIcons() {
    console.log('toggle icons');
    if (theBody.classList.contains('icons-visible')) {
      userHasHiddenIcons = true;
      hideIcons();
    } else {
      showIcons();
      userHasHiddenIcons = false;
    }
  }
  
  function showIcons() {
    //don't show the icons if something is zoomed
    //if (!isZoomedIn) theBody.classList.add('icons-visible');
    theBody.classList.add('icons-visible');
    theBody.classList.add('not-zoomed');
    theBody.classList.remove('zoomed');
  }
  
  function showIconsIfNotHiddenByUser(delayed) {
    if (isZoomedIn) return;
    delayed = typeof delayed !== 'undefined' ? delayed : false;
    if (delayed) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(showIconsIfNotHiddenByUser, 1400);
    } else {
      //show the icons again
      if (!userHasHiddenIcons) {
        showIcons();
      }
    }
    //check if any arrows need to be faded
    handleFadeArrows();
  }
  
  function hideIcons() {
    theBody.classList.remove('icons-visible');
  }
  
  function handleFadeArrows() {
    //console.log('handle fade arrows');
    //fade out the left arrow if at beginning
    if (position == 0) {
      //console.log('fade left arrow');
      if (!theBody.classList.contains('fade-left-arrow')) {
        theBody.classList.add('fade-left-arrow');
      }
      //make sure right is not faded
      theBody.classList.remove('fade-right-arrow');
    } else if (position == photoArray.length - 1) {
      //console.log('fade right arrow');
      //fade out the right arrow if at the end
      if (!theBody.classList.contains('fade-right-arrow')) {
        theBody.classList.add('fade-right-arrow');
      }
      //make sure left is not faded
      theBody.classList.remove('fade-left-arrow');
    } else {
      //console.log('no fade arrow');
      theBody.classList.remove('fade-left-arrow');
      theBody.classList.remove('fade-right-arrow');
    }
  }
  
  function onCloseIconClick() {
    window.location.href = backURL;
  };
  
  function onRightIconClick() {
    //console.log("on right click, hasnext = " + hasNext());
    //if (hasNext()) movePosition(position + 1);
    if (inTransition) return;
    if (hasNext()) slideNext();
  };
  
  function onLeftIconClick() {
    //console.log("on left click");
    //if (hasPrevious()) movePosition(position - 1);
    if (inTransition) return;
    if (hasPrevious()) slidePrevious();
  };
  
  
  /* Other Functions */
  
  function setPhotoTransfrom(ox, oy, x, y, s) {
    //console.profile();
    photos[position].style['-webkit-transform-origin'] = ox + 'px ' + oy + 'px';
    photos[position].style['-ms-transform-origin'] = ox + 'px ' + oy + 'px';
    photos[position].style['transform-origin'] = ox + 'px ' + oy + 'px';
    photos[position].style.MozTransformOrigin = ox + 'px ' + oy + 'px';
    photos[position].style['-webkit-transform'] = "translateX(" + x + "px) translateY(" + y + "px) scale(" + s + ")";
    photos[position].style['-ms-transform'] = "translateX(" + x + "px) translateY(" + y + "px) scale(" + s + ")";
    photos[position].style['transform'] = "translateX(" + x + "px) translateY(" + y + "px) scale(" + s + ")";
    //console.profileEnd();
  }
  
  function getTranslateX() {
    //console.log('getTranslateX() = ' + translateX);
    return translateX;
  }
  
  function setTranslateX(x) {
    //console.log('setTranslateX() = ' + x);
    translateX = x;
    gallery.style['transform'] = "translateX(" + x + "px)";
    gallery.style['-webkit-transform'] = "translateX(" + x + "px)";
    gallery.style['-ms-transform'] = "translateX(" + x + "px)";
  }
  
  function onResize() {
    console.log('onResize');
    //get width of browser
    w = window.innerWidth;
    //get height of browser
    h = window.innerHeight;
    //<div id="gallery" style="position:absolute; left: -'+w+'px; width: '+3*w+'px"></div>
    gallery.style['left'] = -w+'px';
    gallery.style['width'] = (3*w)+'px';
    //hide all photos (solves safari crash problem)
    //hideAllPhotos();
    //match pictures to screen width
    setPhotoWidths();
    //fix issue with landscape safari on ios 7 by setting the scroll
    window.scrollTo(0, 0);
    //zoom out image
    zoomOut();
    //fix image offset
    movePosition(position);
  }
  
  function setPhotoWidths(p) {
    //match pictures to screen width
    [].forEach.call(photos, function (el) {
      el.style.width = w + 'px';
    });
  }
  
  function hideAllPhotos() {
    [].forEach.call(photos, function (el) {
      //make invisible
      el.style.backgroundImage = '';
      el.style['transform'] = '';
      el.style['-webkit-transform'] = '';
      el.style['-ms-transform'] = '';
      el.style['-webkit-backface-visibility'] = '';
    });
  }
  
  function enablePhotoTransition() {
    gallery.classList.add('transition'); //this transitions the gallery to it's new position
  }
  
  function disablePhotoTransition() {
    gallery.classList.remove('transition');
  }
  
  function hasNext() {
    if (photoArray[position + 1] != null) {
      return true;
    } else {
      return false;
    }
  }
  
  function hasPrevious() {
    if (photoArray[position - 1] != null) {
      return true;
    } else {
      return false;
    }
  }
  
  function slideNext() {
    inTransition = true;
    console.log('slide next');
    //transition to next spot
    enablePhotoTransition();
    position = position + 1;
    //transition back to normal
    if (moveTimeout) { 
      console.log('move next early');
      clearTimeout(moveTimeout);
      setTranslateX(0);
      movePosition(position);
    } else {
      setTranslateX(-w);
      moveTimeout = setTimeout(movePosition, 500, position);
    }
  }
  
  function slidePrevious() {
    inTransition = true;
    console.log('slide previous');
    //transition to next spot
    enablePhotoTransition();
    position = position - 1;
    //transition back to normal
    if (moveTimeout) { 
      console.log('move next early');
      clearTimeout(moveTimeout);
      setTranslateX(0);
      movePosition(position);
    } else {
      setTranslateX(w);
      moveTimeout = setTimeout(movePosition, 500, position);
    }
  } 
  
  function movePosition(newPosition) {
    moveTimeout = null;
    //remove the trasition so it happens immediately
    disablePhotoTransition();
    //console.log("move to " + newPosition);
    if (isZoomedIn) zoomOut();
    position = newPosition;
    //setTranslateX(position * -1 * w);
    setTranslateX(0);
    updateBuffer(enablePhotoTransition); //the callback function is used so that the transition is enabled after the buffer is updated
    handleFadeArrows();
    inTransition = false;
  }
  
  function updateBuffer(callbackFunction) {
    //remove background images that are not close to this position
    i = 0;
    str = '';
    while (i < photoArray.length) {
      if (i >= position - buffer && i <= position + buffer) {
        photos[i].style.backgroundSize = '';
        photos[i].style.backgroundImage = 'url(' + imageObjectArray[i].src + ')';
        photos[i].style['transform'] = 'translateZ(0)';
        photos[i].style['-webkit-transform'] = 'translateZ(0)';
        photos[i].style['-ms-transform'] = 'translateZ(0)';
        photos[i].style['-webkit-backface-visibility'] = 'hidden';
        photos[i].style.marginLeft = 0;
        if (photos[i].parentNode == null) gallery.children[i].appendChild(photos[i]);
      } else {
        if (photos[i].parentNode != null) photos[i].parentNode.removeChild(photos[i]);
      }
      i++;
    }
    //add some padding if at the beginning or end
    if (position == 0) {
      photos[0].style.marginLeft = w+'px';
    } 
  }
  
  function addEventListeners() {
    
    /* Add Touch Listeners */
    
    gallery.addEventListener("touchstart", touchStart, false);
    gallery.addEventListener("touchmove", touchMove, false);
    gallery.addEventListener("touchend", touchEnd, false);
    gallery.addEventListener("touchcancel", touchCancel, false);
    rightButton.addEventListener("touchstart", arrowTouchStart, false);
    leftButton.addEventListener("touchstart", arrowTouchStart, false);
    rightButton.addEventListener("touchend", arrowTouchEnd, false);
    leftButton.addEventListener("touchend", arrowTouchEnd, false);
    
    /* Add Mouse Listeners */
    
    gallery.addEventListener("mousedown", mouseStart, false);
    gallery.addEventListener("mouseup", mouseEnd, false);
    var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
    gallery.addEventListener(mousewheelevt, mouseWheel, false);
    rightButton.addEventListener("mouseover", arrowMouseOver, false);
    rightButton.addEventListener("mouseout", arrowMouseOut, false);
    leftButton.addEventListener("mouseover", arrowMouseOver, false);
    leftButton.addEventListener("mouseout", arrowMouseOut, false);
    
    /* Add Keyboard Listeners */
    
    window.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('keydown', onKeyDown, false);
    
    /* Add Icon Listeners */
    
    closeButton.addEventListener("click", onCloseIconClick, false);
    rightButton.addEventListener("click", onRightIconClick, false);
    leftButton.addEventListener("click", onLeftIconClick, false);
    
    /* Add Other Listeners */
    
    window.addEventListener('resize', onResize, false);
    
  }
  
}