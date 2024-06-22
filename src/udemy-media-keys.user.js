// ==UserScript==
// @name         Fix Udemy Media Keys
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      1.0.0
// @description  Make your keyboard media key work on Udemy again
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/udemy-media-keys.user.js
// @match       *://*.udemy.com/course/*
// @icon         https://udemy.com/staticx/udemy/images/v8/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  navigator.mediaSession.setActionHandler('play',          () => document.querySelector('[data-purpose="play-button"]').click());
  navigator.mediaSession.setActionHandler('pause',         () => document.querySelector('[data-purpose="pause-button"]').click());
  navigator.mediaSession.setActionHandler('previoustrack', () => document.querySelector('[data-purpose="rewind-skip-button"]').click());
  navigator.mediaSession.setActionHandler('nexttrack',     () => document.querySelector('[data-purpose="forward-skip-button"]').click());
})();
