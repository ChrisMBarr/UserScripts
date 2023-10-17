// ==UserScript==
// @name         Auto-Fill Lever.co Information
// @namespace    https://github.com/FiniteLooper/UserScripts
// @version      0.1
// @description  Auto-Fill Some Information on Lever.co  job applications
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
  const info = {
    pronouns: ["He/him"],
    gender: "Male",
    race: "White (Not Hispanic or Latino)",
    veteran: ["I am not a veteran", "I am not a Protected Veteran"],
    disability: "No, I do not have a disability and have not had one in the past",
    disabilitySignature: "Chris Barr",
    disabilitySignatureDate: new Date().toLocaleDateString(),
  };

  //----------------------------------------------------------------------------
  //The actual auto-filling
  const $eeoQuestions = document.querySelectorAll("#eeoSurvey .application-question");
  const $pronouns = document.querySelectorAll("#candidatePronounsCheckboxes input");
  function autoFill() {
    if ($eeoQuestions.length) {
      $eeoQuestions.forEach(($q) => {
        const $select = $q.querySelector("select");
        if ($select) {
          const userValues = info[getInfoName($select)];
          if (typeof userValues === "string") {
            $select.value = userValues;
          } else {
            //try all values until one gets set that matches
            userValues.forEach((v) => {
              if ($select.value === "") {
                $select.value = v;
              }
            });
          }
        } else {
          const $inputs = $q.querySelectorAll("input");
          const infoName = getInfoName($inputs[0]);
          if ($inputs.length === 1) {
            //assume text input
            $inputs[0].value = info[infoName];
          } else {
            //Assume radio buttons
            selectRadioOrCheck($inputs, info[infoName]);
          }
        }
      });
    }

    if ($pronouns.length) {
      info.pronouns.forEach((pro) => {
        selectRadioOrCheck($pronouns, pro);
      });
    }
  }

  function selectRadioOrCheck($inputs, valueToFind) {
    const $foundInput = [...$inputs].find((x) => x.value === valueToFind);
    if ($foundInput) {
      $foundInput.checked = true;
    }
  }

  function getInfoName($el) {
    return $el.getAttribute("name").replace("eeo[", "").replace("]", "");
  }

  //----------------------------------------------------------------------------
  //Add a button to the UI
  if ($eeoQuestions.length || $pronouns.length) {
    const headerStyles = getComputedStyle(document.querySelector(".main-header"));

    const $btn = document.createElement("button");
    $btn.type = "button";
    $btn.innerText = "Auto-Fill Info";
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
  }
})();
