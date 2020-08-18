// ==UserScript==
// @name         Wstępna kalibracja pojazdu
// @namespace    https://github.com/MarcinCzajka
// @version      1.21.7
// @description  Wstępne założenie kartoteki pojazdu
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/wstepnaKalibracja.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/wstepnaKalibracja.user.js
// @match        http://*/api/installation*
// @grant        none
// @include */api/installation*
// @exclude */api/installation/main/index/*
// ==/UserScript==

(function () {
	'use strict';

	const confirmBtn = document.getElementById('confirm-trigger');
	const wasVehicleCreated = $('.vehicle-files')[0];

	const timer = new Timer();

	if (confirmBtn && wasVehicleCreated && $('#type_id').val() % 2 !== 0) {
		const kalibracjaWstepnaBtn = document.createElement('input');
		kalibracjaWstepnaBtn.type = "button";
		kalibracjaWstepnaBtn.id = "kalibracjaWstepnaBtn";
		kalibracjaWstepnaBtn.value = "Konfiguracja wstępna";
		kalibracjaWstepnaBtn.style = "width:150px;height:25px;padding:5px 15px;display:block;margin-top:5px";

		confirmBtn.parentElement.parentElement.parentElement.nextElementSibling.children[1].appendChild(kalibracjaWstepnaBtn);
		document.getElementById('kalibracjaWstepnaBtn').addEventListener('click', kalibracjaWstepna);

		const successFeed = document.createElement('div');
		successFeed.id = 'successFeed';
		successFeed.style.display = 'none';

		kalibracjaWstepnaBtn.parentNode.insertBefore(successFeed, kalibracjaWstepnaBtn.nextSibling);
	};

	function kalibracjaWstepna() {
		timer.start();

		const btn = document.getElementById('kalibracjaWstepnaBtn');
		btn.style.background = '#ce2305';
		btn.value = 'Working...';
		$('#kalibracjaWstepnaBtn').fadeTo(50, 0.5, function () {
			$(this).fadeTo(250, 1.0);
		});
		document.getElementById('successFeed').innerHTML = '<p><b>Uzupełniono:</b><br></p>';
		document.getElementById('successFeed').style.display = 'none';

		const baseUrl = window.location.origin;
		const vehicleId = wasVehicleCreated.dataset.pojazd_id;

		const asyncCounter = AsyncCounter(8, btn);

		getNrKartoteki(vehicleId, baseUrl).then((nrKartoteki) => {
			fillAdministrativeData(vehicleId, nrKartoteki, baseUrl, asyncCounter);
			setPaliwo(vehicleId, nrKartoteki, baseUrl, asyncCounter);
            hideSideNumber(vehicleId, baseUrl, asyncCounter);
		}).catch(err => {
			alert(err);
		});
		getVinNr(vehicleId, baseUrl, asyncCounter);
		downloadFrames(vehicleId, baseUrl, asyncCounter);
        synchronizeDistance(vehicleId, baseUrl, asyncCounter);
	};

	function* AsyncCounter(nrOfOperations, btnToUpdate) {
		for (let i = 1; i < nrOfOperations; i++) {
			btnToUpdate.value = `Working... ${i}/${nrOfOperations}`;
			yield i;
		};

		appendToSuccessFeed(`<br><b>Wypełnianie zajęło: ${timer.getTime()}s</b>`);

		btnToUpdate.style.background = '#28bea9';
		btnToUpdate.value = "Uzupełniono kartotekę.";
		$('#kalibracjaWstepnaBtn').fadeTo(50, 0.5, function () {
			$(this).fadeTo(250, 1.0);
		});

		setTimeout(() => {
			btnToUpdate.value = "Konfiguracja wstępna";
		}, 5000);

		return false;
	};

	function setPaliwo(vehicleId, nrKartoteki, baseUrl, asyncCounter) {
		const all_calibration_points = createCalibrationPoints();

		if (all_calibration_points) { //Jeżeli są zaklikane sondy albo paliwo z CAN
			//Kalibracja paliwa
			$.ajax({
				url: `${baseUrl}/api/fuel/main/calibrationsave/${vehicleId}/${nrKartoteki}`,
				type: "POST",
				data: {
					'data': all_calibration_points,
					'comment': 'Kalibracja wstępna'
				},
				dataType: 'text',
				success: function () {
					appendToSuccessFeed('Kalibracja paliwa');
					asyncCounter.next()
				},
				error: function (err) {
					console.log(err);
					alert('Wystąpił błąd podczas zmiany kalibracji paliwa. Spróbuj ręcznie.');
				}
			});

			//ustawienia paliwa
			const data = createFuelSettingsData(vehicleId, nrKartoteki);
			$.ajax({
				url: `${baseUrl}/api/fuel/main/settingssave`,
				type: "POST",
				data: data,
				dataType: 'text',
				success: function () {
					appendToSuccessFeed('Kalibracja paliwa: Ustawienia');
					asyncCounter.next()
				},
				error: function (err) {
					console.log(err);
					alert('Wystąpił błąd podczas zmiany ustawień paliwa. Spróbuj ręcznie.');
				}
			});
		} else {
			asyncCounter.next();
			asyncCounter.next();
		};
	};

	function getNrKartoteki(vehicleId, baseUrl) {
		const url = baseUrl + '/api/vehicle/admin/index/' + vehicleId;
		return new Promise((resolve, reject) => {
			fetch(url)
				.then(res => {
					if (!res.ok) {
						reject('Wystąpił błąd podczas pobierania nr kartoteki. Uzupełnij kartotekę ręcznie.');
					} else {
						res.text()
							.then(res => {
								let editedResponse = res.slice(res.indexOf('<tbody>'), res.indexOf('</tbody>') + 8);
								editedResponse = editedResponse.slice(editedResponse.indexOf('</td>') + 10);
								editedResponse = editedResponse.slice(0, editedResponse.indexOf('</td>'));
								editedResponse = editedResponse.slice(editedResponse.indexOf('value="') + 7, editedResponse.indexOf('">'));

								resolve(editedResponse);
							});
					};
				});
		});
	};

	function createCalibrationPoints() {

		const tanksTr = document.querySelectorAll('tr.tanks_tr:not(.deleted)');
		if (tanksTr.length > 0) { //Paliwo z Sond/Pływaka

			let index = 1;
			const all_calibration_points = [];

			for (let tr of tanksTr) {
				const tankCapacity = tr.children[2].children[0].children[2].value + ".00";
				all_calibration_points.push(["0.00", "0.00", index])
				all_calibration_points.push(["244.00", tankCapacity, index])

				index++;
			};
			return all_calibration_points;
		} else if (isChecked('spn96_c')) { //Paliwo z CAN
			let tankCapacity = "999.00";

			if ( isCanFuelAmmount() ) {
				tankCapacity = document.getElementsByName('spn96_amount')[0].value + ".00";
			};

			const all_calibration_points = [
				["0.00", "0.00", 6],
				["103.00", tankCapacity, 6]
			];

			return all_calibration_points;
		} else {
			return false;
		};
	};

	function downloadFrames(vehicleId, baseUrl, asyncCounter) {
		const dateTime = $('#kiedy2').val() + " " + $('#kiedy2hour').val() + ":" + ($('#kiedy2minute').val().length === 1 ? "0" + $('#kiedy2minute').val() : $('#kiedy2minute').val()) + ":00";
		const data = {
			"vehicleId": parseInt(vehicleId),
			"datetimeFrom": dateTime,
			"datetimeTo": ""
		};

		$.ajax({
			url: `${baseUrl}/api/vehicle/gps/ajaxReloadVehicleFrames`,
			type: "POST",
			data: data,
			success: function () {
				appendToSuccessFeed('Pobrano dane źródłowe');
				asyncCounter.next();
			},
			error: function (err) {
				console.log(err);
				alert('Wystąpił błąd podczas pobierania danych źródłowych. Spróbuj ręcznie.');
			}
		});
	};

	function synchronizeDistance(vehicleId, baseUrl, asyncCounter) {
		const distance = $('[name=stan_licznika]').val().toString();
		if(distance === '.') {
			asyncCounter.next();
			return
		}

		const data = $('#kiedy2').val().toString();
		const hour = `${$('#kiedy2hour').val().toString().length === 1 ? '0' : ''}${$('#kiedy2hour').val().toString()}`;
		const minute = `${$('#kiedy2minute').val().toString().length === 1 ? '0' : ''}${$('#kiedy2minute').val().toString()}`;

		$.ajax({
			url: `${baseUrl}/api/vehicle/data/data_exploitation/${vehicleId}`,
			type: 'POST',
			data: {
				arch_stan_licznika: distance,
				aktualizacja_licznika: data,
				date_od_h: hour,
				date_od_m: minute,
				date_od_s: '00',
			},
			success: function () {
				appendToSuccessFeed('Ustawiono dystans w Danych organizacyjnych');
				asyncCounter.next();

                if(false && document.getElementById('spn917_c').checked) {
                    $.ajax({
                        url:`${baseUrl}/api/vehicle/data/ajaxGetCounters`,
                        type: 'POST',
                        data: {
                            vehicleId: vehicleId,
                            datetime: `${data} ${hour}:${minute}:00`
                        },
                        success: function () {
                            appendToSuccessFeed('Przeprowadzono synchronizację licznika.');
                            asyncCounter.next();
                        },
                        error: function (err) {
                            console.log(err);
                            alert( JSON.parse(err.responseText).error.message );
                        }
                    })
                } else {
                    asyncCounter.next();
                }
			},
			error: function (err) {
				console.log(err);
				alert('Wystąpił błąd podczas ustawiania dystansu.');
			}
		})
	}

	function createFuelSettingsData(vehicleId, nrKartoteki) {
		const dateFrom = $('#kiedy2').val() + " 00:00";
		let dateTo = $.datepicker.parseDate('yy-mm-dd', $('#kiedy2').val());
		dateTo.setDate(dateTo.getDate() + 1);
		dateTo = $.datepicker.formatDate('yy-mm-dd', dateTo) + " 23:59";

        const probes = $('.tanks_tr').length;

		const data = {
			'comment': '',
			'pojazd_id': vehicleId,
			'pomiar_paliwa_id': ($('.tanks_tr').not('.deleted').length > 0 ? 2 : 3),
			'pojazd_admin_multi_id': nrKartoteki,
			'date_from': dateFrom,
			'date_to': dateTo,
            'data[algorithm_version]': 5,
			'data[points_to_average]': 3,
			'data[points_for_value]': 2,
			'data[alg_obroty_typ]': 2,
			'data[invoice_matching]': 3600,
			'data[fa_trust_voltage_low]': ($('#vehicle_type_id').val() == "1" ? 21 : 12),
			'data[alg_stacyjka_typ]': 1,
			'data[alg_obroty_typ]': (isChecked('spn190_c') ? 2 : 0),
			'data[alg_predkosc_typ]': (isChecked('spn84_c') ? 2 : 1),
			'data[alg_dystans_typ]': (isChecked('spn917_c') ? 3 : 0),

            'data[pojemnosc_zbiornika_1]': (probes >= 1 ? document.getElementsByName('pojemnosc[]')[0].value : 0),
            'data[rodzaj_sondy_zbiornika_1]': (probes >= 1 ? document.getElementsByName('producent_sondy[]')[0].value : 0),
            'data[zone_tank_1]': (probes >= 1 ? document.getElementsByName('pojemnosc[]')[0].value : 0),
            'data[pojemnosc_zbiornika_2]': (probes >= 2 ? document.getElementsByName('pojemnosc[]')[1].value : 0),
            'data[rodzaj_sondy_zbiornika_2]': (probes >= 2 ? document.getElementsByName('producent_sondy[]')[1].value : 0),
            'data[zone_tank_2]': (probes >= 2 ? document.getElementsByName('pojemnosc[]')[1].value : 0),
            'data[pojemnosc_zbiornika_3]': (probes >= 3 ? document.getElementsByName('pojemnosc[]')[2].value : 0),
            'data[rodzaj_sondy_zbiornika_3]': (probes >= 3 ? document.getElementsByName('producent_sondy[]')[2].value : 0),
            'data[zone_tank_3]': (probes >= 3 ? document.getElementsByName('pojemnosc[]')[2].value : 0),
            'data[pojemnosc_zbiornika_6]': (guessFuelType() === "can" ? (isCanFuelAmmount() ? document.getElementsByName('spn96_amount')[0].value : 999) : 0),
            'data[zone_tank_6]': (guessFuelType() === "can" ? (isCanFuelAmmount() ? document.getElementsByName('spn96_amount')[0].value : 999) : 0)
		};

		return data;
	};

	function fillAdministrativeData(vehicleId, nrKartoteki, baseUrl, asyncCounter) {
		const fuelType = guessFuelType();

		let minOdchylenie = 0;

        if(fuelType === "sonda") {
            minOdchylenie = 1.5;
        } else if(fuelType === "plywak") {
            minOdchylenie = 5;
        } else if(fuelType === "can") {
            minOdchylenie = 100;
        };

		let markaRejestratora = 0;
		const selectedBlackbox = $('#rodzaj_rejestratora_id').find('[selected]').text();
		if (selectedBlackbox === "Setivo") {
			markaRejestratora = 4;
		} else if (selectedBlackbox === "Albatros") {
			markaRejestratora = 7;
		} else if (selectedBlackbox === "TELTONIKA") {
			markaRejestratora = 6;
		};

		const generalData = {
			'aktywny': 1,
			'datetime_from': `${$('#kiedy2').val()} 00:00:00`,
			'datetime_to': '',
			'rodzaj_rejestratora_id': markaRejestratora,
			'typ_rejestratora_id': $('#typ_rejestratora_id').val(),
			'dscr': $('input[name=dscr]').val(),
			'nr_gsm': $('#nr_karty_sim').val(),
			'config_db_id': $('[name=config_db_id]').val(),
			'data_instalacji': $('#kiedy2').val(),
			'generuj_zdarzenia': 0,
			'stacyjka': 1,
			'sposob_gener_zdarzen': (isChecked('can_c') ? 4 : 1),
			'algorithm_version': 5,
			'gen_zdarzen_predkosc': 1,
			'wywlaszczenie_zdarzenia': 1000,
			'poprawnosc_tacho_id': (isChecked('can_c') ? 1 : 0), //Sprawdzanie poprawności pracy tachografu (0 - brak, 1 - CAN)
			'min_napiecie_stacji': ($('#vehicle_type_id').val() == "1" ? 21 : 12),
			'corector_can_speed': (isChecked('spn84_c') ? 1 : 0),
			'corector_can_rotation': (isChecked('spn190_c') ? 1 : 0),
			'paliwo_z_sondy_dyst': (isChecked('spn917_c') ? 3 : 1),
			'paliwo_z_can_dyst': (isChecked('spn917_c') ? 3 : 1),
			'niewylaczony_zaplon': 0,
			'bez_zaniku_zasilania': 1,
			'bez_zaniku_zasilania_u': 1,
			'bez_zdarzenia_jazda': 1,
			'wyjatek_brak_zasilania': ($('#vehicle_type_id').val() == "1" ? 21 : 12),
			'max_obroty_silnika': (isChecked('spn190_c') ? 2300 : 0),
			'max_obroty_silnika_przelicznik': (isChecked('spn190_c') ? 1 : 0),
			'dystans_gps_pokaz': 1,
			'dystans_gps_w_pojezdzie': 1,
			'dystans_can_pokaz': (isChecked('spn917_c') ? 1 : 0),
			'can_dystans': (isChecked('spn917_c') ? 1 : 0),
			'gen_lokalizacje': 1,
			'gen_dop_predkosci': 1,
			'wysylaj_dhl': (window.location.host === "kj.framelogic.pl" ? 1 : 0),
			'divide': 1,
			'divide_days': 90,
		};

		const fuelCapacity = tanksCapacity();

		const fuelSpecificData = {
			'pomiar_paliwa_id': ($('.tanks_tr').not('.deleted').length > 0 ? 2 : 3),
			'paliwo_z_sondy': (fuelType === "sonda" || fuelType === "plywak" ? 1 : 0),
			'paliwo_z_can': (isChecked('spn96_c') ? 1 : 0),
			'min_odchylenie': minOdchylenie,
			'prog_weryfikujacy_paliwa': (fuelType !== "can" ? litersByPercent(fuelCapacity, 3.5) : (litersByPercent(fuelCapacity, 5) > 50 ? 50 : litersByPercent(fuelCapacity, 5))),
			'prog_wartosci_paliwa': (fuelType !== "can" ? litersByPercent(fuelCapacity, 3.5) : (litersByPercent(fuelCapacity, 5) > 50 ? 50 : litersByPercent(fuelCapacity, 5))),
			'prog_weryfikujacy_paliwa_u': (fuelType !== "can" ? litersByPercent(fuelCapacity, 2) : 0),
			'prog_wartosci_paliwa_u': (fuelType !== "can" ? litersByPercent(fuelCapacity, 2) : 0),
			'ilosc_punktow_drogi': 5,
			'ilosc_punktow_drogi_u': 5,
			'odchylenie_standardowe': 1,
			'odchylenie_standardowe_u': 1,
			'liczba_przedzialow': 2,
			'liczba_przedzialow_u': 2,
			'usuwaj_pkt_zerowe': (fuelType === "can" ? 1 : 0),
            'usuwaj_pkt_zerowe_od': 0,
			'usuwaj_pkt_zerowe_do': (fuelType === "can" ? 1 : 0),
			'usuwaj2_pkt_zerowe_od': (fuelType === "can" ? 103 : 0),
			'usuwaj2_pkt_zerowe_do': (fuelType === "can" ? 109 : 0),
			'wlacz_paliwo': (fuelType !== '' ? 1 : 0),
			'rodzaj_sondy_zbiornika_1': ($('.tanks_tr').length >= 1 ? document.getElementsByName('producent_sondy[]')[0].value : 0),
			'rodzaj_sondy_zbiornika_2': ($('.tanks_tr').length >= 2 ? document.getElementsByName('producent_sondy[]')[1].value : 0),
			'rodzaj_sondy_zbiornika_3': ($('.tanks_tr').length >= 3 ? document.getElementsByName('producent_sondy[]')[2].value : 0),
			'pojemnosc_zbiornika_6': (fuelType === "can" ? (isCanFuelAmmount() ? document.getElementsByName('spn96_amount')[0].value : 999) : 0),
			'zone_tank_6': (fuelType === "can" ? (document.getElementsByName('spn96_amount')[0].value || 999) : 0),

            'strefa_niemierzalna': 0,
            'strefa_niemierzalna2': 0,
            'strefa_niemierzalna3': 0,
            'korektor_tankowania': 0,
            'korektor_upustu': 0,
            'korektor_wykresu': 0,
            'odchylenie_odniesienie': 0,
            'prog_tankowanie': 0,
            'prog_zasilania': 0,
            'weryfikuj_karty_paliwo_odchyl': 10,
            'korektor_tankowania': 0,
            'wyjatek_wyl_stacyjki': 0,
            'wyjatek_wyl_stacyjki_u': 0
		};

		const wtf = {
			'saveexitwindow': '',
			'saveexit': '',
			'norma_godzina_postoju': 0
		};

		let data = {};
		if (fuelType !== '') {
			data = {
				...generalData,
				...fuelSpecificData,
				...wtf
			};
		} else {
			data = {
				...generalData,
				...wtf
			};
		};

		$.ajax({
			url: `${baseUrl}/api/vehicle/admin/save/${vehicleId}/${nrKartoteki}`,
			type: "POST",
			data: data,
			dataType: 'text',
			success: function (res) {
				appendToSuccessFeed('Dane administracyjne');
				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				alert('Wystąpił błąd podczas uzupełniania kartoteki administracyjnej. Spróbuj ręcznie.');
			}
		});
	};

	function getVinNr(vehicleId, baseUrl, asyncCounter) {
		$.ajax({
			url: '/api/vehicle/data/ajax_getVinNumber',
			type: 'POST',
			data: {
				pojazd_id: parseInt(vehicleId)
			},
			dataType: 'json',
			success: function (result) {
				const vin = result.vin;

				if (vin != '') {
					if (vin.length == 17 && vin.match(/^[0-9a-z]+$/i)) {
						fillExtendedData(vin, vehicleId, baseUrl, asyncCounter);
					} else {
						alert('Niepoprawny numer VIN' + ': ' + vin);
						asyncCounter.next();
					};
				} else {
					asyncCounter.next();
				}

			},
			error: function () {
				asyncCounter.next();
			}
		});
	};

	function fillExtendedData(vin, vehicleId, baseUrl, asyncCounter) {
		const data = {
			'typ_pojazdu_wg_producenta_id': ($('#vehicle_type_id').val() == "1" ? 2 : ''),
			'ustawowe_rozliczanie_pojazd': ($('#kabel_d8_podlaczenie_id').val() == "5" ? 1 : ''),
			'nr_podwozia': vin
		};

		$.ajax({
			url: `${baseUrl}/api/vehicle/data/data_extended/${vehicleId}`,
			type: 'POST',
			data: data,
			dataType: 'text',
			success: function () {
				appendToSuccessFeed('Dane rozszerzone');
				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				alert('Wystąpił błąd podczas uzupełniania danych rozszerzonych. Spróbuj ręcznie.');
			}
		});
	};

    function hideSideNumber(vehicleId, baseUrl, asyncCounter) {
        //If there is side number provided, dont do anything
        if($('#nr_boczny_pojazdu').val()) {
            asyncCounter.next();
            return;
        }

        let url = 'vehicle/data/data';

        const data = {
            'pokazuj_nr_rejestracyjny': 1,
            'nr_rejestracyjny': $('#nr_rejestracyjny').val(),
            'firma1_id': $('#firma1_id').val(),
            'marka_id': $('#marka_id').val(),
            'model': $('#model').val(),
            'nr_boczny_pojazdu': ''
        };

        if($('#vehicle_type_id').val() === '4') {
            data.is_trailer = 1;
            data.is_active_trailer = 1;
            data.marka_id = $('#trailer_brand_id').val();

            url = 'trailer/main/save';
        }

		$.ajax({
			url: `${baseUrl}/api/${url}/${vehicleId}`,
			type: 'POST',
			data: data,
			dataType: 'text',
			success: function () {
				appendToSuccessFeed('Odklikano pokazywanie numeru bocznego w danych podstawowych.');
				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				alert('Wystąpił błąd podczas odklikiwania numeru bocznego w danych podstawowych.');
			}
		});
    }

	function appendToSuccessFeed(message) {
		const successFeed = document.getElementById('successFeed');
		successFeed.style.display = 'block';

		successFeed.innerHTML = successFeed.innerHTML + `<p>${message}</p>`;
	};

	function tanksCapacity() {
		const tanksTr = document.querySelectorAll('tr.tanks_tr:not(.deleted)');
		if (tanksTr.length > 0) {
			let capacity = 0;
			for (let tr of tanksTr) {
				capacity += parseInt(tr.children[2].children[0].children[2].value);
			};
			return capacity
		} else {
			if (isCanFuelAmmount()) {
				return parseInt(document.getElementsByName('spn96_amount')[0].value);
			} else {
				return 999;
			};
		};
	};

	function litersByPercent(fuelCapacity, percent) {
		return Math.floor(fuelCapacity * (percent / 100));
	};

	function isChecked(id) {
		return document.getElementById(id).checked;
	};

	//Im using function instead of class for hoisting
	function Timer() {
		this.timeStart = null;
		this.timeEnd = null;

		this.start = () => {
			this.timeStart = new Date();
		};

		this.getTime = () => {
			this.timeEnd = new Date();
			return this.toSeconds(this.timeEnd - this.timeStart);
		};

		this.toSeconds = (miliseconds) => {
			const seconds = miliseconds /= 1000;
			return Math.round(seconds);
		};
	};

    function guessFuelType() {
		if (document.getElementsByClassName('tanks_tr').length > 0) {
			if (document.getElementsByClassName('tanks_tr')[0].children[2].children[1].children[2].checked) {
				return "sonda";
			} else {
				return "plywak";
			};
		} else if (isChecked('spn96_c')) {
			return "can";
		}

        return '';
	}

	function isCanFuelAmmount() {
		const ammount = document.getElementsByName('spn96_amount')[0].value;

		if(ammount && ammount !== '0') return true

		return false
	}

})();