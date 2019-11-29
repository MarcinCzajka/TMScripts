// ==UserScript==
// @name         closeTask
// @namespace    https://github.com/MarcinCzajka
// @version      0.6
// @description  Change status and owner .then close task
// @author       MAC
// @match        *thulium.com/panel/tickets*
// @grant        none
// @include      *thulium.com/panel/tickets*
// ==/UserScript==

(function() {
    'use strict';
	
	const baseUrl = window.location.origin + '/panel/panel2.0/tickets';
	const basicButtonStyle = 'display:inline;font-size:14px;margin-left:10px;background-color:#BE1721;color:#f0f2f1;';

    const closeTasksBtn = `<div class="button" id="closeTasks" style="${basicButtonStyle}background-color:#f75126;">*Zamknij zadania jako wykonany import paliwa*</div>`;
    $(closeTasksBtn).insertBefore('#pager');
	
	const moveToTrashBtn = `<div class="button" id="moveToTrash" style="${basicButtonStyle}background-color:#BE1721;">*Przenieś do TRASH*</div>`;
    $(moveToTrashBtn).insertBefore('#pager');

    document.getElementById('closeTasks').addEventListener('click', function() {
        const tickets = getCheckedTickets();

        if(tickets) {
            assignUser(tickets);
            assignCategory(tickets);
            assignStatus(tickets);
			assignInbox(tickets, 'IMPORT_TANKOWAŃ');

            eventBus.trigger('refresh-tickets-grid');
        } else {
            alert('Zaznacz jakieś zadania');
        };

    });
	
	document.getElementById('moveToTrash').addEventListener('click', function() {
        const tickets = getCheckedTickets();

        if(tickets) {
			assignInbox(tickets, 'TRASH');

            eventBus.trigger('refresh-tickets-grid');
        } else {
            alert('Zaznacz jakieś zadania');
        };

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
	
	function assignInbox(tickets, inboxName) {
		const inboxId = findInboxId(inboxName);
		if(!inboxId) return;
		
		let data = `inbox_id=${inboxId}${tickets}`;

        ajaxWithProgressIndicator({
            type: "POST",
            url: baseUrl + "/change_mass_inbox",
            data: data
        });
    };
	
	function findInboxId(inboxName) {
		const inboxIds = document.getElementById('inbox_id');
		
		for(let inbox of inboxIds) {
			if(inbox.text === inboxName) {
				return inbox.value;
			};
		};
		
		alert('Nie znaleziono kolejki o nazwie: ' + inboxName);
		return false;
	};

})();