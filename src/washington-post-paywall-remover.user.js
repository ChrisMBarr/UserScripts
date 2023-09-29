// ==UserScript==
// @name         Washington Post Paywall Remover
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1
// @description  Remove the overlay and drawer preventing you from reading an article you've already loaded the full content of
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/raw/main/src/washington-post-paywall-remover.user.js
// @match        https://www.washingtonpost.com/*
// @icon         https://www.washingtonpost.com/touch-icon-iphone.png
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  function removePaywall() {
    document.querySelector("html").style.overflow = "";
    document.querySelector("body").style.overflow = "";
    document.querySelector("#wall-bottom-drawer").remove();
    document.querySelector(".regwall-overlay").remove();
  }

  //Remove after a delay, could try again after a different delay if this is changed in the future
  setTimeout(removePaywall, 1500);
})();
