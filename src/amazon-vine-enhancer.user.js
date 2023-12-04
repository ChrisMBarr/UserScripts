// ==UserScript==
// @name         Amazon Vine UI Enhancer
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1
// @description  Minor UI improvements to browsing items on Amazon Vine
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/raw/main/src/amazon-vine-enhancer.user.js
// @match        https://www.amazon.com/vine/vine-items*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  //CSS selector strings
  const selBtnAndSearch = `[data-a-name="vine-items"] .vvp-items-button-and-search-container`;
  const selCategories = `#vvp-browse-nodes-container`;

  //Element selectors
  const elBtnAndSearch = document.querySelector(selBtnAndSearch);
  const elCategories = document.querySelector(selCategories);

  //Set some base styles
  GM_addStyle(`
  ${selBtnAndSearch} {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${getComputedStyle(document.body).backgroundColor};
  }

  ${selCategories} {
    align-self: start;
    position: sticky;
  }
  `);

  //use padding instead of margin for the header
  const btnAndSearchStyles = getComputedStyle(elBtnAndSearch);
  elBtnAndSearch.style.padding = btnAndSearchStyles.margin;
  elBtnAndSearch.style.margin = "0 !important";

  //Set the sticky top position of the categories to the height of the top bar
  //unless the categories are taller than the screen
  if (elCategories.offsetHeight + elBtnAndSearch.offsetHeight <= document.documentElement.clientHeight) {
    elCategories.style.top = `${elBtnAndSearch.offsetHeight}px`;
  }
})();
