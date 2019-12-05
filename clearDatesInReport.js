// ==UserScript==
// @name         clearDatesInReport
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Czyści daty i filtry w raporcie
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/clearDatesInReport.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/clearDatesInReport.user.js
// @match        */api/raports/*
// @grant        none
// @include      */api/raports/*
// ==/UserScript==

(function () {
    'use strict';

    $(document).ready(() => {
        $(`<input type="button" id="clearFiltersBtn">Brak powiązania z GPS</input>`).insertBefore($('#clearFiltersBtn'));
        $('#clearFiltersBtn').on('click', clearFilters);
    });

    function clearFilters() {
        for (let i = 1; i <= 4; i++) {
            $('#table_calendar_input' + i).val('');
            $('select[name="show_invoice"]').select2('val', 2);
            $('#submit_filter').trigger('click');
        }
    }

})();