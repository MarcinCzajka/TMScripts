// ==UserScript==
// @name         Session in normal view
// @namespace    https://github.com/MarcinCzajka
// @version      0.13.20
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

    const iframeId = 'myNewIframe';
    let topBar = null;
    let win = null;
    let tabStrip = null;
    let container = null;

    const fadeTime = '0.225';
    const containerOpacity = '0.95';

    const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');
        btnGroup.role = 'group';
        btnGroup.id = 'btnGroup';
        btnGroup.style = 'margin-left: 15px; border-radius: 5px; box-shadow: 2px 2px 12px -1px rgba(0, 0, 0, 0.5)';

    const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.classList.add('btn', 'btn-primary', 'btn-sm');
        newBtn.innerHTML = 'Mała sesja';
        newBtn.disabled = true;
        newBtn.onclick = handleClick;

    const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
        resetBtn.innerHTML = 'reload';
        resetBtn.disabled = true;
        resetBtn.onclick = reloadIframe;

    setTimeout(() => {
        (function listenForValueChange() {
            if(document.querySelector('[placeholder="IMEI urządzenia"]').value !== '') {
                    newBtn.disabled = false;
                    resetBtn.disabled = false;
                return
            }

            setTimeout(listenForValueChange, 150)
        })()

        topBar = document.querySelector('ol .row');
        topBar.appendChild(btnGroup);

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

        const iframeHeight = document.querySelector('[placeholder="IMEI urządzenia"]').value > 999999999 ? '600px' : '425px';
        const iframeWidth = '1000px';
        const iframe = `
            <div id='iframeContainer'
                style='visibility: visible; background-image: linear-gradient(transparent 0 25px, #353535 25px 72%, white); border-radius: 7px; z-index: 1035; display: block;
                position: absolute;width: ${iframeWidth};height: ${iframeHeight}; left: calc(50vw - 500px); top: ${posY + 200}px;
                box-shadow: rgba(0, 0, 0, 0.5) -1px -1px 12px 0px, rgba(0, 0, 0, 0.4) 8px 8px 12px 0px; opacity: 0; transition:opacity ${fadeTime}s ease-in-out;'
            >
                <div
                    id='topPanel'
                    style='width: 100%; height: 25px; background-color: green; cursor: grab;
                    position:relative; z-index: 1001; border-radius: 7px 7px 0 0;'
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
                <svg xmlns="http://www.w3.org/2000/svg" id='iframeLoader' viewBox="0 0 340 340" class="loader"
                    style="position:absolute; left: calc(50% - 112px); top: calc(50% - 112px); z-index: 1036; background-color: rgb(53, 53, 53); border-radius: 100%"
                >
                    <circle cx="170" cy="170" r="160" stroke="#DFD"></circle>
                    <circle cx="170" cy="170" r="135" stroke="#E2007C"></circle>
                    <circle cx="170" cy="170" r="110" stroke="#DFD"></circle>
                    <circle cx="170" cy="170" r="85" stroke="#E2007C"></circle>
                </svg>
                <iframe
                    id=${iframeId}
                    src="${window.location.href.replace('record', 'session')}"
                    style="visibility: hidden; display: block; position: relative; width:100%; height:calc(100% - 25px);
                           z-index: 1034; background-color: #353535; border: 0; border-radius: 0 0 7px 7px; opacity: 0.97"
                >
                </iframe>
            </div>
        `;

        document.querySelector('body').insertAdjacentHTML('beforeend', iframe);

        container = document.getElementById('iframeContainer');
        //createResizers();

        document.getElementById('iframeClose').addEventListener('mousedown', (e) => {
            e.stopPropagation();
            changeIframeVisibility();
        });

        document.getElementById(iframeId).addEventListener('load', () => {
            win = document.getElementById(iframeId).contentWindow;

            win.setTimeout(prepareSession, 150)

            function prepareSession() {
                if(!win.document.getElementsByClassName('breadcrumb')[0]) {
                    console.log('No session available yet...  // Session in normal view');
                    win.setTimeout(prepareSession, 150);
                    return
                }

                win.document.getElementsByClassName('breadcrumb')[0].style.display = 'none';
                win.document.getElementsByClassName('navbar')[0].style.display = 'none';
                win.document.getElementsByClassName('content')[0].style.padding = '0';
                win.document.getElementById('session-window').style.height = '300px';


                document.getElementById(iframeId).style.visibility = 'inherit';
                document.getElementById('iframeLoader').style.visibility = 'hidden';

                openDialogWindow();
            }
        });

        document.getElementById('topPanel').addEventListener('mousedown', startToMoveWindow);

        setTimeout(() => { container.style.opacity = containerOpacity}, 0);
    }

    function openDialogWindow() {
        win.document.getElementsByClassName('btn-secondary')[0].click();

        win.setTimeout(() => {
            const container = win.document.createElement('div');
                container.style.position = 'relative';
                container.id = 'tempContainer';

            const textarea = win.document.getElementById('exampleInputPassword1');
                textarea.style.resize = 'none';
                textarea.rows = '4';

            const sendBtn = win.document.getElementById('modal1___BV_modal_footer_').children[1];
                sendBtn.style = 'position:absolute; right: 20px; top: 10px; width: 80px;';
                sendBtn.id = 'tempBtn';
                sendBtn.onclick = () => {
                    tabStrip = win.document.getElementById('tabStrip');
                if(tabStrip) win.document.querySelector('body').appendChild(tabStrip);

                win.document.querySelector('body').removeChild(win.document.getElementById('tempContainer'));
                win.setTimeout(openDialogWindow, 50);

                win.setTimeout(() => {
                    win.document.getElementById('b-toaster-top-center').style = 'display: none';
                }, 100);
            };

            const clearBtn = win.document.createElement('button');
                clearBtn.style = 'position:absolute; right: 20px; top: 50px; width:80px';
                clearBtn.classList.add('btn', 'btn-warning');
                clearBtn.innerText = 'Wyczyść'
                clearBtn.onclick = () => {
                    textarea.value = '';
                    textarea.focus();
                }

            textarea.addEventListener('keypress', (e) => {
                if(e.keyCode === 13) {
                    sendBtn.click();
                }
            })

            container.appendChild(textarea);
            container.appendChild(sendBtn);
            container.appendChild(clearBtn);

            win.document.querySelector('body').removeChild(win.document.getElementById('modal1___BV_modal_outer_'));
            win.document.querySelector('body').appendChild(container);

            if(tabStrip) win.document.getElementById('tempContainer').appendChild(tabStrip);
        }, 50)
    }

    function startToMoveWindow(e) {
        e.preventDefault();

        document.addEventListener('mousemove', moveWindow);

        document.getElementById(iframeId).style.pointerEvents = 'none';

        container.style.opacity = 0.85;

        const initialOffsetX = e.offsetX;
        const initialOffsetY = e.offsetY;

        document.addEventListener('mouseup', function onMouseUp(){
            document.removeEventListener('mousemove', moveWindow);
            document.removeEventListener('mouseup', onMouseUp);

            document.getElementById(iframeId).style.pointerEvents = 'auto';
            container.style.opacity = containerOpacity;
        });

        function moveWindow(e) {
            e.stopPropagation();
            e.preventDefault();

            document.getElementById('iframeContainer').style.top = (e.clientY - initialOffsetY) + 'px';
            document.getElementById('iframeContainer').style.left = (e.clientX - initialOffsetX) + 'px';
        }

    }


    function changeIframeVisibility() {
        if(container.style.visibility === 'visible') {
            container.style.opacity = 0;
            setTimeout(() => {container.style.visibility = 'hidden'}, fadeTime * 1000);
        } else {
            container.style.visibility = 'visible';
            container.style.opacity = containerOpacity;
        }
    }

    function reloadIframe() {
        const iframe = document.getElementById(iframeId);
        if(!iframe) return

        iframe.style.visibility = 'hidden';
        document.getElementById('iframeLoader').style.visibility = 'inherit';
        iframe.contentWindow.location.reload(true);
    }

    function createResizers() {
        const size = 10; //Global size of resizers

        const uniStyle = `position:absolute;z-index:1036;width:${size}px;height:${size}px;background-color:black`

        const bottomLeft = document.createElement('div');
            bottomLeft.style = `${uniStyle};left:0;bottom:0;cursor:ne-resize;`;
            bottomLeft.addEventListener('mousedown', resize);
            bottomLeft.classList.add('left');
        const bottomRight = document.createElement('div');
            bottomRight.style = `${uniStyle};right:0;bottom:0;cursor:nw-resize;`;
            bottomRight.addEventListener('mousedown', resize);

        document.getElementById('iframeContainer').appendChild(bottomLeft);
        document.getElementById('iframeContainer').appendChild(bottomRight);

    }

    function resize(e) {
        e.stopPropagation();
        e.preventDefault();

        document.getElementById(iframeId).style.pointerEvents = 'none';

        document.addEventListener('mousemove', onMouseMove)

        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);

            document.getElementById(iframeId).style.pointerEvents = 'auto';
        })
    }

    function onMouseMove(e) {
        e.stopPropagation();
        e.preventDefault();

        const {clientX, clientY, target} = e;

        const currentWidth = +container.style.width.replace('px', '');

        if(target.classList[0] === 'left') {
            console.log(clientX)
        } else {
            console.log(clientX)
            container.style.width = clientX - (clientX - currentWidth) + 'px';
        }

    }

})();