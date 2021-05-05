// ==UserScript==
// @name         Create JSON for Excel App
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.5
// @description  Create JSON for Excel App
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/createJSONForExcel.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/createJSONForExcel.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if(mutationRecord.target.classList.contains('modal-open')) createJSON();
            });
        });

        observer.observe(document.querySelector('body'), { attributes : true, attributeFilter : ['class'] });
    }, 1000);

    function createJSON() {
        if(document.getElementById('trackerInfo')) {
            const table = document.querySelector('div.modal-body tbody');

            const result = {};
            result.id = findValByText('Imei', table);
            result.typRejestratora = findValByText('Model', table);
            result.sim = findValByText('SIM', table).replace('Wyślij SMS', '').replace('+', '');
            result.rej = findValByText('VRN', table).trim();
                if(result.rej.charAt(3) === ' ') result.rej = result.rej.slice(0,3) + result.rej.slice(4)

            result.vin = findValByText('VIN', table).trim();

            const distance = getFromLastFrame('Dystans (CAN)');

            if(distance && distance?.length > 3) {
                result.przebieg = distance.slice(0, -3);
            }

            const newTr = document.createElement('tr');
            newTr.id = 'newTr';
            newTr.innerHTML = `<td>JSON</td><td id="selectionRange" title="Kliknij, żeby zaznaczyć cały JSON" style="word-break:break-all">${JSON.stringify(result)}</td>`;

            table.appendChild(newTr);

            document.getElementById('selectionRange').addEventListener('click', () => {
                const selection = window.getSelection();
                selection.removeAllRanges();

                const range = document.createRange();
                range.selectNodeContents(document.getElementById('selectionRange'));
                selection.addRange(range);
            });
        }
    }

    function findValByText(text, element) {
        for(let i = 0; i < element.children.length; i++) {
            if(element.children[i].children[0].textContent === text) return element.children[i].children[1].textContent
        }

        return ''
    }

    function getFromLastFrame(columnName) {
        const table = document.querySelector('table');
        const tableNames = table?.children[0]?.children[0].children;
        const firstFrame = table?.children[1]?.children[0];

        if(!tableNames || !firstFrame || firstFrame?.children[0]?.classList?.contains('vuetable-empty-result') ) return

        for(let i = 0; i < tableNames.length; i++) {
            if(tableNames[i].children[0]?.innerText === columnName) {
                return firstFrame.children[i].innerText
            }
        }

    }

})();