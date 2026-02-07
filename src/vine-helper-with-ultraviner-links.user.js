// ==UserScript==
// @name         Vine Helper with UltraViner Links
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.0.4
// @description  Adds UltraViner links to items in the Vine Helper notification monitor, RFY, AFA, and AI pages
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/vine-helper-with-ultraviner-links.user.js
// @match        https://*.amazon.com/vine/vine-items*
// @match        https://*.amazon.ca/vine/vine-items*
// @match        https://*.amazon.co.uk/vine/vine-items*
// @match        https://*.amazon.de/vine/vine-items*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// @require https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@v1.3/waitForKeyElements.js
// ==/UserScript==

(function() {
    'use strict';

    const currentPageQueue = new URLSearchParams(location.search).get('queue')

    function addUvLink(el){
        el.setAttribute('data-uv-added', 'true')
        const queue = el.getAttribute('data-queue') ?? currentPageQueue;
        const asin = el.getAttribute('data-asin');
        const uvUrl = `${location.origin}${location.pathname}?queue=${queue}&asin=${asin}`;
        const btnContainer = el.querySelector('.vh-btn-container');
        btnContainer.innerHTML +=`<span class="a-button a-button-primary" style="width:40%;"><span class="a-button-inner"><a href="${uvUrl}" target="_blank" class="a-button-text">🦙UV</a></span></span>`
    }

    if(location.hash === '#monitor'){
        setInterval(()=>{
            document.querySelectorAll('#vvp-items-grid > .vh-gridview:not([data-uv-added])').forEach((el)=>{
                addUvLink(el)
            });
        }, 1000);
    } else {
        waitForKeyElements("body.vh-listing-view", (element) => {
            document.querySelectorAll('#vvp-items-grid > .vh-gridview').forEach((el)=>{
                addUvLink(el)
            });
        });
    }
})();
