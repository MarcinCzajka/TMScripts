// ==UserScript==
// @name         MapResizer
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Add simultaneous vertical and horizontal resize
// @author       MAC
// @match        */api/map/leaflet/index*
// @grant        none
// @include      */api/map/leaflet/index*
// ==/UserScript==

(function() {
    'use strict';

    const size = 10;

    const topLeft = {topLeft: `right:0;bottom:0;cursor:se-resize;`};
    const topRight = {topRight: `left:0;bottom:0;cursor:sw-resize;`};

    const dot = (position) => `<div
id=${Object.keys(position)[0]}
class='dragDot'
style='
z-index: 5;
background-color: gray;
opacity: 0.4;
width: ${size}px;
height: ${size}px;
border-radius: ${size / 2}px;
position: absolute;
${position[Object.keys(position)[0]]}
'
draggable='true'
></div>`;


    window.setTimeout(() => {

        for(const item of document.getElementsByClassName('window-resizable-bar')) {
            if(item.classList.contains('top') || item.classList.contains('bottom')){
                item.style.width = `calc(100% - ${size}px)`;
            } else {
                item.style.height = `calc(100% - ${size}px)`;
            }
        }


        const topLeftWindow = document.getElementsByClassName('window top left')[0];
        const topRightWindow = document.getElementsByClassName('window top right')[0];

        topLeftWindow.insertAdjacentHTML('afterbegin', dot(topLeft));
        document.getElementById('topLeft').addEventListener('mousedown', function(e){drag(e)});

        topRightWindow.insertAdjacentHTML('afterbegin', dot(topRight));
        document.getElementById('topRight').addEventListener('mousedown', function(e){drag(e)});


    }, 500);

    function drag({ target }) {

        const windows = JSON.parse(window.localStorage['map.vehiclesLocation.windowsLocation']);
        const windowName = target.id;

        window.addEventListener('mousemove', resize);

        window.addEventListener('mouseup', function onMouseUp() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', onMouseUp);
        });

        function resize({clientX, clientY}) {
            if(clientX === 0) return

            const offsetX = ( windowName.indexOf('Left') !== -1 ? clientX : window.innerWidth - clientX );
            const offsetY = ( windowName.indexOf('top') !== -1 ? clientY : window.innerHeight - clientY );

            window.localStorage[`map.vehiclesLocation.${windows[windowName]}.width`] = offsetX;
            window.localStorage[`map.vehiclesLocation.${windows[windowName]}.height`] = offsetY;
            target.parentElement.style.width = offsetX + 'px';
            target.parentElement.style.height = offsetY + 'px';

            $('.vehicle-list-table').trigger('reflow');
        };

    };

})();