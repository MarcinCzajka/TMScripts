// ==UserScript==
// @name         Link to Vehicle in GPS
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.1
// @description  Create link direct link to created vehicle
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/linkToVehicleInGps.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/linkToVehicleInGps.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        const linksToFleet = createLinkToFleet();

        let imei = '';
        (function listenForValueChange() {
            imei = document.querySelector('[placeholder="IMEI urządzenia"]').value;

            if(imei === '') {
                setTimeout(listenForValueChange, 150);
                return
            }

            fetchVehicle(imei, linksToFleet);
        })()
    }, 1000)

    function createLinkToFleet() {
        const dropdown = document.createElement('div');
            dropdown.classList.add('dropdown');
            dropdown.style.marginLeft = '15px';
            dropdown.style.marginRight = '15px';

        const btn = document.createElement('button');
            btn.id = 'linksToFleet';
            btn.type = 'button';
            btn.textContent = 'Kartoteka';
            btn.classList.add('btn', 'btn-secondary', 'btn-sm', 'disabled');

        dropdown.appendChild(btn);
        document.querySelector('ol .row').appendChild(dropdown);

        dropdown.addEventListener('show.bs.dropdown', e => {console.log(e)})

        return dropdown
    }

    function fetchVehicle(imei, dropdown) {
        const btn = dropdown.firstChild;

        let bearerToken = document.cookie.split('accessToken=')[1];
        if(bearerToken.includes(';')) bearerToken = bearerToken.substring(0, bearerToken.indexOf(';'));

        const {origin} = window.location

        fetch(`${origin}/api/v1/tracker/${imei}/imei`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: new Headers({
                'Authorization': 'Bearer ' + bearerToken
            })
        }).then(res => res.json())
            .then(({data}) => {
            const {fm_server_desc, fm_vehicle_id} = data;

            if(!fm_server_desc || !fm_vehicle_id) {
                dropdown.innerHTML = '<div class="btn btn-sm btn-danger disabled" style="opacity:0.15">Kartoteka</div>';
                dropdown.title = 'Brak informacji o kartotece';
                return
            }

            btn.setAttribute('data-toggle', 'dropdown');
            btn.setAttribute('aria-haspopup', true);
            btn.setAttribute('aria-expanded', false);
            btn.classList.add('dropdown-toggle');
            btn.classList.remove('disabled');
            btn.addEventListener('click', toggleDropdown)
            btn.addEventListener('blur', hideDropdown)

            const fleet = `${origin.replace('gps', fm_server_desc)}/api`;

            const dropdownMenu = document.createElement('div');
                dropdownMenu.id = 'linksDropdownMenu';
                dropdownMenu.classList.add('dropdown-menu');
                dropdownMenu.setAttribute('aria-labelledby', 'linksToFleet');
                dropdownMenu.style.zIndex = '9999';

            dropdownMenu.appendChild( createLink('Dane Podstawowe', `/vehicle/data/data/${fm_vehicle_id}`) );
            dropdownMenu.appendChild( createLink('Dane Rozszerzone', `/vehicle/data/data_extended/${fm_vehicle_id}`) );
            dropdownMenu.appendChild( createLink('Dane GPS', `/vehicle/events/index/${fm_vehicle_id}`) );
            dropdownMenu.appendChild( createLink('Serwisy', `/services/main/index_vehicle/${fm_vehicle_id}`) );
            dropdownMenu.appendChild( createLink('Dane Administracyjne', `/vehicle/admin/index/${fm_vehicle_id}`) );
            dropdownMenu.appendChild( createLink('Dane Źródłowe', `/vehicle/gps/index/${fm_vehicle_id}`) );

            dropdown.appendChild(dropdownMenu);

            function createLink(name, endpoint) {
                const link = document.createElement('a');
                    link.classList.add('dropdown-item');
                    link.textContent = name;
                    link.href = fleet + endpoint;
                    link.addEventListener('blur', hideDropdown);

                return link
            }

            function toggleDropdown() {
                document.getElementById('linksDropdownMenu').classList.toggle('show');
            }
            function hideDropdown({relatedTarget}) {
                if(relatedTarget) {
                    if(relatedTarget.classList.contains('dropdown-item')) return
                }

                document.getElementById('linksDropdownMenu').classList.remove('show');
            }
        })
    }
    

})();