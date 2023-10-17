// ==UserScript==
// @name         Auto-Fill Lever.co Information
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1
// @description  Auto-Fill EEO Information on Lever.co  job applications
// @author       Chris Barr
// @homepageURL  https://github.com/FiniteLooper/UserScripts
// @updateURL    https://github.com/FiniteLooper/UserScripts/raw/main/src/autofill-lever-information.user.js
// @match        https://jobs.lever.co/*/*/apply
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lever.co
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  //----------------------------------------------------------------------------
  //Your data - change this as needed so that it matches exactly with the text in the dropdown
  const eeoData = {
    gender: "Male",
    race: "White (Not Hispanic or Latino)",
    veteran: "I am not a veteran",
  };

  //----------------------------------------------------------------------------
  //The actual auto-filling
  function autoFill() {
    document.querySelectorAll("#eeoSurvey .application-question").forEach(($q) => {
      const $select = $q.querySelector("select");
      const eeoType = $select.getAttribute("name").replace("eeo[", "").replace("]", "");
      $select.value = eeoData[eeoType];
    });
  }

  //----------------------------------------------------------------------------
  //Add a button to the UI
  const headerStyles = getComputedStyle(document.querySelector(".main-header"));

  const $btn = document.createElement("button");
  $btn.type = "button";
  $btn.innerText = "Auto-Fill EEO";
  $btn.className = document.querySelector("#btn-submit").className.replace("postings-btn", "");
  $btn.addEventListener("click", autoFill);

  const $btnContainer = document.createElement("div");
  $btnContainer.style.position = "fixed";
  $btnContainer.style.right = "0";
  $btnContainer.style.top = headerStyles.height;
  $btnContainer.style.backgroundColor = headerStyles.backgroundColor;
  $btnContainer.style.padding = "1rem";
  $btnContainer.style.zIndex = "100";

  $btnContainer.appendChild($btn);
  document.body.appendChild($btnContainer);
})();
