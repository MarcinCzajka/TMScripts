// ==UserScript==
// @name         Create JSON for Excel App
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.1
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

            const newTr = document.createElement('tr');
            newTr.id = 'newTr';
            newTr.innerHTML = `<td>JSON</td><td style="word-break:break-all">${JSON.stringify(result)}</td>`;

            table.appendChild(newTr);

        }
    }

    function findValByText(text, element) {
        for(let i = 0; i < element.children.length; i++) {
            if(element.children[i].children[0].textContent === text) return element.children[i].children[1].textContent
        }

        return ''
    }

})();