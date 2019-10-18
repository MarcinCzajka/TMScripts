// ==UserScript==
// @name         closeTask
// @namespace    https://github.com/MarcinCzajka
// @version      0.2
// @description  Change status and owner .then close task
// @author       MAC
// @match        *thulium.com/panel/tickets*
// @grant        none
// @include      *thulium.com/panel/tickets*
// ==/UserScript==

(function() {
    'use strict';

    const button = '<div class="button" id="myButton" style="display:inline;margin-left:10px;background-color:#BE1721;color:#f0f2f1;">*Zamknij zadania jako wykonany import paliwa*</div>';
    $(button).insertBefore('#pager');

    const baseUrl = window.location.origin + '/panel/panel2.0/tickets';

    document.getElementById('myButton').addEventListener('click', function() {
        const tickets = getCheckedTickets();

        if(tickets) {
            assignUser(tickets);
            assignCategory(tickets);
            assignStatus(tickets);

            eventBus.trigger('refresh-tickets-grid');
        } else {
            alert('Zaznacz jakieś zadania');
        }

    });

    function getCheckedTickets() {
        let tickets = '';
        for(let item of $('input[checked]')) {
            if(item.parentElement.nodeName !== 'SPAN') {
                let id = item.parentElement.nextSibling.children[1].children[0].innerText;
                id = id.split(" ")[0].replace('(#', '');
                id = id.replace(')', '');

                tickets += '&tickets[]=' + id;
            };
        };

        return tickets;
    };

    function assignUser(tickets) {
        let data = 'assign_to_user_id=' + sysinfo.user + tickets;

        ajaxWithProgressIndicator({
            type: "POST",
            url: baseUrl + "/mass_assign",
            data: data
        });
    };

    function assignCategory(tickets) {
        let data = 'category_id=26' + tickets;

        ajaxWithProgressIndicator({
            type: "POST",
            url: baseUrl + "/change_mass_category",
            data: data
        });
    };

    function assignStatus(tickets) {
        let data = 'id_status_type=4|0' + tickets;

        ajaxWithProgressIndicator({
            type: "POST",
            url: baseUrl + "/change_mass_status",
            data: data
        });
    };

})();