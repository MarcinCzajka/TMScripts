// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.3
// @description  Zaznacz kolorami komórkę w tabeli według określonych kryteriów
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @match        http://*/api/installation*
// @grant        none
// @include *.pl/record/*
// ==/UserScript==

const coloredElements = [];

const timeToWait = 3000;

(function() {
    'use strict';

	const headers = [];

    setTimeout(() => {
        for(let button of document.getElementsByClassName('btn')) {
            if(button.innerText === "Filtruj" || button.innerText === "Resetuj") {
                button.addEventListener('click', () => {setTimeout(() => {checkData()}, timeToWait)});
            }
		}

		document.getElementById('per-page').addEventListener('change', () => {setTimeout(() => {checkData()}, timeToWait)});

        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        checkData();

    }, 5000);

    function checkData() {
		clearElements();

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
    if(+el.innerText < 9) markError(el);
}

function markError(el) {
	el.style.backgroundColor = '#ff697d';
	coloredElements.push(el);
}

function markAlert(el) {
	el.style.backgroundColor = '#f2c329';
	coloredElements.push(el);
}

function clearElements() {
	coloredElements.forEach(function(el, index, object) {
		el.style = '';
		object.splice(index, 1);
	});
}