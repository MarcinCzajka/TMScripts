// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.2
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
        for(let button of document.getElementsByClassName('btn')) {
            if(button.innerText === "Filtruj" || button.innerText === "Resetuj") {
                button.addEventListener('click', () => {setTimeout(() => {checkData()}, 5000)});
            }
        }

        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        checkData();

    }, 5000);

    function checkData() {
		loopThroughColumn("Szerokość", pozycja);
		loopThroughColumn("Długość", pozycja);
        loopThroughColumn("Satelity", satelity);
        loopThroughColumn("Stacyjka", stacyjka);
        loopThroughColumn("Nap. aku.", napAku);
    }

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

function stacyjka(el) {
    if(el.innerText === 'Wył.') {
        const voltage = +el.nextElementSibling.innerText;
        if(voltage > 25) {
            markAlert(el);
            markAlert(el.nextElementSibling);
        } else if(voltage > 13 && voltage < 20) {
            markAlert(el);
            markAlert(el.nextElementSibling);
        }
    }
}

function napAku(el) {
    if(+el.innerText < 10) markError(el);
}

function markError(el) {
    el.style.backgroundColor = '#ff697d';
}

function markAlert(el) {
    el.style.backgroundColor = '#f2c329';
}