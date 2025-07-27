// ==UserScript==
// @name         Flophouse Recommends Scraper
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.0.1
// @description  Grab the Flophouse movie recommendations data as a simple list
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/flophouse-recommends-scraper.user.js
// @match        https://flophouserecommends.com/episodes/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=flophouserecommends.com
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    function scrape() {
        var hostRecEls = document.querySelectorAll("#main > .flex > div");

        let output = "";
        hostRecEls.forEach((host) => {
            const hostName = host.querySelector("h3").textContent;
            output += `--------------------\n${hostName}\n--------------------\n`;
            host.querySelectorAll(":scope > div").forEach((rec) => {
                const recName = rec.querySelector("h4").textContent;
                const recLinks = [...rec.querySelectorAll("ul li a")].map((l) => l.href);
                output += `${recName}\r${recLinks.join("\n")}\n\n`;
            });
        });

        const textAreaEl = document.createElement("textarea");
        textAreaEl.value = output.trim();
        textAreaEl.setAttribute("id", 'scraper-content');
        textAreaEl.setAttribute("readonly", true);
        textAreaEl.setAttribute("style", "position:fixed; top:0; right:0; width: 500px; height:100vh; padding:10px; box-shadow:0 0 10px rgb(0 0 0 / .5)");
        document.body.appendChild(textAreaEl);

        const closeButtonEl = document.createElement("button");
        closeButtonEl.innerText = "Close"
        closeButtonEl.setAttribute("style", "position:fixed; top:0; right:500px; color:white; border-top-right-radius:0; border-bottom-right-radius:0;");
        closeButtonEl.setAttribute('class', 'bg-orange-800 rounded-lg p-2')
        closeButtonEl.onclick=()=>{
            textAreaEl.remove();
            closeButtonEl.remove()
        };
        document.body.appendChild(closeButtonEl);
    }

    const scrapeButtonEl = document.createElement("button");
    scrapeButtonEl.innerText = "Scrape!"
    scrapeButtonEl.setAttribute("style", "position:fixed; top:.5rem; right:.5rem;");
    scrapeButtonEl.setAttribute('class', 'bg-gray-200 rounded-lg p-2')
    scrapeButtonEl.onclick=scrape;
    document.body.appendChild(scrapeButtonEl);
})();
