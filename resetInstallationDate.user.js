// ==UserScript==
// @name         setInstallationToOdebrane
// @namespace    https://github.com/MarcinCzajka
// @version      1.3
// @description  Montaż
// @author       MAC
// @match        */api/installation/main/index/*
// @grant        none
// @include      */api/installation/main/index/*
// ==/UserScript==

(function() {
    'use strict';

    if(document.getElementById('createdFrom') !== null) {
        const newDiv = document.createElement("div");
        const clearBtn = '<input type="button" value="Reset Date" id="clearDateAndChangeCategory" style="cursor:pointer;"></input>';

        newDiv.innerHTML = clearBtn;
        document.getElementById('createdFrom').parentElement.prepend(newDiv);

        document.getElementById("clearDateAndChangeCategory").addEventListener('click', clearDateAndChangeCategory);

        function clearDateAndChangeCategory(e) {
            e.preventDefault();

            $('#createdFrom').val(undefined);
            $('#dataCreatedFrom').val(undefined);

            $('#submit_filter').trigger('click');

            for(let i = 1; i < 10; i++) {
                if($(`div[data-id=${i}]`).children()[0].innerText.includes('Odebrane')) {
                    if(!$(`div[data-id=${i}]`).hasClass('menu-status-active')) {
                        $(`div[data-id=${i}]`).trigger('click');
                    }
                    break;
                }
            }
        }
    }
})();