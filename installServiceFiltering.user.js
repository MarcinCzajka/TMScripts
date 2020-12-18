// ==UserScript==
// @name         Non-intrusive installation/service filtering
// @namespace    https://github.com/MarcinCzajka
// @version      0.3
// @description  Non-intrusive installation/service filtering
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/installServiceFiltering.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/installServiceFiltering.user.js
// @supportURL   https://github.com/MarcinCzajka/TMScripts/issues
// @match        */api/installation/main*
// @include      */api/installation/main*
// @match        */api/services*
// @include      */api/services*
// @exclude      *services/main*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const isInstallation = window.location.href.includes('installation');

    if(isInstallation) {
        addStylesheet();

        $('#createdFrom,#createdTo').unbind('change').on('change', onDateChange);
    } else {
        $('#problem_from,#problem_to,#service_from,#service_to').unbind('change').on('change', onDateChange);
        $('#ch_guaranty,#ch_non_guaranty,#ch_service_client,#ch_service_fl').unbind('change').on('change', function(e) {
            $('#' + e.target.id.replace('ch', 'show')).attr('checked', e.target.checked);
            document.querySelector(`div._flBtn[data-name=${e.target.id}]`).classList.toggle('checkbox_checked', 'checkbox_unchecked');
        })
    }

    $('.menu-status').unbind('click').on('click', onStatusClick);
    $('#firma_id').unbind('change').on('change', function() { $('#firma1_id').val($(this).val()) })

    function onStatusClick() {
        const thisDataId = $(this).data('id');
        const selectAll = $('.menu-status[data-id=""]');

        if(thisDataId === '' && !$(this).hasClass('menu-status-active')) {
            $('.menu-status-active').removeClass('menu-status-active')
        } else if(thisDataId !== '' && selectAll.hasClass('menu-status-active')) {
            selectAll.removeClass('menu-status-active');
        }

        $(this).toggleClass('menu-status-active');

        const statuses = document.querySelectorAll('.menu-status-active');
        const ids = [];

        if(statuses.length) {
            for(const status of statuses) {
                if(status.dataset.id === '') break
                ids.push(status.dataset.id);
            }
        } else {
            selectAll.addClass('menu-status-active');
        }

        $.ajax({
            url: `/api/${isInstallation ? 'installation' : 'services'}/main/ajax_change_status_filter`,
            type: 'POST',
            dataType: 'json',
            data: ids.length ? {ids: ids} : {},
        });
    }

    function onDateChange({target}) {
        let query = '';
        if(isInstallation) {
            query = '#data' + target.id.charAt(0).toUpperCase() + target.id.slice(1);
        } else {
            query = '#' + target.id.replace('_', '_date_');
        }

        $(query).val(target.value);
    }

    //Module for checking if vehicle was created for range of files
    if(isInstallation) {
        const checkbox = document.createElement('input')
            checkbox.type = 'checkbox';
            checkbox.name = 'wasVehicleCreated';
            checkbox.style.display = 'inline-block';
            checkbox.style.margin = '0 18px 0 10px';
            checkbox.checked = GM_getValue('checkIfVehicleWasCreated');
        const checkboxLabel = document.createElement('label');
            checkboxLabel.for = 'wasVehicleCreated';
            checkboxLabel.innerText = 'Sprawdzanie czy założono pojazdy';

        document.getElementsByClassName('pagination')[0].insertAdjacentElement('afterbegin', checkbox);
        document.getElementsByClassName('pagination')[0].insertAdjacentElement('afterbegin', checkboxLabel);

        checkbox.addEventListener('change', (e) => {
            GM_setValue('checkIfVehicleWasCreated', e.target.checked);
            if(e.target.checked) checkIfVehicleWasCreated();
        })

        if(checkbox.checked) checkIfVehicleWasCreated();

        function checkIfVehicleWasCreated() {
            const parser = new DOMParser();

            for(const elem of document.querySelectorAll('.datatable_dane.first_column:not([data-checked=true]')) {
                elem.dataset.checked = 'true';

                const sibling = $(elem).siblings('.datatable_status');
                if( !sibling.find('.installation-status-2, .installation-status-3').length ) continue

                const parentElement = elem.parentElement;


                fetch(window.location.origin + '/api/installation/save/index/' + elem.getAttribute('value'))
                    .then(res => {
                    res.text()
                      .then(res => {
                        const doc = parser.parseFromString(res, 'text/html');

                        const type = doc.querySelector('#type_id option[selected]');
                        if(type.value !== '2') {
                            const newP = document.createElement('p');
                                newP.innerText = type.innerText;
                                newP.style.marginTop = '1px';
                                newP.style.marginBottom = '0';
                                newP.style.fontWeight = '600';
                                newP.style.fontSize = '10px';
                            elem.appendChild(newP);
                        }

                        if(type.value !== '2' && !doc.getElementsByClassName('vehicle-files').length) {
                            parentElement.style.backgroundColor = parentElement.classList.contains('even') ? '#f3cfaa' : '#f7d6b5';
                        } else {
                            sibling.append('<div class="tickMark"></div>');
                        }
                    })
                })
            }
        }
    }

    function addStylesheet() {
        const stylesheet = document.createElement('style');
            stylesheet.type = "text/css";

        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = '/api/media/images/newLayout/chat/tick.png';
        document.querySelector('head').appendChild(preloadLink);

        stylesheet.textContent = `
              div.tickMark {
                 background-image: url(/api/media/images/newLayout/chat/tick.png);
                 width: 15px;
                 height: 15px;
                 background-repeat: no-repeat;
                 background-size: contain;
                 margin-top: -25px;
                 margin-left: 50px;
             }
        `;

        document.querySelector('head').appendChild(stylesheet);
    }

})();