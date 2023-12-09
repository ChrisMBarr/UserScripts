// ==UserScript==
// @name         Amazon Vine UI Enhancer
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.4
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

  //=========================================================================
  //User configurable variables =============================================
  const dimmedItemWordList = ["cake topper", "hair extension", "dreadlock extension", "castor oil", "wig",];

  //=========================================================================
  //Variables used for multiple sections ====================================
  //Grab the body BG color in case any custom themes are applied to the site
  const bodyBgColor = getComputedStyle(document.body).backgroundColor;

  //grab the border color, style, and size
  const border = getComputedStyle(document.querySelector('[data-a-name="vine-items"]')).border;

  //=========================================================================
  //Hide the "recently viewed items" and the footer underneath all the vine items
  //This make the page easier to scroll around on and speeds up the page since it will never load the data dynamically now
  GM_addStyle(`#rhf, #navFooter{display: none !important;}`);

  //=========================================================================
  //Slightly taller popup modal window to the ETV is always visible =========
  GM_addStyle(`.a-popover-modal-fixed-height{height: 550px !important;} .a-popover-inner{padding-bottom: 112px !important;}`);

  //=========================================================================
  //Side categories: bolded selected items and show nesting better ==========
  GM_addStyle(`
  a.selectedNode{font-weight: bold;}
  a.selectedNode:hover{color: inherit !important;}
  .child-node{
    padding-left: 10px;
    margin-left: 0;
    border-left: ${border};
  }
  `);

  //=========================================================================
  //Sticky footer pagination ================================================
  GM_addStyle(`#vvp-items-grid-container > [role="navigation"] {
    position:sticky;
    bottom:0;
    padding-top: 5px;
    background-color: ${bodyBgColor};
    border-top: ${border};
    z-index: 30;
  }`);

  //=========================================================================
  //Sticky top bar with search ==============================================
  const selBtnAndSearch = `[data-a-name="vine-items"] .vvp-items-button-and-search-container`;
  const elBtnAndSearch = document.querySelector(selBtnAndSearch);
  GM_addStyle(`${selBtnAndSearch} {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${bodyBgColor};
    border-bottom: ${border};
    z-index: 30;
  }`);

  //Steal the margin value and use it as padding instead for the header so we can have a colored BG
  const btnAndSearchStyles = getComputedStyle(elBtnAndSearch);
  elBtnAndSearch.style.padding = btnAndSearchStyles.margin;
  elBtnAndSearch.style.margin = "0 !important";

  //=========================================================================
  //Sticky side bar with categories =========================================
  const selCategories = `#vvp-browse-nodes-container`;
  const elCategories = document.querySelector(selCategories);
  GM_addStyle(`${selCategories} {
    align-self: start;
    position: sticky;
  }`);

  //Set the sticky top position of the categories to the height of the top bar
  //unless the categories are taller than the screen
  if (elCategories.offsetHeight + elBtnAndSearch.offsetHeight <= document.documentElement.clientHeight) {
    elCategories.style.top = `${elBtnAndSearch.offsetHeight}px`;
  }

  //=========================================================================
  //After searching, pressing "show all" will return you to the AI section instead of RFY
  if (document.location.search.includes("search=")) {
    const showAllLink = document.querySelector("#vvp-browse-nodes-container>p>a");
    showAllLink.href = showAllLink.href.replace(/\?queue=\w+$/, "?queue=encore");
  }

  //=========================================================================
  //Pagination when left/right arrow keys are pressed =======================
  document.body.addEventListener("keyup", (ev) => {
    if (document.activeElement.tagName.toLowerCase() !== "input") {
      //Only do this if you are not currently in an input field
      if (ev.key === "ArrowLeft") {
        const el = document.querySelector(".a-pagination li:first-child a");
        el.focus();
        el.click();
      } else if (ev.key === "ArrowRight") {
        const el = document.querySelector(".a-pagination li:last-child a");
        el.focus();
        el.click();
      }
    }
  });

  //=========================================================================
  //Fade/Dim items with descriptions that match something in the word list defined at the top
  GM_addStyle(`.dimmed-tile {
    opacity: .25;
    transition: opacity 300ms;
  }
  .dimmed-tile:hover { opacity: 1; }`);

  document.querySelectorAll("#vvp-items-grid > .vvp-item-tile").forEach((itemEl) => {
    const description = itemEl.querySelector(".vvp-item-product-title-container .a-truncate-full").innerText.toLowerCase();
    if (dimmedItemWordList.some((listItem) => description.includes(listItem))) {
      itemEl.classList.add("dimmed-tile");
    }
  });
})();
