// ==UserScript==
// @name         CopyDataForGoogleSheet
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  This script will prepare data to copy to online google sheet
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/logServiceInWorksheet.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/logServiceInWorksheet.user.js
// @match        http://*/api/services*
// @grant        none
// @include      */api/services*
// @exclude      */api/installation/main/save*
// ==/UserScript==

(function() {
    'use strict';

    if(!document.getElementById('newBar')) {
        const newBar = document.createElement("td");
        newBar.id = 'newBar';

        const inputStyling = 'style="margin-right:5px;height:90%;cursor:pointer;" type="button"';

        newBar.insertAdjacentHTML('beforeend', `<td><input value="copy" id="copyBtn" type="button"></input></td>`);

        $("#bottom_header")[0].children[0].children[0].children[0].append(newBar);

        document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    }


    function createData() {
        const firma = $('#firma1_id').find('[selected]').text() + '\t';
        const rejAndModel = getDataFromTable('Nr rejestracyjny') + '/' + getDataFromTable('Marka / Model') + '\t';
        const sim = getDataFromTable('Nr karty SIM') + '\t';
        const rodzajRejestratora = getDataFromTable('Rodzaj rejestratora / Typ rejestratora') + '\t';
        const dataUtworzenia = getCreationMonthName() + '\t';
        const gwarancja = ( getDataFromTable('Kategoria') === 'Pogwarancyjny' ? 'FAŁSZ' : 'PRAWDA' ) + '\t';
        const przyczyna = getPrzyczyna() + '\t';

        const statusSerwisu = getDataFromTable('Status');
        const wykonano = (statusSerwisu === 'Odebrano' || statusSerwisu === 'Potwierdzono' ? 'PRAWDA' : 'FAŁSZ');

        console.log(getDataFromTable('Kategoria'))

        return firma + rejAndModel + sim + rodzajRejestratora + dataUtworzenia + gwarancja + przyczyna + wykonano;
    }

    function getPrzyczyna() {
        const kategoria = $('.couse')[0].children[0].innerText;

        let opis;
        if(kategoria === 'Paliwo') {
            opis = $('select.couse_select').first().find('option[selected]').text().trim();
        } else {
            opis = $('.couse').find('[checked]')[0].nextSibling.nextSibling.nodeValue.trim();
        }

        return kategoria + ' - ' + opis;
    }

    function getDataFromTable(header) {
        return $(`td:contains(${header})`).first().next().text().trim();
    }

    function getCreationMonthName() {
        const date = new Date($('.break')[0].children[0].children[0].children[0].innerText);

        return date.toLocaleString('pl-pl', { month: "long" });
    }

    function copyToClipboard() {
        const str = createData();

        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        $(`#copyBtn`).fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });
    }

})();