// ==UserScript==
// @name         Amazon Vine Order Info
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1.0
// @description  Simple way to show item order data for Amazon Vine - useful for spreadsheets or record keeping
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/raw/main/src/amazon-vine-order-info.user.js
// @match        https://*.amazon.com/vine/orders*
// @match        https://*.amazon.ca/vine/orders*
// @match        https://*.amazon.co.uk/vine/orders*
// @match        https://*.amazon.de/vine/orders*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  document.querySelectorAll(".vvp-orders-table tr.vvp-orders-table--row").forEach((row) => {
    const orderInfoBtn = document.createElement("span");
    orderInfoBtn.className = "a-button a-button-base vvp-orders-table--action-btn";
    orderInfoBtn.innerHTML = `<span class="a-button-inner"><button type="button" class="a-button-text">Show Info</button></span>`;
    row.querySelector(".vvp-orders-table--actions-col").append(orderInfoBtn);
    orderInfoBtn.querySelector("button").addEventListener("click", () => showOrderInfo(row));
  });

  function showOrderInfo(row) {
    const productName = row.querySelector("td:nth-child(2) .a-truncate-full").innerText.trim();
    const orderDate = row.querySelector("td:nth-child(3)").innerText.trim();
    const etv = row.querySelector("td:nth-child(4)").innerText.trim();
    const asin = row.querySelector("td:nth-child(2) a").href.match(/[A-Z0-9]+$/i)[0];
    const id = row.querySelector("td:nth-child(5) a").href.match(/[-0-9]+$/)[0];

    //Alerts aren't monospaced, so the spacing here makes it all line up when rendered
    alert(`${productName}

ID:            ${id}
ASIN:       ${asin}
Ordered: ${orderDate}
ETV:          ${etv}`);
  }
})();
