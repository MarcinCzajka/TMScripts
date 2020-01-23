// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Zaznacz kolorami komórkę w tabeli według określonych kryteriów
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @match        http://*/api/installation*
// @grant        none
// @include *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    const headers = [];

    setTimeout(() => {
        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        loopThroughColumn("Szerokość", pozycja);
        loopThroughColumn("Satelity", satelity);
        loopThroughColumn("Nap. aku.", napAku);

    }, 5000);

    function loopThroughColumn(columnName, callback) {
        const index = headers.indexOf(columnName);

        for(let row of document.getElementsByTagName('tbody')[0].children) {
            callback(row.children[index]);
        };
    }

})();



function pozycja(el) {
    if(+el.innerText === 0) markError(el);
}

function satelity(el) {
    if(+el.innerText < 4) markError(el);
}

function napAku(el) {
    if(+el.innerText < 10) markError(el);
}

function markError(el) {
    el.style.backgroundColor = '#ff697d';
}