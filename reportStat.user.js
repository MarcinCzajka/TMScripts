// ==UserScript==
// @name         Ukryj Raporty nie zawierające danych
// @namespace    https://github.com/MarcinCzajka
// @version      0.1.0
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
        .hide {
            display: none !important;
        }
        .btn {
            padding: 0 10px !important;
            height: 27px !important;
        }
        .basicColor {
            background: #28bea9 !important;
        }
        .altColor {
            background: #99a4ae !important;
        }
    `;

    document.querySelector('head').appendChild(stylesheet);

    const table = document.querySelector('#dataTable tbody');
    const tableHead = table.children[0].children;
    const fuellosses = table.children[1].children;
    const refuelings = table.children[3].children;

    for(let i = 1; i < tableHead.length - 1; i++) {
        if((fuellosses[i].innerText === '' || fuellosses[i].innerText.includes('(0)')) && (refuelings[i].innerText === '' || refuelings[i].innerText.includes('(0)'))) {
            for(const elem of table.children) elem.children[i].classList.add('noData', 'hide');
        }
    }

    const newTd = document.createElement('td');
    const btn = document.createElement('input');
    btn.type = 'button';
    btn.value = 'Pokaż wszystkie firmy';
    btn.classList.add('btn', 'altColor');
    btn.dataset.active = 'true';

    document.querySelector('#bottom_header tr').append(newTd);
    newTd.append(btn);

    btn.addEventListener('click', onClick);

    function onClick() {
        const elements = document.getElementsByClassName('noData');
        for(const elem of elements) elem.classList.toggle('hide');

        if(btn.dataset.active === 'true') {
            btn.classList.add('basicColor');
            btn.classList.remove('altColor');
            btn.value = 'Ukryj wszystkie firmy'
            btn.dataset.active = 'false';
        } else {
            btn.classList.add('altColor');
            btn.classList.remove('basicColor');
            btn.value = 'Pokaż wszystkie firmy'
            btn.dataset.active = 'true';
        }
    }

})();