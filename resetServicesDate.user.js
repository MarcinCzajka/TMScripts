// ==UserScript==
// @name         setServicesToOdebrane
// @namespace    https://github.com/MarcinCzajka
// @version      1.4
// @description  Serwis
// @author       MAC
// @match        */api/services*
// @grant        none
// @include      */api/services*
// ==/UserScript==

(function() {
    'use strict';

    if(document.getElementById('problem_from') !== null) {
        const newDiv = document.createElement("div");
        const clearBtn = '<input type="button" value="Reset Date" id="clearDateAndChangeCategory" style="cursor:pointer;"></input>';

        newDiv.innerHTML = clearBtn;
        document.getElementById('problem_from').parentElement.prepend(newDiv);

        document.getElementById("clearDateAndChangeCategory").addEventListener('click', clearDateAndChangeCategory);

        function clearDateAndChangeCategory(e) {
            e.preventDefault();

            $('#problem_from').val(undefined);
            $('#problem_date_from').val(undefined);

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