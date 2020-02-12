// ==UserScript==
// @name         Session in normal view
// @namespace    https://github.com/MarcinCzajka
// @version      0.8.4
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
    let configButtons = null;

    const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');
        btnGroup.role = 'group';
        btnGroup.id = 'btnGroup';
        btnGroup.style = 'position:absolute;right:250px; box-shadow: 3px 3px 12px 0 rgba(0, 0, 0, 0.5)';

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

    function handleClick({clientX, clientY}) {
        if(!document.getElementById(iframeId)) {
            createIframe(clientX, clientY);
        } else {
            changeIframeVisibility();
        }
    }

    function createIframe(posX, posY) {

        const iframeHeight = document.querySelectorAll('[placeholder="IMEI urządzenia"]')[0].value > 999999999 ? '580px' : '400px';
        const iframeWidth = '1000px';
        const iframe = `
            <div id='iframeContainer' style='z-index: 1035; display: block; position: absolute;width: ${iframeWidth};height: ${iframeHeight};  left: ${posX - 1000}px; top: ${posY + 20}px'>
                <div 
                    id='topPanel' 
                    style='width: 100%; height: 25px; background-color: green; opacity: 0.9;
                    position:relative; z-index: 1001;cursor: grab; border-radius: 7px 7px 0 0;'
                >
                    <button
                        id='iframeClose'
                        style='color: aliceblue; opacity: 1; padding-right: 5px; padding-left: 5px; height:100%; width: 25px;
                               border-radius: 7px 7px 0 10px; background-color: #E54132;'
                        type="button" class="close" aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <iframe
                    id=${iframeId}
                    src="${window.location.href.replace('record', 'session')}"
                    style="display: block; position: relative; width:100%; height:100%; z-index: 1034; background-color: white; border: 0;
                        box-shadow: rgba(0, 0, 0, 0.5) -1px -1px 12px 0px, rgba(0, 0, 0, 0.4) 8px 8px 12px 0px; border-radius: 0 0 7px 7px; opacity: 0.95"
                >
                </iframe>
            </div>
        `;

        document.querySelectorAll('body')[0].insertAdjacentHTML('beforebegin', iframe);

        document.getElementById('iframeClose').addEventListener('mousedown', changeIframeVisibility);

        document.getElementById(iframeId).addEventListener('load', () => {
            win = document.getElementById(iframeId).contentWindow;

            win.setTimeout(() => {
                win.document.getElementsByClassName('breadcrumb')[0].style.display = 'none';
                win.document.getElementsByClassName('navbar')[0].style.display = 'none';
                win.document.getElementsByClassName('content')[0].style.padding = '0';
                win.document.getElementById('session-window').style.height = '300px';

                openDialogWindow();
            }, 250)
        });

        document.getElementById('topPanel').addEventListener('mousedown', startToMoveWindow);
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
                configButtons = win.document.getElementById('customDiv')
                if(configButtons) win.document.querySelectorAll('body')[0].appendChild(configButtons);

                win.document.querySelectorAll('body')[0].removeChild(win.document.getElementById('tempContainer'));
                win.setTimeout(openDialogWindow, 50);

                win.setTimeout(() => {
                    win.document.getElementById('b-toaster-top-center').style = 'display: none';
                }, 100);
            };

            container.appendChild(textarea);
            container.appendChild(sendBtn);

            win.document.querySelectorAll('body')[0].removeChild(win.document.getElementById('modal1___BV_modal_outer_'));
            win.document.querySelectorAll('body')[0].appendChild(container);

            if(configButtons) win.document.getElementById('tempContainer').appendChild(configButtons);
        }, 50)
    }

    function startToMoveWindow(e) {
        e.preventDefault();

        document.addEventListener('mousemove', moveWindow);

        document.getElementById(iframeId).style.pointerEvents = 'none';

        const initialOffsetX = e.offsetX;
        const initialOffsetY = e.offsetY;

        document.addEventListener('mouseup', function onMouseUp(){
            document.removeEventListener('mousemove', moveWindow);
            document.removeEventListener('mouseup', onMouseUp);

            document.getElementById(iframeId).style.pointerEvents = 'auto';
        });

        function moveWindow(e) {
            e.stopPropagation();
            e.preventDefault();

            document.getElementById('iframeContainer').style.top = (e.clientY - initialOffsetY) + 'px';
            document.getElementById('iframeContainer').style.left = (e.clientX - initialOffsetX) + 'px';
        }

    }


    function changeIframeVisibility() {
        if(document.getElementById('iframeContainer').style.display === 'block') {
            document.getElementById('iframeContainer').style.display = 'none';
        } else {
            document.getElementById('iframeContainer').style.display = 'block';
        }
    }

    function reloadIframe() {
        document.getElementById(iframeId).contentWindow.location.reload(true)
    }

})();