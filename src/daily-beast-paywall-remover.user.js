// ==UserScript==
// @name         Daily Beast Paywall Remover
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.1.0
// @description  Remove the overlay and drawer preventing you from reading an article you've already loaded the full content of
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/daily-beast-paywall-remover.user.js
// @match        https://www.thedailybeast.com/*
// @icon         https://www.thedailybeast.com/pf/resources/favicon_DB.ico?d=271
// @grant        none
// ==/UserScript==

(function () {
  document.querySelector("body").classList.remove('is-locked');
  document.querySelectorAll("#piano_bottom_ribbon_modal_wrapper, #piano_bottom_ribbon_modal_wrapper, #piano_bottom_ribbon_modal_expand_wrapper, #piano_wrapper, #piano_mobile_small_interstitial_wrapper").forEach((el) => el.remove());
})();
