// ==UserScript==
// @name         Paywall Remover
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.2.0
// @description  Remove the overlay preventing you from reading an article on The Daily Beast, Washington Post, and Rolling Stone
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/paywall-remover.user.js
// @match        https://www.thedailybeast.com/*
// @match        https://www.washingtonpost.com/*
// @match        https://www.rollingstone.com/*
// @grant        none
// ==/UserScript==

(function () {
  const domain = location.hostname.replace(/^(https?:\/\/)?(www\.)?/, "");

  if (domain === "thedailybeast.com") {
    document.querySelector("body").classList.remove("is-locked");
    document
      .querySelectorAll(
        "#piano_bottom_ribbon_modal_wrapper, #piano_bottom_ribbon_modal_wrapper, #piano_bottom_ribbon_modal_expand_wrapper, #piano_wrapper, #piano_mobile_small_interstitial_wrapper"
      )
      .forEach((el) => el.remove());
  } else if (domain === "washingtonpost.com") {
    function removeWpPaywall() {
      document.querySelectorAll("html, body").forEach((el) => el.removeAttribute("style"));
      document.querySelectorAll("#wall-bottom-drawer, .paywall-overlay, .regwall-overlay").forEach((el) => el.remove());
    }

    //Remove after a delay, could try again after a different delay if this is changed in the future
    removeWpPaywall();
    setTimeout(removeWpPaywall, 1500);
  } else if (domain === "rollingstone.com") {
    function removeRsPaywall() {
      document.querySelectorAll("html, body").forEach((el) => el.removeAttribute("style"));
      document.querySelector("#main-wrapper")?.nextElementSibling.remove();
    }

    //Remove after a delay, could try again after a different delay if this is changed in the future
    removeRsPaywall();
    setTimeout(removeRsPaywall, 2000);
    setTimeout(removeRsPaywall, 5000);
  }
})();
