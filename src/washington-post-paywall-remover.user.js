// ==UserScript==
// @name         Washington Post Paywall Remover
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.1.1
// @description  Remove the overlay and drawer preventing you from reading an article you've already loaded the full content of
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/washington-post-paywall-remover.user.js
// @match        https://www.washingtonpost.com/*
// @icon         https://www.washingtonpost.com/touch-icon-iphone.png
// @grant        none
// ==/UserScript==

(function () {
  function removePaywall() {
    document.querySelectorAll("html, body").forEach((el) => el.removeAttribute("style"));
    document.querySelectorAll("#wall-bottom-drawer, .paywall-overlay, .regwall-overlay").forEach((el) => el.remove());
  }

  //Remove after a delay, could try again after a different delay if this is changed in the future
  removePaywall();
  setTimeout(removePaywall, 1500);
})();
