// ==UserScript==
// @name         Session in normal view
// @namespace    https://github.com/MarcinCzajka
// @version      0.2
// @description  Displays session window in regular panel
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/sessionWindow.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/sessionWindow.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    let topBar = null;
    const iframeId = 'myNewIframe';

    let iframeCreated = false;

    const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.classList.add('btn');
        newBtn.classList.add('mr-sm-2');
        newBtn.classList.add('btn-primary');
        newBtn.classList.add('btn-sm');
        newBtn.innerHTML = 'Mała sesja';
        newBtn.style = 'position:absolute;right:250px';
        newBtn.onclick = handleClick;

    setTimeout(() => {
        topBar = document.getElementsByClassName('col-sm-5')[0].children[0];
        topBar.insertBefore(newBtn, topBar.firstChild);
    }, 1000);

    function handleClick() {
        if(!iframeCreated) {
            createIframe();
        } else {

        }
    }

    function createIframe() {
        const iframeWidth = '1000px';
        const iframe = `
            <iframe
                id=${iframeId}
                src="https://gps.framelogic.pl/session/${window.location.href.slice(window.location.href.indexOf('record/') + 7)}"
                style="position: absolute;width: ${iframeWidth};height: 400px;right: 255px; top: 30px; z-index: 1001;">
            </iframe>
        `;

        topBar.insertAdjacentHTML("beforebegin", iframe);

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