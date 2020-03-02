// ==UserScript==
// @name         Create link to alternative Eagle in DB
// @namespace    https://github.com/MarcinCzajka
// @version      0.1.3
// @description  Creates link near SIM to Eagle override
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/linkToAltEagle.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/linkToAltEagle.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    let simNr = '';

    setTimeout(() => {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if(mutationRecord.target.classList.contains('modal-open')) createLink();
            });
        });

        observer.observe(document.querySelectorAll('body')[0], { attributes : true, attributeFilter : ['style'] });
    }, 1000);

    function createLink() {
        if(document.getElementById('trackerInfo')) {
            const table = document.getElementsByClassName('modal-body')[0].querySelectorAll('tbody td');

            for(const td of table) {
                if(td.innerText === 'SIM') {
                    const simTd = td.nextElementSibling;
                    simTd.style.position = 'relative';
                    simNr = simTd.innerText;

                    if(simNr) {
                        createLinkToEagle(simTd);
                    }

                    return
                }
            }
        }
    }

    function createLinkToEagle(el) {
        const btn = document.createElement('button');
        btn.classList.add('btn', 'btn-success', 'btn-sm');
        btn.style = 'position: absolute; right: 0; top: 0; height:100%;';
        btn.innerText = 'Wyślij SMS';
        btn.onclick = openEagle;

        el.append(btn);
    }

    function openEagle() {
        const url = 'http://' + window.location.host.replace('gps', 'sms') + ':86//'
        const query = '?chat=true&number=' + simNr;
        window.open(url + query);
    }

})();