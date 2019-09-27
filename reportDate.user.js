// ==UserScript==
// @name         reportDate
// @namespace    https://github.com/MarcinCzajka
// @version      1.0
// @description  Raport statystyk
// @author       MAC
// @match        */api/raports/stat*
// @grant        none
// @include      */api/raports/stat*
// ==/UserScript==

(function() {
    'use strict';
    if(!$('#from_gps').val() && !$('#to_gps').val()) {
        const today = new Date($('#to').val());
        $('#to_gps').val(today.toISOString().slice(0,10));

        let newFromDate = new Date(today);
        newFromDate.setDate(today.getDate()-150);
        newFromDate = newFromDate.toISOString().slice(0,10);
        $('#from').val(newFromDate);

        let newFromGpsDate = new Date(today);
        newFromGpsDate.setDate(today.getDate()-30);
        newFromGpsDate = newFromGpsDate.toISOString().slice(0,10);
        $('#from_gps').val(newFromGpsDate);
    }
})();