// ==UserScript==
// @name         Amazon Vine Mobile Styles
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      1.0.0
// @description  Add Thoravarium's Vine Styles to a mobile browser
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/amazon-vine-mobile-styles.user.js
// @match        https://*.amazon.com/vine/*
// @match        https://*.amazon.ca/vine/*
// @match        https://*.amazon.co.uk/vine/*
// @match        https://*.amazon.de/vine/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        GM_addStyle
// ==/UserScript==

(async function() {
  const result = await fetch('https://raw.githubusercontent.com/Thorvarium/vine-styling/main/mobile/ios-with-bugfix.css');
  const cssContent = await result.text();
  GM_addStyle(cssContent);
})();
