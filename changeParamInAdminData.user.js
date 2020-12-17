// ==UserScript==
// @name         Zmień parametr w danych administracyjnych
// @namespace    https://github.com/MarcinCzajka
// @version      0.1.7
// @description  Zmienia wybrane parametry dla wszystkich kartotek pojazdu
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/changeParamInAdminData.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/changeParamInAdminData.user.js
// @match        */api/vehicle/admin/index*
// @grant        none
// @include      */api/vehicle/admin/index*
// ==/UserScript==

window.reloadEvents = function(howMany = +document.querySelector('#container .datatable_admin_index tbody tr:last-child td').textContent) {
    const ids = document.querySelectorAll('tbody tr .datatable_datetime_from');

    for(let i = 0; i < howMany; i++) {
        const id = ids[i].getAttribute('value');

        axios.post('/api/vehicle/admin/ajaxRecreateVehicleEvents', {
                vehicleThreadId: 41551}, {
                withErrorHandling: true,
            }).then(function (response) {
                if (response !== undefined && response.data.message !== undefined) {
                    console.log(`Wątek: ${i + 1}`, response.data.message);
                }
            });
    }
}

window.changeParam = function(params = {}) {
    if(typeof params !== 'object' || $.isEmptyObject(params)) {
        console.log('Brak podanych parametrów');
        return
    }

    const parser = new DOMParser();

    for(const idElement of document.querySelectorAll('tbody tr .datatable_datetime_from')) {
        const id = idElement.getAttribute('value');
        let url = window.location.href.replace('index', 'save');
        url = url.slice(0, window.location.href.indexOf('?') - 1) + '/' + id

        fetch(url).then(res => {
            if (!res.ok) {
                console.log(`Wystąpił błąd podczas pobierania kartoteki: ${id}. Przerywam działanie skryptu.`);
                return
            } else {
                res.text()
                    .then(res => {
                        const result = {};
                        const doc = parser.parseFromString(res, 'text/html');
                        const formInputs = doc.querySelectorAll('form table tbody [name]:not([type=radio]),form table tbody [type=radio][checked]');

                        for(const input of formInputs) {
                            const {name, value, type, checked, disabled} = input;
                            if(type === 'checkbox' && !disabled) {
                                const val = params[name] !== undefined ? params[name] : checked ? 1 : 0;
                                if(val || params[name] !== undefined) result[name] = val;
                            } else if(type !== 'button' && !disabled) {
                                result[name] = params[name] || value;
                            }
                        }

                        result.saveexitwindow = '';
                        result.saveexit = '';

                        postData(url, result)
                    })
                }
            })
    }

    function postData(url, data) {
        $.ajax({
			url: url,
			type: "POST",
			data: data,
			dataType: 'text',
			success: function (res) {
				const doc = parser.parseFromString(res, 'text/html');

				const error = doc.querySelector('#info.error');
				if(error) {
					console.log(url, error.innerText);
				} else {
					console.log('Skonfigurowano ' + url)
				}
			},
			error: function (err) {
				console.log(url, err);
			}
		})
    }
}