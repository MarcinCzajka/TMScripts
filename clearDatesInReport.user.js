// ==UserScript==
// @name         clearDatesInReport
// @namespace    https://github.com/MarcinCzajka
// @version      0.2
// @description  Czyści daty i filtry w raporcie
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/clearDatesInReport.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/clearDatesInReport.user.js
// @match        */api/raports/refueling*
// @grant        none
// @include      */api/raports/refueling*
// ==/UserScript==

(function () {
    'use strict';

    $(document).ready(() => {
        const clearFiltersBtn = `<input type="button" id="clearFiltersBtn" value="Brak powiązania z GPS" style="width:135px;padding:0;margin:0 10px 0 0;background:#99a4ae"></input>`;
        $(clearFiltersBtn).insertBefore($('#reset_filter'));
        $('#clearFiltersBtn').on('click', clearFilters);
    });

    function clearFilters() {
        let d = new Date();
        d.setDate(d.getDate()-60);
        d = d.toISOString().slice(0,10);

        $('#table_calendar_input').val(d);

        for (let i = 2; i <= 4; i++) {
            $('#table_calendar_input' + i).val('');
        }

        $('select[name="show_invoice"]').select2('val', 2);
        $('#submit_filter').trigger('click');
    }



})();