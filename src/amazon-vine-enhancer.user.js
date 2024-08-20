// ==UserScript==
// @name         Amazon Vine UI Enhancer
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.7.9
// @description  Minor UI improvements to browsing items on Amazon Vine
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/amazon-vine-enhancer.user.js
// @match        https://*.amazon.com/vine/*
// @match        https://*.amazon.ca/vine/*
// @match        https://*.amazon.co.uk/vine/*
// @match        https://*.amazon.de/vine/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant        GM.addStyle
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

/*
TODO:
 * customizable highlight list
*/

(function () {
  "use strict";

  //Shared Variables & Methods between sections
  const storageKeyPrefix = "VINE_UI_ENHANCER_";
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  //Applies to all pages - ability to hide a message box
  const updateAlertEl = $("#vvp-tm-update-alert");
  if (updateAlertEl) {
    const storageKeyHiddenUpdateAlert = storageKeyPrefix + "HIDDEN_ALERT";
    const hiddenAlert = localStorage.getItem(storageKeyHiddenUpdateAlert);
    const alertMessage = updateAlertEl.querySelector(".a-alert-content").innerText.toLowerCase().trim();
    if (hiddenAlert === alertMessage) {
      updateAlertEl.style.display = "none";
    } else {
      //add close button, when clicked hide it and save the message
      updateAlertEl.innerHTML += `<button type="button" id="VINE-UIE-close-alert-btn" class="a-button" style="position:absolute; top:0; right:0">
          <span class="a-button-inner">
            <span class="a-button-text" style="padding-top: 25%;">
              <i class="a-icon a-icon-close"></i>
            </span>
          </span>
        </button>`;

      $("#VINE-UIE-close-alert-btn").addEventListener("click", () => {
        updateAlertEl.style.display = "none";
        localStorage.setItem(storageKeyHiddenUpdateAlert, alertMessage);
      });
    }
  }

  //Grab the body BG color in case any custom themes are applied to the site
  const bodyStyles = getComputedStyle(document.body);
  const bodyBgColor = bodyStyles.backgroundColor;
  const bodyTextColor = bodyStyles.color;

  //grab the border color, style, and size
  const border = getComputedStyle($('[data-a-name="vine-items"]')).border;

  //Dialogs - all created dialogs will share the same basic styles
  GM_addStyle(`
  .VINE-UIE-dialog{
    width: 530px;
    background-color: ${bodyBgColor};
    color: ${bodyTextColor};
  }
  .VINE-UIE-dialog::backdrop{
    background-color: #0F1111;
    opacity: .5;
  }
  .VINE-UIE-close-dialog-btn{
    position: absolute;
    top: 7px;
    right: 7px;
  }`);

  //Generic function to create a reusable and closable dialog
  function createDialog(id, bodyHtml) {
    const dialog = document.createElement("dialog");
    dialog.id = id;
    dialog.className = "VINE-UIE-dialog";
    dialog.innerHTML = `
    <button type="button" class="a-button VINE-UIE-close-dialog-btn"><div class='a-button-text'>&times;</div></button>
    ${bodyHtml}
  `;
    document.body.append(dialog);

    // Click the close button to close dialog
    dialog.querySelector(".VINE-UIE-close-dialog-btn").addEventListener("click", () => {
      dialog.close();
    });

    //Click the backdrop to close dialog
    dialog.addEventListener("click", function (event) {
      //Close dialog when clicking on backdrop - https://stackoverflow.com/a/26984690/79677
      var rect = dialog.getBoundingClientRect();
      var isInDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        dialog.close();
      }
    });

    return dialog;
  }

  //Different tasks for the different pages - Smaller/easier pages listed first
  if (location.pathname.startsWith("/vine/account")) {
    //=========================================================================
    //PAGE: ACCOUNT
    //=========================================================================

    //Parse the eval date to get the specific re-eval time and display that in the UI
    const reevaluationDate = new Date(Number($("#vvp-eval-end-stamp").innerText));
    const reEvalTime = reevaluationDate.toLocaleTimeString();
    $("#vvp-evaluation-date-string").innerHTML += ` at <strong>${reEvalTime}</strong>`;
  } else if (location.pathname.startsWith("/vine/orders")) {
    //=========================================================================
    //PAGE: ORDERS
    //=========================================================================

    //Add a button to each order to more to show all the item info for something like a spreadsheet if needed
    $$(".vvp-orders-table tr.vvp-orders-table--row").forEach((row) => {
      const orderInfoBtn = document.createElement("span");
      orderInfoBtn.className = "a-button a-button-base vvp-orders-table--action-btn";
      orderInfoBtn.innerHTML = `<span class="a-button-inner"><button type="button" class="a-button-text">Show Info</button></span>`;
      row.querySelector(".vvp-orders-table--actions-col").append(orderInfoBtn);
      orderInfoBtn.querySelector("button").addEventListener("click", () => showOrderInfo(row));
    });

    GM_addStyle(
      `#VINE-UIE-order-info-display h3{ padding-right: 25px; }
      #VINE-UIE-order-info-display .order-item-label{
        display: inline-block;
        width: 65px;
        text-align: right;
        margin-right: 5px;
        user-select: none;
      }
      #VINE-UIE-order-info-display .order-item-value{
        user-select: all;
      }`
    );
    const orderInfoDialog = createDialog("VINE-UIE-order-info-dialog", `<div id="VINE-UIE-order-info-display"></div>`);

    function showOrderInfo(row) {
      const productName = row.querySelector("td:nth-child(2) .a-truncate-full").innerText.trim();
      const orderDate = row.querySelector("td:nth-child(3)").innerText.trim();
      const etv = row.querySelector("td:nth-child(4)").innerText.trim();
      const asin = row.querySelector("td:nth-child(2) a").href.match(/[A-Z0-9]+$/i)[0];
      const id = row.querySelector("td:nth-child(5) a").href.match(/[-0-9]+$/)[0];

      orderInfoDialog.querySelector("#VINE-UIE-order-info-display").innerHTML = `
      <h3>${productName}</h3>
      <strong class='order-item-label'>ID:</strong>      <code class='order-item-value'>${id}</code> <br>
      <strong class='order-item-label'>ASIN:</strong>    <code class='order-item-value'>${asin}</code> <br>
      <strong class='order-item-label'>Ordered:</strong> <span class='order-item-value'>${orderDate}</span> <br>
      <strong class='order-item-label'>ETV:</strong>     <span class='order-item-value'>${etv}</span>`;

      orderInfoDialog.showModal();
    }
  } else if (location.pathname.startsWith("/vine/vine-items")) {
    //=========================================================================
    //PAGE: VINE ITEMS
    //=========================================================================
    //=========================================================================

    //Variables used for multiple sections ====================================

    //Stuff for local storage of words to dim when an item description contains them

    const storageKeyWordList = storageKeyPrefix + "DIMMED_WORD_LIST";
    let wordList = [];

    const storedWords = localStorage.getItem(storageKeyWordList);
    if (storedWords === null) {
      addDefaultWordList();
    } else {
      wordList = JSON.parse(storedWords);
    }

    const storageKeyUserPreferences = storageKeyPrefix + "PREFERENCES";
    const storedPreferences = localStorage.getItem(storageKeyUserPreferences);
    let userPreferences = {
      //default preferences if nothing is stored yet
      hideWordMatches: false,
      stickySidebar: true,
      stickyTopBar: true,
      stickyPagination: true,
      addUiButtonEtv: true,
      addUiButtonFixInfiniteSpinner: true,
      useCustomItemSize: false,
      customItemSize: 110, //matches page default
      useCustomItemFontSize: false,
      customItemFontSize: 14, //in pixels, matches page default
      hideAmazonHeader: true,  //Hides the Amazon Header
      hideVineHeader: true,  //Hides the Amazon Header
    };
    if (storedPreferences !== null) {
      const parsedPreferences = JSON.parse(storedPreferences);

      //Update any missing preferences with the default values
      Object.keys(userPreferences).forEach((prefKey) => {
        if (typeof parsedPreferences[prefKey] === "undefined") {
          parsedPreferences[prefKey] = userPreferences[prefKey];
        }
      });

      userPreferences = parsedPreferences;
    }

    //for Amazon Vine users this typically means they are using Thorvarium's styles: https://github.com/Thorvarium/vine-styling
    //if so we may want to do a few things differently for compatibility when this is used in addition to this script
    const thorStyles = {
      styleSheets: [...$$("style")].filter((s) => s.innerText.includes("{{ thorvarium | vine-styling | ")),
      //defaults to false, only adding the ones we need to check for
      mobile: false,
      moreDescriptionText: false,
      paginationOnTop: false,
      smallItems: false,
    };

    if (thorStyles.styleSheets.length > 0) {
      //We can detect each stylesheet that is added if needed by checking for specific strings in CSS comments in these files
      thorStyles.mobile = thorStyles.styleSheets.some((s) => s.innerText.includes("| mobile | base }}") || s.innerText.includes("| mobile | ios-with-bugfix }}"));
      thorStyles.moreDescriptionText = thorStyles.styleSheets.some((s) => s.innerText.includes("| desktop | more-description-text }}"));
      thorStyles.paginationOnTop = thorStyles.styleSheets.some((s) => s.innerText.includes("| desktop | pagination-on-top }}"));
      thorStyles.smallItems = thorStyles.styleSheets.some((s) => s.innerText.includes("| desktop | small-items }}"));
    }

    const itemGridEl = $("#vvp-items-grid");

    //The top bar with the buttons and the search
    const btnAndSearchEl = $('[data-a-name="vine-items"] .vvp-items-button-and-search-container');

    //=========================================================================
    //Set some style preferences as soon as possible before other render stuff happens

    function setItemGridSize(size) {
      const val = size == null ? "" : `${size}px`;
      itemGridEl.style.setProperty("--grid-column-width", val);
    }

    function setItemFontSize(size) {
      const val = size == null ? "" : `${size}px`;
      if (thorStyles.moreDescriptionText) {
        itemGridEl.style.setProperty("--product-title-text-size", val);
      } else {
        itemGridEl.style.fontSize = val;
      }
    }

    if (userPreferences.useCustomItemSize && (thorStyles.smallItems || thorStyles.mobile)) {
      setItemGridSize(userPreferences.customItemSize);
    }

    if (userPreferences.useCustomItemFontSize) {
      setItemFontSize(userPreferences.customItemFontSize);
    }

    //=========================================================================
    //Styles needed for various features
    const addedPageStyles = [
      //Slightly taller popup modal window so the ETV is always visible =========
      `.a-popover-modal-fixed-height{height: 550px !important;} .a-popover-inner{padding-bottom: 112px !important;}`,
      //Raise the pagination z-index to be above the top bar in case the "pagination on top" Thor styles are added
      `.a-pagination{z-index:100}`,
      //Side categories: bolded selected items and show nesting better ==========
      `a.selectedNode{font-weight: bold;}
    a.selectedNode:hover{color: inherit !important;}
    .child-node{
      padding-left: 10px;
      margin-left: 0;
      border-left: ${border};
    }`,
      //Fade/Dim tiles
      `.VINE-UIE-dimmed-tile {
      opacity: .25 !important;
      transition: opacity 300ms;
   }`,
      //hide tiles completely
      `.VINE-UIE-hidden-tile {
      display:none;
    }
    .VINE-UIE-dimmed-tile:hover { opacity: 1; }`,
      //Settings
      `.VINE-UIE-open-settings-btn {
      ${thorStyles.mobile ? "width: 50px;" : `position:absolute; right: 0; bottom: ${userPreferences.stickyTopBar ? "1px" : "-20px"};`}
    }
    .VINE-UIE-open-settings-btn .a-btn-text{padding: 0 6px;}
    #VINE-UIE-settings-dialog h1{padding:0;}
    #VINE-UIE-settings-dialog .a-button { display: inline-block}
    #VINE-UIE-settings-dialog .VINE-UIE-settings-dialog-section {
      margin-top: .5rem;
      padding-top: .5rem;
      border-top: 1px solid #E9E9E9;
    }
    #VINE-UIE-word-list-display{
      margin: 0 0 1rem 0;
      padding: 0;
      list-style: none;
      overflow-y: scroll;
      height: 150px;
      border: 1px solid #EEE;
      background-color: ${bodyBgColor};
    }
    #VINE-UIE-word-list-display li{padding: 2px;}
    #VINE-UIE-word-list-display li:nth-child(odd) {background-color: rgba(128, 128, 128, 0.1);}
    #VINE-UIE-word-list-display li .a-button-text{line-height: 1.25rem; padding: 0 0.25rem;}
    `,
    ];

    //Sticky top bar - but not with custom mobile styles
    if (!thorStyles.mobile && userPreferences.stickyTopBar) {
      addedPageStyles.push(
        `[data-a-name="vine-items"] .vvp-items-button-and-search-container {
      position: sticky;
      top: 0;
      background-color: ${bodyBgColor};
      border-bottom: ${border};
      z-index: 30;
    }`
      );
    } else {
      addedPageStyles.push(
        `[data-a-name="vine-items"] .vvp-items-button-and-search-container {
        position: relative;
      }`
      );
    }

    //Sticky side bar with categories - but not with custom mobile styles
    if (!thorStyles.mobile && userPreferences.stickySidebar) {
      addedPageStyles.push(
        `#vvp-browse-nodes-container {
        align-self: start;
        position: sticky;
      }`
      );
    }

    //Sticky footer pagination - but not with custom mobile styles or "pagination on top" styles
    if (!thorStyles.mobile && !thorStyles.paginationOnTop && userPreferences.stickyPagination) {
      addedPageStyles.push(
        `#vvp-items-grid-container > [role="navigation"] {
      position:sticky;
      bottom:0;
      padding-top: 5px;
      background-color: ${bodyBgColor};
      border-top: ${border};
      z-index: 30;
    }`
      );
    }

    // Hide Amazon Header - but not with custom mobile styles or "pagination on top" styles
    if (userPreferences.hideAmazonHeader) {
      addedPageStyles.push(
        ` #navbar-main  {
      display: none;
    }`
      );


      addedPageStyles.push(
        `.nav-ewc-persistent-hover body  {
      padding: 0 !important;
    }`
      );
    }

     // Hide Amazon Header - but not with custom mobile styles or "pagination on top" styles
    if (userPreferences.hideVineHeader) {
      addedPageStyles.push(
        `#vvp-header  {
      display: none !important;
    }`
      );
    }

     // Hide Amazon Header - but not with custom mobile styles or "pagination on top" styles
    if (userPreferences.hideVineHeader || userPreferences.hideAmazonHeader) {
      addedPageStyles.push(
        `#skiplink  {
      display: none !important;
    }`
      );
    }

    GM_addStyle(addedPageStyles.join(""));

    //=========================================================================
    //When searching...
    if (document.location.search.includes("search=")) {
      //Put the RFY/AFA/AI area buttons back - why are they hidden during a search anyway?
      const areaButtonContainer = $("#vvp-items-button-container");
      if (areaButtonContainer.innerHTML.trim() === "") {
        areaButtonContainer.innerHTML = `
      <span id="vvp-items-button--recommended" class="a-button a-button-normal a-button-toggle" role="radio"><span class="a-button-inner"><a href="vine-items?queue=potluck" class="a-button-text">Recommended for you</a></span></span>
      <span id="vvp-items-button--all" class="a-button a-button-normal a-button-toggle" role="radio"><span class="a-button-inner"><a href="vine-items?queue=last_chance" class="a-button-text">Available for all</a></span></span>
      <span id="vvp-items-button--seller" class="a-button a-button-normal a-button-toggle" role="radio"><span class="a-button-inner"><a href="vine-items?queue=encore" class="a-button-text">Additional items</a></span></span>`;
      }

      //pressing "show all" will return you to the AI section instead of RFY
      const showAllLink = $("#vvp-browse-nodes-container>p>a");
      showAllLink.href = showAllLink.href.replace(/\?queue=\w+$/, "?queue=encore");
    }

    //=========================================================================
    //Pagination when left/right arrow keys are pressed =======================
    document.body.addEventListener("keyup", (ev) => {
      if (document.activeElement.tagName.toLowerCase() !== "input") {
        //Only do this if you are not currently in an input field
        if (ev.key === "ArrowLeft") {
          const el = $(".a-pagination li:first-child a");
          el.focus();
          el.click();
        } else if (ev.key === "ArrowRight") {
          const el = $(".a-pagination li:last-child a");
          el.focus();
          el.click();
        }
      }
    });

    //=========================================================================
    //Fade/Dim items with descriptions that match something in the word list defined at the top
    function dimTileWithDescriptionWordInList(itemElement) {

    const description = itemElement.querySelector(".vvp-item-product-title-container .a-truncate-full").innerText.toLowerCase();
      const wordMatches = wordList.filter((listItem) => description.includes(listItem));
      if (wordMatches.length > 0) {
        if (userPreferences.hideWordMatches){
            itemElement.classList.add("VINE-UIE-hidden-tile");
            itemElement.title = `Hidden because hideWordMatches is enabled and description contains:\n -${wordMatches.join("\n -")}`;
        } else {
            itemElement.classList.add("VINE-UIE-dimmed-tile");
            itemElement.title = `Dimmed because the description contains:\n -${wordMatches.join("\n -")}`;
        }
        
      }
    }

    //=========================================================================
    //Add links/buttons to replace ASIN number for products that are broken with infinite spinners

    let detailsButtonGridClass = "";
    let extraButtonGridClass = "";
    if (userPreferences.addUiButtonEtv || userPreferences.addUiButtonFixInfiniteSpinner) {
      if (!thorStyles.mobile) {
        detailsButtonGridClass = "a-button-span" + (thorStyles.smallItems ? 6 : 8);
        extraButtonGridClass = "a-button-span" + (thorStyles.smallItems ? 3 : 2);
      }

      const addedTileButtonStyles = [
        `.vvp-details-btn{
      border-top-right-radius:0 !important;
      border-bottom-right-radius:0 !important;
    }
    .vvp-item-tile-content .a-button:not(.vvp-details-btn, :last-child) {
      border-radius: 0;
    }
    .vvp-item-tile-content .a-button:not(.vvp-details-btn) {
      height: auto !important;
      padding: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .vvp-item-tile-content .a-button .a-button-text{
      padding:0;
    }
    .vvp-item-tile-content .a-button.a-button-span2{width: 16.5% !important;}
    .VINE-UIE-get-etv-link.a-button-disabled, .VINE-UIE-get-etv-link.a-button-disabled .a-button-text{
      cursor: not-allowed !important;
      filter: saturate(50%);
    }
    .VINE-UIE-etv-display{
      font-size: 12px;
      margin: 0 !important;
    }`,
      ];

      if (thorStyles.smallItems || thorStyles.mobile) {
        //When also using StyleBot, the all buttons need less padding so they can fit
        addedTileButtonStyles.push(`
          .a-button-inner{height: auto !important}
          .vvp-item-tile .a-button-text{padding:5px 2px;}
        `);
      } else if (userPreferences.addUiButtonEtv) {
        addedTileButtonStyles.push(`
        .vvp-item-tile-content{position: relative;}
        .VINE-UIE-etv-display{
          position: absolute;
          right: 16.5%;
          bottom: 55px;
          width: auto !important;
        }`);
      }

      GM_addStyle(addedTileButtonStyles.join(""));
    }

    function addTileLinks(itemElement) {
      const tileContentEl = itemElement.querySelector(".vvp-item-tile-content");
      const detailsButtonEl = itemElement.querySelector(".vvp-details-btn");
      const inputEl = detailsButtonEl.querySelector("input.a-button-input");
      const isParent = /true/i.test(inputEl.getAttribute("data-is-parent-asin"));

      //Use an Amazon grid class to size the "see details" button
      if (detailsButtonGridClass !== "") detailsButtonEl.classList.add(detailsButtonGridClass);
      if (thorStyles.smallItems) {
        //less text in the details button when using StyleBot styles so the extra buttons can fit better
        detailsButtonEl.querySelector(".a-button-text").innerText = "details";
      }

      //Add a link to check the ETV
      if (userPreferences.addUiButtonEtv) {
        const getEtvLink = document.createElement("button");
        getEtvLink.setAttribute("type", "button");
        getEtvLink.setAttribute("class", `VINE-UIE-get-etv-link a-button a-button-primary ${extraButtonGridClass}`);
        getEtvLink.innerHTML = `<span class='a-button-inner'><span class='a-button-text'>💵</span></span>`;

        const etvLinkClickFn = async (ev) => {
          ev.preventDefault();

          //Only one click per button
          getEtvLink.classList.remove("a-button-primary");
          getEtvLink.classList.add("a-button-disabled");
          getEtvLink.removeEventListener("click", etvLinkClickFn);

          const etvDisplayEl = document.createElement("div");
          etvDisplayEl.className = "VINE-UIE-etv-display";
          etvDisplayEl.innerText = "loading...";
          tileContentEl.insertBefore(etvDisplayEl, detailsButtonEl);

          const recommendationId = encodeURIComponent(inputEl.getAttribute("data-recommendation-id"));
          const asin = inputEl.getAttribute("data-asin");
          let url = `${location.origin}/vine/api/recommendations/${recommendationId}/item/${asin}?imageSize=180`;
          const req = await fetch(url);
          const response = await req.json();
          const data = response.result;

          if (data) {
            const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: data.taxCurrency });
            etvDisplayEl.innerText = `ETV: ${currencyFormatter.format(data.taxValue)}`;
          } else {
            etvDisplayEl.innerText = "Error getting ETV!";
          }

          //Remove focus from the element so keyboard navigation can easily resume
          document.activeElement.blur();
        };

        if (isParent) {
          getEtvLink.title = "Has variations, see the details";
          getEtvLink.classList.remove("a-button-primary");
          getEtvLink.classList.add("a-button-disabled");
          getEtvLink.setAttribute("disabled", "");
        } else {
          getEtvLink.title = "Get ETV";
          getEtvLink.addEventListener("click", etvLinkClickFn);
        }

        tileContentEl.append(getEtvLink);
      }

      //Add a link to fix the infinite load issue
      if (userPreferences.addUiButtonFixInfiniteSpinner) {
        const fixLink = document.createElement("button");
        fixLink.setAttribute("type", "button");
        fixLink.className = `VINE-UIE-fix-asin-link a-button a-button-primary ${extraButtonGridClass}`;
        fixLink.innerHTML = `<span class='a-button-inner'><span class='a-button-text'>🔃</span></span>`;
        fixLink.title = "Fix infinite spinner error";
        tileContentEl.append(fixLink);

        fixLink.addEventListener("click", (ev) => {
          ev.preventDefault();
          const newASIN = prompt("Open the product page, copy the ASIN number, and put it here...");
          if (newASIN !== "") {
            inputEl.setAttribute("data-is-parent-asin", "false");
            inputEl.setAttribute("data-asin", newASIN);
            inputEl.focus();
          }
        });
      }
    }

    //=========================================================================
    //=========================================================================
    //Settings Dialog
    const showSettingsBtnEl = document.createElement("button");
    showSettingsBtnEl.type = "button";
    showSettingsBtnEl.title = "Vine UI Enhancer Settings";
    showSettingsBtnEl.className = "VINE-UIE-open-settings-btn a-button";
    showSettingsBtnEl.innerHTML = `<div class='a-button-text'>⚙️</div>`;
    btnAndSearchEl.appendChild(showSettingsBtnEl);
    showSettingsBtnEl.addEventListener("click", (ev) => {
      ev.preventDefault();
      settingsDialogEl.showModal();
      renderList();
    });

    function createSettingsCheckbox(preferenceKey, labelText, isDisabled, disableReason) {
      const isChecked = isDisabled ? false : userPreferences[preferenceKey] ;
      return `
      <label${isDisabled ? ' style="color:#888;"': ''}>
        <input type="checkbox" data-pref="${preferenceKey}"${isChecked ? " checked" : ""}${isDisabled ? " disabled" : ""}>
        ${labelText}${isDisabled ? ` <small>(${disableReason})</small>` : ""}
      </label>`;
    }

    function createSettingsNumberInput(displayPrefKey, valuePrefKey, min, max) {
      const cssClass = userPreferences[displayPrefKey] ? "" : "class='a-hidden'";
      return `<input type="number" id="VINE-UIE-${valuePrefKey}" pattern="\d*" style="margin-left:1.2rem; width:5rem;" ${cssClass} value="${userPreferences[valuePrefKey]}" min="${min}" max="${max}">`;
    }

    let settingsDialogHtml = `
    <h1>Vine UI Enhancer Settings</h1>
    <small>(reload page to see changes)</small>
    <div class="VINE-UIE-settings-dialog-section">
      <h3>Page Options</h3>`;

    //No sticky anything for mobile styles - would take up too much space
    settingsDialogHtml += createSettingsCheckbox("stickyTopBar", "Sticky Top Bar", thorStyles.mobile, "not available with Thor mobile styles");
    settingsDialogHtml += createSettingsCheckbox("stickySidebar", "Sticky Sidebar", thorStyles.mobile, "not available with Thor mobile styles");

    let paginationDisableReason = thorStyles.mobile ? "not available with Thor mobile styles" : "";
    if (thorStyles.paginationOnTop) {
      paginationDisableReason = 'not available with Thor "pagination on top" styles';
    }
    settingsDialogHtml += createSettingsCheckbox("stickyPagination", "Sticky Pagination", thorStyles.mobile || thorStyles.paginationOnTop, paginationDisableReason);

    settingsDialogHtml += createSettingsCheckbox("addUiButtonEtv", 'Add "Get ETV" button to the UI');
    settingsDialogHtml += createSettingsCheckbox("addUiButtonFixInfiniteSpinner", 'Add "fix infinite spinner" button to the UI');

    settingsDialogHtml += createSettingsCheckbox("useCustomItemFontSize", "Use a custom item font size");
    settingsDialogHtml += createSettingsNumberInput("useCustomItemFontSize", "customItemFontSize", 7, 30);

    settingsDialogHtml += createSettingsCheckbox("hideWordMatches", "Hide word list matches instead of dimming");

    const allowCustomItemSize = thorStyles.smallItems || thorStyles.mobile;
    const itemSizeDisableReason = allowCustomItemSize ? "" : 'Only available when using Thor mobile or "small items" styles';
    settingsDialogHtml += createSettingsCheckbox("useCustomItemSize", "Use a custom item display size", !allowCustomItemSize, itemSizeDisableReason);
    if (allowCustomItemSize) {
      settingsDialogHtml += createSettingsNumberInput("useCustomItemSize", "customItemSize", 100, 500);
    }
    settingsDialogHtml += createSettingsCheckbox("hideAmazonHeader", "Hide Amazon Header and Sidebar");
    settingsDialogHtml += createSettingsCheckbox("hideVineHeader", "Hides Vine Header");


    settingsDialogHtml += `
    </div>
    <div class="VINE-UIE-settings-dialog-section">
      <h3>Dim Items Containing these words/phrases</h3>

      <ul id="VINE-UIE-word-list-display"></ul>
      <input type="text" id="VINE-UIE-add-word-list-txt">
      <button type="button" class="a-button a-button-primary" id="VINE-UIE-add-word-list-btn"><div class='a-button-text'>Add Word</div></button>
      <button type="button" class="a-button" id="VINE-UIE-show-top-words-btn"><div class='a-button-text'>Show top words on this page</div></button>
    </div>`;

    const settingsDialogEl = createDialog("VINE-UIE-settings-dialog", settingsDialogHtml);
    const customItemSizeInputEl = $("#VINE-UIE-customItemSize");
    const customItemFontSizeInputEl = $("#VINE-UIE-customItemFontSize");

    if (thorStyles.smallItems || thorStyles.mobile) {
      customItemSizeInputEl.addEventListener("change", () => {
        setItemGridSize(customItemSizeInputEl.value);

        userPreferences.customItemSize = customItemSizeInputEl.value;
        localStorage.setItem(storageKeyUserPreferences, JSON.stringify(userPreferences));
      });
    }

    customItemFontSizeInputEl.addEventListener("change", () => {
      setItemFontSize(customItemFontSizeInputEl.value);

      userPreferences.customItemFontSize = customItemFontSizeInputEl.value;
      localStorage.setItem(storageKeyUserPreferences, JSON.stringify(userPreferences));
    });

    settingsDialogEl.querySelectorAll("input[type=checkbox]").forEach((check) => {
      check.addEventListener("change", () => {
        const pref = check.getAttribute("data-pref");
        const isChecked = check.checked;

        userPreferences[pref] = isChecked;

        localStorage.setItem(storageKeyUserPreferences, JSON.stringify(userPreferences));

        if (pref === "useCustomItemSize" && (thorStyles.smallItems || thorStyles.mobile)) {
          customItemSizeInputEl.classList.toggle("a-hidden", !isChecked);
          if (isChecked) {
            setItemGridSize(customItemSizeInputEl.value);
          } else {
            setItemGridSize(null);
          }
        } else if (pref === "useCustomItemFontSize") {
          customItemFontSizeInputEl.classList.toggle("a-hidden", !isChecked);
          if (isChecked) {
            setItemFontSize(customItemFontSizeInputEl.value);
          } else {
            setItemFontSize(null);
          }
        }
      });
    });

    const ulWordListEl = settingsDialogEl.querySelector("#VINE-UIE-word-list-display");
    const txtWordListEl = settingsDialogEl.querySelector("#VINE-UIE-add-word-list-txt");

    settingsDialogEl.querySelector("#VINE-UIE-add-word-list-btn").addEventListener("click", addWordFromUI);
    txtWordListEl.addEventListener("keyup", (ev) => {
      if (ev.key === "Enter") addWordFromUI();
    });

    function renderList() {
      let wordListHtml = wordList
        .map(
          (w) =>
            `<li>
          <button type="button" class="a-button" title="Remove '${w}'" data-word="${w}">
            <div class='a-button-text'>X</div>
          </button>
          ${w}
        </li>`
        )
        .join("\n")
        .trim();
      if (wordListHtml === "") {
        wordListHtml = `<li>
        (empty!)
        <button type="button" class="a-button a-button-primary" data-default-list="true">
          <div class='a-button-text'>Restore default word list</div>
        </button>
      </li>`;
      }
      ulWordListEl.innerHTML = wordListHtml;
      ulWordListEl.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
          const word = btn.getAttribute("data-word");
          const shouldAddDefaultList = !!btn.getAttribute("data-default-list");
          if (word) {
            removeWordFromList(word);
          } else if (shouldAddDefaultList) {
            addDefaultWordList();
          }
        });
      });
    }

    function addWordFromUI() {
      const word = txtWordListEl.value.trim().toLowerCase();
      if (word.length > 0 && !wordList.includes(word)) {
        wordList.unshift(word);
        localStorage.setItem(storageKeyWordList, JSON.stringify(wordList));
        renderList();
        txtWordListEl.value = "";
      }
    }

    function removeWordFromList(word) {
      const idx = wordList.indexOf(word);
      wordList.splice(idx, 1);
      renderList();
      localStorage.setItem(storageKeyWordList, JSON.stringify(wordList));
    }

    function addDefaultWordList() {
      const defaultList = [
        //Hair stuff
        "wig",
        "hair extension",
        "dreadlock extension",
        "ponytail extension",
        "crochet hair",
        "baby hair",
        "braiding hair",
        "eyelash extension",
        "false eyelash",

        //Printer ink/toner
        "ink cartridge",
        "ink refill",
        "toner",

        //Cakes & party decorations
        "cake topper",
        "cupcake wrapper",
        "cake decoration",
        "party decoration",

        //Misc.
        "castor oil",
        "pulling oil",
        "shower pan liner",
        "anti-colic bottle",
        "tub spout",
      ];

      defaultList.reverse().forEach((w) => wordList.unshift(w));

      //Save list and render the HTML once
      localStorage.setItem(storageKeyWordList, JSON.stringify(wordList));
      renderList();
    }

    //Show the top most common words
    settingsDialogEl.querySelector("#VINE-UIE-show-top-words-btn").addEventListener("click", (ev) => {
      ev.preventDefault();
      const ignoreWords = ["the", "and", "for", "with", "to", "of", "in", "-", "&"];
      const allWords = [...$$(".a-truncate-full")]
        //Split anything with space, commas, dashes, semicolons, parenthesis into any array
        .flatMap((el) => el.innerText.toLowerCase().split(/[,;\s-\(\)]/g))
        //remove anything from the ignore list, anything that is just a number, or anything 1 character long
        .filter((w) => !ignoreWords.includes(w) && w.length > 1 && !/^\d+(\.\d+)?$/.test(w));

      const wordMap = {};
      allWords.forEach((i) => (wordMap[i] = (wordMap[i] || 0) + 1));
      const topWords = Object.keys(wordMap)
        .map((k) => ({ word: k, count: wordMap[k] }))
        .sort((a, b) => a.count - b.count) //sort by count
        .reverse() //largest numbers at the top
        .slice(0, 10);

      let displayString = "";
      topWords.forEach((x) => {
        displayString += `[${x.count}] - ${x.word}\n`;
      });

      alert(displayString);
    });

    //=========================================================================
    //Sticky top bar with search ==============================================

    //Steal the margin value and use it as padding instead for the header so we can have a colored BG
    const btnAndSearchStyles = getComputedStyle(btnAndSearchEl);
    if (!thorStyles.mobile && userPreferences.stickyTopBar) {
      btnAndSearchEl.style.padding = btnAndSearchStyles.margin;
      btnAndSearchEl.style.margin = "0 !important";
    }

    //=========================================================================
    //Sticky side bar with categories =========================================
    const elCategories = $("#vvp-browse-nodes-container");

    //Set the sticky top position of the categories to the height of the top bar
    //unless the categories are taller than the screen
    if (!thorStyles.mobile && userPreferences.stickySidebar && elCategories.offsetHeight + btnAndSearchEl.offsetHeight <= document.documentElement.clientHeight) {
      elCategories.style.top = `${btnAndSearchEl.offsetHeight}px`;
    }

    //=========================================================================
    //Loop over each product tile and run functions for each one
    $$("#vvp-items-grid > .vvp-item-tile").forEach((itemElement) => {
      dimTileWithDescriptionWordInList(itemElement);
      if (userPreferences.addUiButtonEtv || userPreferences.addUiButtonFixInfiniteSpinner) {
        addTileLinks(itemElement);
      }
    });
  }
})();
