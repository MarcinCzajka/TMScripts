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

    const size = 10; //Global size of resizers

    const topLeft = {topLeft: `right:0;bottom:0;cursor:se-resize;`};
    const topRight = {topRight: `left:0;bottom:0;cursor:sw-resize;`};
    const bottomLeft = {bottomLeft: `right:0;top:0;cursor:ne-resize;`};
    const bottomRight = {bottomRight: `left:0;top:0;cursor:nw-resize;`};

    const dot = (position) => `
        <div
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


        let topLeftWindow;
        let topRightWindow;
        let bottomLeftWindow;
        let bottomRightWindow;

        if(topLeftWindow = document.getElementsByClassName('window top left')[0]) {
            topLeftWindow.insertAdjacentHTML('afterbegin', dot(topLeft));
            document.getElementById('topLeft').addEventListener('mousedown', function(e){drag(e)});
        }

        if(topRightWindow = document.getElementsByClassName('window top right')[0]) {
            topRightWindow.insertAdjacentHTML('afterbegin', dot(topRight));
            document.getElementById('topRight').addEventListener('mousedown', function(e){drag(e)});
        }

        if(bottomLeftWindow = document.getElementsByClassName('window bottom left')[0]) {
            bottomLeftWindow.insertAdjacentHTML('afterbegin', dot(bottomLeft));
            document.getElementById('bottomLeft').addEventListener('mousedown', function(e){drag(e)});
        }

        if(bottomRightWindow = document.getElementsByClassName('window bottom right')[0]) {
            bottomRightWindow.insertAdjacentHTML('afterbegin', dot(bottomRight));
            document.getElementById('bottomRight').addEventListener('mousedown', function(e){drag(e)});
        }

        $('.window-resizable-bar').remove();

        $('.window').css('max-width', '');
        $('.window').css('max-height', '');

    }, 500);

    function drag({ target }) {

        const windows = JSON.parse(window.localStorage['map.vehiclesLocation.windowsLocation']);
        const windowName = target.id;
        const sizeOffset = size / 2;

        const isLeft = windowName.indexOf('Left') !== -1;
        const isTop = windowName.indexOf('top') !== -1;

        const thisHorizontalLocation = isLeft ? 'left' : 'right';
        const thisVerticalLocation = isTop ? 'top' : 'bottom';
        const oppositeHorizontally = isLeft ? 'right' : 'left';
        const oppositeVertically = isTop ? 'bottom' : 'top';

        const oppositeWidth = window.innerWidth - $(`.${thisVerticalLocation}.${oppositeHorizontally}`).width();
        const oppositeHeight = window.innerHeight - $(`.${thisHorizontalLocation}.${oppositeVertically}`).height() - 20;

        const diagonal = $(`.${oppositeVertically}.${oppositeHorizontally}`);
        const diagonalWidth = window.innerWidth - diagonal.width();
        const diagonalHeight = window.innerHeight - diagonal.height() - 20;

        window.addEventListener('mousemove', resize);

        window.addEventListener('mouseup', function onMouseUp() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', onMouseUp);

            const width = $(`.${thisHorizontalLocation}.${thisVerticalLocation}`).width();
            const height = $(`.${thisHorizontalLocation}.${thisVerticalLocation}`).height();

            $(`.${thisHorizontalLocation}.${thisVerticalLocation}`).css('width', width + 'px');
            $(`.${thisHorizontalLocation}.${thisVerticalLocation}`).css('height', height + 'px');

            window.localStorage[`map.vehiclesLocation.${windows[windowName]}.width`] = width;
            window.localStorage[`map.vehiclesLocation.${windows[windowName]}.height`] = height;

            $('.vehicle-list-table').trigger('reflow');

        });

        function resize(e) {
            e.stopPropagation();
            e.preventDefault();

            const {clientX, clientY} = e;

            if(clientX === 0) return



            const offsetX = ( isLeft ? clientX : window.innerWidth - clientX ) + sizeOffset;
            const offsetY = ( isTop ? clientY: window.innerHeight - clientY ) - sizeOffset;

            if(( offsetX < oppositeWidth && offsetY < oppositeHeight) && (offsetX < diagonalWidth || offsetY < diagonalHeight)) {
                target.parentElement.style.width = offsetX + 'px';
                target.parentElement.style.height = offsetY + 'px';
            };

        };

    };

})();