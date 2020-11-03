// ==UserScript==
// @name         CopyDataForGoogleSheet
// @namespace    https://github.com/MarcinCzajka
// @version      1.1
// @description  Send data to to google sheet
// @author       MAC
// @downloadURL  http://raw.githubusercontent.com/MarcinCzajka/TMScripts/master/logServiceInWorksheet.user.js
// @updateURL    http://raw.githubusercontent.com/MarcinCzajka/TMScripts/master/logServiceInWorksheet.user.js
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

        const inputStyling = 'style="height:2.5em;width:11em;cursor:pointer;padding: 0.1em 1em 0.1em 1em;" type="button"';

        newBar.insertAdjacentHTML('beforeend', `<td><input value="Send data to Sheet" id="copyBtn" ${inputStyling} ></input></td>`);

        $("#bottom_header")[0].children[0].children[0].children[0].append(newBar);

        document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    }


    function createData() {
        const location = window.location.host;
        const fleet = location.substr(0, location.indexOf('.'));

        const firma = $('#firma1_id').find('[selected]').text();
        const rejAndModel = getDataFromTable('Nr rejestracyjny') + '/' + getDataFromTable('Marka / Model');
        const sim = getDataFromTable('Nr karty SIM');
        const rodzajRejestratora = getDataFromTable('Rodzaj rejestratora / Typ rejestratora');
        const dataUtworzenia = getCreationMonthName();
        const gwarancja = ( getDataFromTable('Kategoria') === 'Pogwarancyjny' ? 'FAŁSZ' : 'PRAWDA' );

        const godzinaUsterki = $('[name=problem_hour]').val();
        const godzina = (godzinaUsterki < 10 ? "0" + godzinaUsterki : godzinaUsterki);
        const minutaUsterki = $('[name=problem_minute]').val();
        const minuta = (minutaUsterki < 10 ? "0" + minutaUsterki : minutaUsterki);
        const dataUsterki = `${$('#problem_date').val()} ${godzina}:${minuta}:00`;

        const przyczyna = getPrzyczyna();

        const statusSerwisu = getDataFromTable('Status');
        const wykonano = (statusSerwisu === 'Odebrano' || statusSerwisu === 'Potwierdzono' ? 'PRAWDA' : 'FAŁSZ');

        return {
            flota: fleet,
            Firma: firma,
            'Nr rej / marka / model': rejAndModel,
            SIM: sim,
            'Rodzaj rejestratora ': rodzajRejestratora,
            'Data utworzenia': dataUtworzenia,
            Gwarancja: gwarancja,
            'Data wystąpienia usterki': dataUsterki,
            'Przyczyna serwisu': przyczyna,
            'Wykonany': wykonano
        }
    }

    function getPrzyczyna() {
        let kategoria = $('.couse')[0].children[0].innerText;
        if(!kategoria) {
            kategoria = $('.couse')[1].children[0].innerText;
        }

        let opis;
        if(kategoria === 'Paliwo') {
            opis = $('select.couse_select option[selected]').text().trim();
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

        let locale = 'pl-pl';
        if(window.location.origin === "http://kj.framelogic.pl") locale = 'en-gb';
        return date.toLocaleString(locale, { month: "long" });
    }

    function copyToClipboard() {
        const btn = document.getElementById('copyBtn');

        btn.style.background = '#efb30c';
        btn.value = '. . .';

        const data = createData();

        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbyZIpv753E2txA375iZFmBCY8pW-c_EnaGl7I3DMUrrHHR5v6g/exec",
            dataType: 'jsonp',
            data: data,
            jsonpCallback: "window.localJsonpCallback"
        })
    }

    window.localJsonpCallback = function(res) {
        const btn = document.getElementById('copyBtn');

        if(res.result === 'success') {
            btn.value = 'Wysłano';
            btn.style.background = '#1cb700';
        } else {
            console.log(res.request)
            btn.value = 'Coś poszło nie tak';
            btn.style.background = '#e80a0a';
        }
    }

})();