// ==UserScript==
// @name         Flophouse Recommends Scraper
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.0.3
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

  function getEpisodeData() {
    const hostRecEls = document.querySelectorAll("#main > .flex > div");
    const episodeTitleText = document.querySelector("#main > h2").textContent;
    const episodeTitleParts = /Episode (\d+):(.+)/.exec(episodeTitleText);

    const episodeObj = {
      number: episodeTitleParts[1] ?? "???",
      movie: (episodeTitleParts[2] ?? "???").trim(),
      hosts: [],
    };

    hostRecEls.forEach((host) => {
      const hostObj = {
        name: host.querySelector("h3").textContent,
        recommendations: [],
      };

      host.querySelectorAll(":scope > div").forEach((rec) => {
        const recLinks = [...rec.querySelectorAll("ul li a")].map((l) => l.href);
        hostObj.recommendations.push({
          movie: rec.querySelector("h4").textContent,
          imdb: recLinks.find((l) => l.includes("imdb.com")),
          letterboxd: recLinks.find((l) => l.includes("letterboxd.com")),
        });
      });
      episodeObj.hosts.push(hostObj);
    });

    return episodeObj;
  }

  function showTextarea(isText) {
    const episodeObj = getEpisodeData();
    const textAreaEl = document.createElement("textarea");
    if (isText) {
      textAreaEl.value = episodeObj.hosts
        .map((host) => {
          const recLinks = host.recommendations
            .map(
              (rec) => `${rec.movie}
${rec.imdb}
${rec.letterboxd}`
            )
            .join("\n\n");

          return `--------------------
${host.name}
--------------------
${recLinks}`;
        })
        .join("\n\n");
    } else {
      textAreaEl.value = JSON.stringify(episodeObj, null, 2);
    }
    textAreaEl.setAttribute("id", "scraper-content");
    textAreaEl.setAttribute("readonly", true);
    textAreaEl.setAttribute("style", "position:fixed; top:0; right:0; width: 500px; height:100vh; padding:10px; box-shadow:0 0 10px rgb(0 0 0 / .5)");
    document.body.appendChild(textAreaEl);

    const closeButtonEl = document.createElement("button");
    closeButtonEl.innerText = "Close";
    closeButtonEl.setAttribute("style", "position:fixed; top:0; right:500px; color:white; border-top-right-radius:0; border-bottom-right-radius:0;");
    closeButtonEl.setAttribute("class", "bg-orange-800 rounded-lg p-2");
    closeButtonEl.onclick = () => {
      textAreaEl.remove();
      closeButtonEl.remove();
    };
    document.body.appendChild(closeButtonEl);
  }

  if (/\d$/.test(location.pathname)) {
    const scrapeAdTextButtonEl = document.createElement("button");
    scrapeAdTextButtonEl.innerText = "Scrape as Text";
    scrapeAdTextButtonEl.setAttribute("style", "position:fixed; top:.5rem; right:.5rem;");
    scrapeAdTextButtonEl.setAttribute("class", "bg-gray-200 rounded-lg p-2");
    scrapeAdTextButtonEl.onclick = () => showTextarea(true);
    document.body.appendChild(scrapeAdTextButtonEl);

    const scrapeAsJsonButtonEl = document.createElement("button");
    scrapeAsJsonButtonEl.innerText = "Scrape as JSON";
    scrapeAsJsonButtonEl.setAttribute("style", "position:fixed; top:3.5rem; right:.5rem;");
    scrapeAsJsonButtonEl.setAttribute("class", "bg-gray-200 rounded-lg p-2");
    scrapeAsJsonButtonEl.onclick = () => showTextarea(false);
    document.body.appendChild(scrapeAsJsonButtonEl);
  }
})();
