// ==UserScript==
// @name         Session in normal view
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Displays session window in regular panel
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/fastConfigTelto.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/fastConfigTelto.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    const iframeId = 'myNewIframe';

    const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.classList.add('btn');
        newBtn.classList.add('btn-primary');
        newBtn.classList.add('btn-sm');
        newBtn.innerHTML = 'Mała sesja';


    setTimeout(() => {
        document.getElementsByClassName('col-sm-5')[0].children[0].append(newBtn);

    }, 1000);

    function createIframe() {
        const iframe = `
            <iframe
                id=${iframeId}
                src="https://gps.framelogic.pl/session/${window.location.href.slice(window.location.href.indexOf('record/') + 7)}"
                style="position: absolute;width: 1000px;height: 400px;right: 300px;z-index: 1001;">
            </iframe>
        `

        document.getElementById(iframeId).addEventListener('load', () => {
            const win = document.getElementById(iframeId).contentWindow;
        
            win.setTimeout(() => {
                win.document.getElementsByClassName('breadcrumb')[0].style.display = 'none';
                win.document.getElementsByClassName('navbar')[0].style.display = 'none';
                win.document.getElementsByClassName('content')[0].style.padding = '0';
            }, 250)  
        })
    }


    function reloadIframe() {
        document.getElementById(iframeId).contentWindow.location.reload(true)
    }
    
})();