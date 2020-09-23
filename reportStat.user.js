// ==UserScript==
// @name         Ukryj Raporty nie zawierające danych
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.1
// @description  Ukryj Raporty nie zawierające danych
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/reportStat.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/reportStat.user.js
// @match        http://*/api/installation*
// @grant        none
// @include      *api/raports/stat*
// ==/UserScript==

(function() {
    'use strict';

    const stylesheet = document.createElement('style');
    stylesheet.type = "text/css";

    stylesheet.textContent = `
        .noData {
            display: none;
        }
    `;

    document.querySelector('head').appendChild(stylesheet);

    const table = document.querySelector('#dataTable tbody');
    const tableHead = table.children[0].children;
    const fuellosses = table.children[1].children;
    const refuelings = table.children[3].children;

    for(let i = 1; i < tableHead.length - 1; i++) {
        if((fuellosses[i].innerText === '' || fuellosses[i].innerText.includes('(0)')) && (refuelings[i].innerText === '' || refuelings[i].innerText.includes('(0)'))) {
            for(const elem of table.children) elem.children[i].classList.add('noData');
        }
    }



})();