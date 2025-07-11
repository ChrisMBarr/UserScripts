// ==UserScript==
// @name         Vine Helper with UltraViner Links
// @namespace    https://github.com/ChrisMBarr/UserScripts
// @version      0.0.2
// @description  Adds Ultraviner links to items in the Vine Helper notifcation monitor
// @author       Chris Barr
// @homepageURL  https://github.com/ChrisMBarr/UserScripts
// @updateURL    https://github.com/ChrisMBarr/UserScripts/raw/main/src/vine-helper-with-ultraviner-links.user.js
// @match        https://*.amazon.com/vine/vine-items?queue=encore
// @match        https://*.amazon.ca/vine/vine-items?queue=encore
// @match        https://*.amazon.co.uk/vine/vine-items?queue=encore
// @match        https://*.amazon.de/vine/vine-items?queue=encore
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  if(location.hash === '#monitorLoadAllListeners'){
    function addUvLink(el){
      el.setAttribute('data-uv-added', 'true')
      const queue = el.getAttribute('data-queue');
      const asin = el.getAttribute('data-asin');
      const uvUrl = `${location.origin}${location.pathname}?queue=${queue}&asin=${asin}`;
      const btnContainer = el.querySelector('.vh-btn-container');
      btnContainer.innerHTML +=`<span class="a-button a-button-primary" style="width:40%;"><span class="a-button-inner"><a href="${uvUrl}" target="_blank" class="a-button-text">🦙UV</a></span></span>`
    }

    setInterval(()=>{
      document.querySelectorAll('#vvp-items-grid > .vh-gridview:not([data-uv-added])').forEach((el)=>{
        addUvLink(el)
      });
    }, 1000);
  }
})();
