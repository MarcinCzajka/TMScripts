// ==UserScript==
// @name         Session in normal view
// @namespace    https://github.com/MarcinCzajka
// @version      0.5
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
    let win = null;

    const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');
        btnGroup.role = 'group';
        btnGroup.id = 'btnGroup';
        btnGroup.style = 'position:absolute;right:250px';

    const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.classList.add('btn');
        newBtn.classList.add('btn-primary');
        newBtn.classList.add('btn-sm');
        newBtn.innerHTML = 'Mała sesja';
        newBtn.onclick = handleClick;

    const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.classList.add('btn');
        resetBtn.classList.add('btn-secondary');
        resetBtn.classList.add('btn-sm');
        resetBtn.innerHTML = 'reset';
        resetBtn.onclick = reloadIframe;

    setTimeout(() => {
        topBar = document.getElementsByClassName('col-sm-5')[0].children[0];
        topBar.insertBefore(btnGroup, topBar.firstChild);

        document.getElementById('btnGroup').append(newBtn);
        document.getElementById('btnGroup').append(resetBtn);
    }, 1000);

    function handleClick() {
        if(!document.getElementById(iframeId)) {
            createIframe();
        } else {
            changeIframeVisibility();
        }
    }

    function createIframe() {
        const iframeWidth = '1000px';
        const iframe = `
            <iframe
                id=${iframeId}
                src="https://gps.framelogic.pl/session/${window.location.href.slice(window.location.href.indexOf('record/') + 7)}"
                style="display: block; position: absolute;width: ${iframeWidth};height: 400px;right: 255px; top: 30px; z-index: 1001; background-color: white;">
            </iframe>
        `;

        topBar.insertAdjacentHTML('beforebegin', iframe);

        document.getElementById(iframeId).addEventListener('load', () => {
            win = document.getElementById(iframeId).contentWindow;

            win.setTimeout(() => {
                win.document.getElementsByClassName('breadcrumb')[0].style.display = 'none';
                win.document.getElementsByClassName('navbar')[0].style.display = 'none';
                win.document.getElementsByClassName('content')[0].style.padding = '0';
                win.document.getElementById('session-window').style.height = '300px';

                openDialogWindow();

            }, 250)
        })
    }

    function openDialogWindow() {
        win.document.getElementsByClassName('btn-secondary')[0].click();

        win.setTimeout(() => {
            const container = win.document.createElement('div');
                container.style.position = 'relative';
                container.id = 'tempContainer';

            const textarea = win.document.getElementById('exampleInputPassword1')
                textarea.rows = '4';

            const sendBtn = win.document.getElementById('modal1___BV_modal_footer_').children[1];
                sendBtn.style = 'position:absolute; right: 20px; top: 0';
                sendBtn.id = 'tempBtn';
            sendBtn.onclick = function() {
                win.document.querySelectorAll('body')[0].removeChild(win.document.getElementById('tempContainer'));
                win.setTimeout(openDialogWindow, 0);

                win.setTimeout(() => {win.document.getElementById('b-toaster-top-center').style = 'display: none'}, 0);
            };

            container.appendChild(textarea);
            container.appendChild(sendBtn);

            win.document.querySelectorAll('body')[0].removeChild(win.document.getElementById('modal1___BV_modal_outer_'));
            win.document.querySelectorAll('body')[0].appendChild(container);
        }, 0)
    }

    function changeIframeVisibility() {
        if(document.getElementById(iframeId).style.display === 'block') {
            document.getElementById(iframeId).style.display = 'none';
        } else {
            document.getElementById(iframeId).style.display = 'block';
        }
    }

    function reloadIframe() {
        document.getElementById(iframeId).contentWindow.location.reload(true)
    }

})();