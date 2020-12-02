// ==UserScript==
// @name         Zmień parametr w danych administracyjnych
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.2
// @description  Zmienia wybrane parametry dla wszystkich kartotek pojazdu
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/changeParamInAdminData.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/changeParamInAdminData.user.js
// @match        */api/vehicle/admin/index*
// @grant        none
// @include      */api/vehicle/admin/index*
// ==/UserScript==

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
                            const {name, value, type, checked, disabled, className} = input;
                            if(type === 'checkbox' && !disabled) {
                                const val = params[name] || checked ? 1 : 0;
                                if(val) result[name] = val;
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