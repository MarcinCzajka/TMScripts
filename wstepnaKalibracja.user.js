// ==UserScript==
// @name         Wstępna kalibracja pojazdu
// @namespace    https://github.com/MarcinCzajka
// @version      2.28.18
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

	//Create global variables of status icons
	const svgSize = '1.8em';
	const defaultSvg = `<svg style="color: #dea524" width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="currentColor">
		<path fill-rule="evenodd" d="M8 15A6 6 0 1 0 8 3a6 6 0 0 0 0 12zm0 1A7 7 0 1 0 8 2a7 7 0 0 0 0 14z"/>
		<path fill-rule="evenodd" d="M8 4.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.053.224l-1.5 3a.5.5 0 1 1-.894-.448L7.5 8.882V5a.5.5 0 0 1 .5-.5z"/>
		<path d="M.86 5.387A2.5 2.5 0 1 1 4.387 1.86 8.035 8.035 0 0 0 .86 5.387zM11.613 1.86a2.5 2.5 0 1 1 3.527 3.527 8.035 8.035 0 0 0-3.527-3.527z"/>
		<path fill-rule="evenodd" d="M11.646 14.146a.5.5 0 0 1 .708 0l1 1a.5.5 0 0 1-.708.708l-1-1a.5.5 0 0 1 0-.708zm-7.292 0a.5.5 0 0 0-.708 0l-1 1a.5.5 0 0 0 .708.708l1-1a.5.5 0 0 0 0-.708zM5.5.5A.5.5 0 0 1 6 0h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
		<path d="M7 1h2v2H7V1z"/>
	</svg>`;
	const positiveSvg = `<svg style="color: green" width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="currentColor">
		<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
		<path fill-rule="evenodd" d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.236.236 0 0 1 .02-.022z"/>
		</svg>`;
	const neutralSvg = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="currentColor">
		<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
		<path fill-rule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/>
	</svg>`;
	const negativeSvg = `<svg style="color: red" width="${svgSize}" height="${svgSize}" viewBox="0 0 16 16" fill="currentColor">
		<path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
		<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
	</svg>`;
  	const errorSvg = `<svg style="color: red; float:left" width="2.2em" height="2.2em" viewBox="0 0 16 16" fill="currentColor">
		<path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
	</svg>`;

	//Create instance of custom class Timer, declaration of which is available below. This object is used to measure Calibration time
	const timer = new Timer();
	
	const parser = new DOMParser();

	const confirmBtn = document.getElementById('confirm-trigger');
	const wasVehicleCreated = $('.vehicle-files')[0];
	const fuelSettings = {};

	const isTruck = $('#vehicle_type_id').select2('val') == "1";

	//Conditions that have to be met in order to show Calibration button
	if (confirmBtn && wasVehicleCreated && $('#type_id').val() % 2 !== 0) {
		init(confirmBtn.parentElement.parentElement.parentElement.nextElementSibling.children[1])
	} else if(wasVehicleCreated) {
		let targetElement = null;
		for(const tr of document.querySelectorAll('tr.text')) {
			if(tr.children[0].innerText.toLowerCase() === 'akcje') {
				targetElement = tr.children[1];
				break
			}
		}

		$(document).keydown(e => {
			if(e.keyCode === 17) {
				$(document).keydown(e => {
					if(e.keyCode === 192) {
						init(targetElement);
						$(document).off('keydown');
					}
				})
			}
		})
	}

	function init(targetElement) {
		if(!document.getElementById('kalibracjaWstepnaBtn')) {
			const kalibracjaWstepnaBtn = document.createElement('input');
				kalibracjaWstepnaBtn.type = "button";
				kalibracjaWstepnaBtn.id = "kalibracjaWstepnaBtn";
				kalibracjaWstepnaBtn.value = "Konfiguracja wstępna";
				kalibracjaWstepnaBtn.style = "width:150px;height:25px;padding:5px 15px;display:block;margin-top:5px";

			targetElement.appendChild(kalibracjaWstepnaBtn);
			document.getElementById('kalibracjaWstepnaBtn').addEventListener('click', kalibracjaWstepna);
		}

		createErrorFeed();
		createSuccessFeed();
	}

	function kalibracjaWstepna() {
		timer.start();

		setUpFeeds();

		const btn = document.getElementById('kalibracjaWstepnaBtn');
		btn.style.background = '#ce2305';
		btn.value = 'Working...';
		$('#kalibracjaWstepnaBtn').fadeTo(50, 0.5, function () {
			$(this).fadeTo(250, 1.0);
		});

		const baseUrl = window.location.origin;
		const vehicleId = wasVehicleCreated.dataset.pojazd_id;

		//Create counter that will measure number of tasks completed and display status to the user
		const asyncCounter = AsyncCounter(7, btn);

		//Next function calls are proper settings that use asynchronous code to communicate with Web App
		getNrKartoteki(vehicleId, baseUrl).then(async (nrKartoteki) => {
            hideSideNumber(vehicleId, baseUrl, asyncCounter);

            await createFuelSettings();

			fillAdministrativeData(vehicleId, nrKartoteki, baseUrl, asyncCounter);
			setPaliwo(vehicleId, nrKartoteki, baseUrl, asyncCounter);
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

		const duration = timer.getTime()
		document.getElementById('timer').innerText = `Wypełnianie protokołu zajęło: ${duration} sekund${duration < 5 ? (duration === 1 ? 'ę' : 'y') : ''}`;

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
		const all_calibration_points = fuelSettings.callibrationPoints;

		if (all_calibration_points) { //Jeżeli są zaklikane sondy albo paliwo z CAN
			//Kalibracja paliwa
			const url = `${baseUrl}/api/fuel/main/calibration/${vehicleId}/${nrKartoteki}`;
			$.ajax({
				url: `${baseUrl}/api/fuel/main/calibrationsave/${vehicleId}/${nrKartoteki}`,
				type: "POST",
				data: {
					'data': all_calibration_points,
					'comment': 'Kalibracja wstępna'
				},
				dataType: 'text',
				success: function () {
					setSuccessFeed('Kalibracja paliwa', positiveSvg, url)
					asyncCounter.next()
				},
				error: function (err) {
					console.log(err);
					setSuccessFeed('Kalibracja paliwa', negativeSvg, url)
					displayError('Wystąpił błąd podczas kalibracji paliwa. Spróbuj ręcznie.');
					asyncCounter.next()
				}
			});

			//ustawienia paliwa
			const feedbackUrl = `${baseUrl}/api/fuel/main/settings/${vehicleId}/${nrKartoteki}`;
			const data = createFuelSettingsData(vehicleId, nrKartoteki);
			$.ajax({
				url: `${baseUrl}/api/fuel/main/settingssave`,
				type: "POST",
				data: data,
				dataType: 'text',
				success: function () {
					setSuccessFeed('Kalibracja paliwa: Ustawienia', positiveSvg, feedbackUrl)
					asyncCounter.next()
				},
				error: function (err) {
					console.log(err);
					setSuccessFeed('Kalibracja paliwa: Ustawienia', negativeSvg, feedbackUrl)
					displayError('Wystąpił błąd podczas zmiany ustawień paliwa. Spróbuj ręcznie.');
					asyncCounter.next()
				}
			});
		} else {
			setSuccessFeed('Kalibracja paliwa', neutralSvg)
			setSuccessFeed('Kalibracja paliwa: Ustawienia', neutralSvg)
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
					//Convert server response to text and check if dom contains warning about missing MFV
                    res.text()
                        .then(res => {
						const doc = parser.parseFromString(res, 'text/html');

						let isInvoiceOk = true;

                        for(const element of doc.getElementsByTagName('a')) {
                            if(element.textContent === 'Moduł FV') {
                                if(element.children.length) {
									isInvoiceOk = false;
									displayError(`Uzupełnij MFV: ${element.children[0].title}`)
								}
                                break;
                            }
						}

						setSuccessFeed('Aktywność MFV', (isInvoiceOk ? positiveSvg : negativeSvg), `${baseUrl}/api/vehicle/invoice/index/${vehicleId}`)

                        resolve(doc.querySelector('td.datatable_datetime_from').getAttribute('value'));

                    })
                }
            })
        })
    }

	function createCallibrationPoints() {
		if (fuelSettings.fuelType === 'sonda' || fuelSettings.fuelType === 'plywak') {

			let index = 1;
			const all_calibration_points = [];

			for (let tr of document.querySelectorAll('tr.tanks_tr:not(.deleted)')) {
				const tankCapacity = tr.children[2].children[0].children[2].value + ".00";
				all_calibration_points.push(["0.00", "0.00", index])
				all_calibration_points.push(["244.00", tankCapacity, index])

				index++;
			};
			return all_calibration_points;
		} else if (fuelSettings.fuelType === 'can') { //Paliwo z CAN

			const all_calibration_points = [
				["0.00", "0.00", 6],
				["103.00", fuelSettings.totalCapacity + ".00", 6]
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

		const feedbackUrl = `${baseUrl}/api/vehicle/gps/index/${vehicleId}`;

		$.ajax({
			url: `${baseUrl}/api/vehicle/gps/ajaxReloadVehicleFrames`,
			type: "POST",
			data: data,
			success: function () {
				setSuccessFeed('Pobrano dane źródłowe', positiveSvg, feedbackUrl)
				asyncCounter.next()
			},
			error: function (err) {
				const errorMessage = JSON.parse(err.responseText).error.message;
				setSuccessFeed('Pobrano dane źródłowe', negativeSvg, feedbackUrl)
				displayError(errorMessage);
				asyncCounter.next()
			}
		});
	};

	function synchronizeDistance(vehicleId, baseUrl, asyncCounter) {
		const url = `${baseUrl}/api/vehicle/data/data_exploitation/${vehicleId}`;

		const distance = $('[name=stan_licznika]').val().toString();
		if(!distance || distance === '.') {
			setSuccessFeed('Ustawiono dystans w Danych eksploatacyjnych', neutralSvg, url)
			asyncCounter.next();
			return
		}

		const data = $('#kiedy2').val().toString();
		const hour = `${$('#kiedy2hour').val().toString().length === 1 ? '0' : ''}${$('#kiedy2hour').val().toString()}`;
		const minute = `${$('#kiedy2minute').val().toString().length === 1 ? '0' : ''}${$('#kiedy2minute').val().toString()}`;

		$.ajax({
			url: url,
			type: 'POST',
			data: {
				arch_stan_licznika: distance,
				aktualizacja_licznika: data,
				date_od_h: hour,
				date_od_m: minute,
				date_od_s: '00',
			},
			success: function () {
				setSuccessFeed('Ustawiono dystans w Danych eksploatacyjnych', positiveSvg, url)
				asyncCounter.next();

				/*As of now i believe i cant synchronize distance because frames are being downloaded/processed by server.
				If data is there this function would properly synchronise distance.*/

                /*if(document.getElementById('spn917_c').checked) {
                    $.ajax({
                        url:`${baseUrl}/api/vehicle/data/ajaxGetCounters`,
                        type: 'POST',
                        data: {
                            vehicleId: vehicleId,
                            datetime: `${data} ${hour}:${minute}:00`
                        },
                        success: function () {
							setSuccessFeed('Przeprowadzono synchronizację licznika', positiveSvg);
                            asyncCounter.next();
                        },
                        error: function (err) {
                            console.log(err);
							displayError( JSON.parse(err.responseText).error.message );
							asyncCounter.next()
                        }
                    })
                } else {
                    asyncCounter.next();
                }*/
			},
			error: function (err) {
				console.log(err);
				setSuccessFeed('Ustawiono dystans w Danych eksploatacyjnych', negativeSvg, url)
				displayError('Wystąpił błąd podczas ustawiania dystansu.');
				asyncCounter.next()
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
			'data[fa_trust_voltage_low]': (isTruck ? 21 : 12),
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
            'data[pojemnosc_zbiornika_6]': (fuelSettings.fuelType === 'can' ? fuelSettings.totalCapacity : 0),
            'data[zone_tank_6]': (fuelSettings.fuelType === 'can' ? fuelSettings.totalCapacity : 0)
		};

		return data;
	};

	 function fillAdministrativeData(vehicleId, nrKartoteki, baseUrl, asyncCounter) {
		const fuelType = fuelSettings.fuelType;

		let minOdchylenie = 0;

        if(fuelType === "sonda") {
            minOdchylenie = 1.5;
        } else if(fuelType === "plywak") {
            minOdchylenie = 5;
        } else if(fuelType === "can" && isTruck) {
            minOdchylenie = 100;
        } else if(fuelType === "can") {
			minOdchylenie = 5;
		}

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
			'datetime_from': `${$('#kiedy2').val().toString()} 00:00:00`,
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
			'min_napiecie_stacji': (isTruck ? 21 : 12),
			'corector_can_speed': (isChecked('spn84_c') ? 1 : 0),
			'corector_can_rotation': (isChecked('spn190_c') ? 1 : 0),
			'paliwo_z_sondy_dyst': (isChecked('spn917_c') ? 3 : 1),
			'paliwo_z_can_dyst': (isChecked('spn917_c') ? 3 : 1),
			'niewylaczony_zaplon': 0,
			'bez_zaniku_zasilania': 1,
			'bez_zaniku_zasilania_u': 1,
			'bez_zdarzenia_jazda': 1,
			'wyjatek_brak_zasilania': (isTruck ? 21 : 12),
			'max_obroty_silnika': (isChecked('spn190_c') ? (isTruck ? 2300 : 5000) : 0),
			'max_obroty_silnika_przelicznik': (isChecked('spn190_c') ? 1 : 0),
			'dystans_gps_pokaz': 1,
			'dystans_gps_w_pojezdzie': 1,
			'dystans_can_pokaz': (isChecked('spn917_c') ? 1 : 0),
			'can_dystans': (isChecked('spn917_c') ? 1 : 0),
			'gen_lokalizacje': 1,
			'gen_dop_predkosci': 1,
			'wysylaj_dhl': (window.location.host.indexOf('kj') === 0 ? 1 : 0),
			'divide': 1,
			'divide_days': 90,
		};

		const fuelSpecificData = {
			'pomiar_paliwa_id': ($('.tanks_tr').not('.deleted').length > 0 ? 2 : 3),
			'paliwo_z_sondy': (fuelType === "sonda" || fuelType === "plywak" || !isTruck ? 1 : 0),
			'paliwo_z_can': (isChecked('spn250_c') || (!isTruck && markaRejestratora !== 4) ? 1 : 0),
			'min_odchylenie': minOdchylenie,
			'prog_weryfikujacy_paliwa': (fuelType !== "can" ? litersByPercent(fuelSettings.totalCapacity, 3.5) : (litersByPercent(fuelSettings.totalCapacity, 5) > 50 ? 50 : litersByPercent(fuelSettings.totalCapacity, 5))),
			'prog_wartosci_paliwa': (fuelType !== "can" ? litersByPercent(fuelSettings.totalCapacity, 3.5) : (litersByPercent(fuelSettings.totalCapacity, 5) > 50 ? 50 : litersByPercent(fuelSettings.totalCapacity, 5))),
			'prog_weryfikujacy_paliwa_u': (fuelType !== "can" ? litersByPercent(fuelSettings.totalCapacity, 2) : 0),
			'prog_wartosci_paliwa_u': (fuelType !== "can" ? litersByPercent(fuelSettings.totalCapacity, 2) : 0),
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
			'pojemnosc_zbiornika_6': (fuelType === "can" ? (isCanFuelAmmount() ? document.getElementsByName('spn96_amount')[0].value : fuelSettings.totalCapacity) : 0),
			'zone_tank_6': (fuelType === "can" ? (document.getElementsByName('spn96_amount')[0].value || fuelSettings.totalCapacity) : 0),

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

		const url = `${baseUrl}/api/vehicle/admin/save/${vehicleId}/${nrKartoteki}`;

		$.ajax({
			url: url,
			type: "POST",
			data: data,
			dataType: 'text',
			success: function (res) {
				const doc = parser.parseFromString(res, 'text/html');

				const error = doc.querySelector('#info.error');
				if(error) {
					setSuccessFeed('Dane administracyjne', negativeSvg, url);
					displayError(error.innerText);
				} else {
					setSuccessFeed('Dane administracyjne', positiveSvg, url)
				}

				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				setSuccessFeed('Dane administracyjne', negativeSvg, url)
				displayError('Wystąpił błąd podczas uzupełniania kartoteki administracyjnej. Spróbuj ręcznie.');
				asyncCounter.next()
			}
		});
	};

	function getVinNr(vehicleId, baseUrl, asyncCounter) {
		const extendedDataUrl = `${baseUrl}/api/vehicle/data/data_extended/${vehicleId}`;

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
						fillExtendedData(vin, extendedDataUrl, asyncCounter);
					} else {
						setSuccessFeed('Dane rozszerzone', negativeSvg, extendedDataUrl)
						displayError('Niepoprawny numer VIN: ' + vin);
						asyncCounter.next()
					};
				} else {
					setSuccessFeed('Dane rozszerzone', neutralSvg, extendedDataUrl);
					asyncCounter.next();
				}

			},
			error: function () {
				setSuccessFeed('Dane rozszerzone', negativeSvg, extendedDataUrl)
				displayError('Wystąpił problem podczas pobierania VIN')
				asyncCounter.next()
			}
		});
	};

	function fillExtendedData(vin, url, asyncCounter) {
		const data = {
			'typ_pojazdu_wg_producenta_id': ($('#vehicle_type_id').val() == "1" ? 2 : ''),
			'ustawowe_rozliczanie_pojazd': ($('#kabel_d8_podlaczenie_id').val() == "5" ? 1 : ''),
			'nr_podwozia': vin
		};

		$.ajax({
			url: url,
			type: 'POST',
			data: data,
			dataType: 'text',
			success: function () {
				setSuccessFeed('Dane rozszerzone', positiveSvg, url)
				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				setSuccessFeed('Dane rozszerzone', negativeSvg, url)
				displayError('Wystąpił błąd podczas uzupełniania danych rozszerzonych. Spróbuj ręcznie.');
				asyncCounter.next()
			}
		});
	};

    function hideSideNumber(vehicleId, baseUrl, asyncCounter) {
		const isTrailer = $('#vehicle_type_id').val() === '4' ? true : false;
		const feedbackUrl = `${baseUrl}/api/${isTrailer ? 'trailer/main/save' : 'vehicle/data/data'}/${vehicleId}`;

        //If there is side number provided, dont do anything
        if($('#nr_boczny_pojazdu').val()) {
			setSuccessFeed('Odklikano pokazywanie numeru bocznego', neutralSvg, feedbackUrl)
            asyncCounter.next();
            return;
        }

        const data = {
            'pokazuj_nr_rejestracyjny': 1,
            'nr_rejestracyjny': $('#nr_rejestracyjny').val(),
            'firma1_id': $('#firma1_id').val(),
            'marka_id': $('#marka_id').val(),
            'model': $('#model').val(),
            'nr_boczny_pojazdu': ''
        };

        if(isTrailer) {
            data.is_trailer = 1;
            data.is_active_trailer = 1;
            data.marka_id = $('#trailer_brand_id').val();
		}

		$.ajax({
			url: feedbackUrl,
			type: 'POST',
			data: data,
			dataType: 'text',
			success: function () {
				setSuccessFeed('Odklikano pokazywanie numeru bocznego', positiveSvg, feedbackUrl)
				asyncCounter.next()
			},
			error: function (err) {
				console.log(err);
				setSuccessFeed('Odklikano pokazywanie numeru bocznego', negativeSvg, feedbackUrl)
				displayError('Wystąpił błąd podczas odklikiwania numeru bocznego w danych podstawowych.');
				asyncCounter.next()
			}
		});
	}

	function createSuccessFeed() {
		if(document.getElementById('successFeed')) return

		const successFeed = document.createElement('table');
			successFeed.id = 'successFeed';
			successFeed.style.textAlign = 'center';
			successFeed.style.whiteSpace = 'nowrap';
			successFeed.style.marginLeft = '20em';
			successFeed.classList.add('table', 'table-sm')

		successFeed.innerHTML = `
			<thead>
				<tr>
					<th scope="col">Action</th>
					<th scope="col">Completion</th>
					<th scope="col">Link</th>
				</tr>
			</thead>
			<tbody id='successFeedBody'>
			</tbody>
		`;

		const createVehicleTr = document.getElementById('confirm-trigger').parentElement.parentElement.parentElement.nextElementSibling;

		const newTr = document.createElement('tr');
			newTr.innerHTML = `<td colspan="6"></td>`;
			newTr.style.display = 'none';
			newTr.id = "successFeedTr";

		createVehicleTr.insertAdjacentElement('afterend', newTr);
		newTr.children[0].appendChild(successFeed);

		addNewAction('Odklikano pokazywanie numeru bocznego', 'Dane podstawowe')
        addNewAction('Dane rozszerzone', 'Dane rozszerzone')
        addNewAction('Ustawiono dystans w Danych eksploatacyjnych', 'Dane eksploatacyjne')
        addNewAction('Dane administracyjne', 'Dane administracyjne')
        addNewAction('Pobrano dane źródłowe', 'Dane źródłowe')
		addNewAction('Kalibracja paliwa', 'Kalibracja paliwa')
        addNewAction('Kalibracja paliwa: Ustawienia', 'Ustawienia paliwa')
		addNewAction('Aktywność MFV', 'Moduł faktur VAT')

		//Create link to Map
		const mapLinkTr = document.createElement('tr');
		mapLinkTr. innerHTML = `<th colspan="3" scope="row"><a target="_blank" style="font-size: 1em" href="${window.location.origin}/api/main#/api/map/leaflet/index/${$('#grupa_pojazdow_id').select2('val')}">Link do mapy</a></th>`;
		document.getElementById('successFeedBody').appendChild(mapLinkTr);

		function addNewAction(action, linkName = '') {
			const tr = document.createElement('tr');
			tr.classList.add('successFeedAction');
			tr.innerHTML = `<td scope="row">${action.toString()}</td><td>${defaultSvg}</td><td><a href='' target="_blank" data-name="${linkName}"></a></td>`;

			document.getElementById('successFeedBody').appendChild(tr);
		}

		//Create Timer
		const timer = document.createElement('p');
		timer.id = 'timer';
		timer.style.fontWeight = '600';
		document.getElementById('kalibracjaWstepnaBtn').parentElement.appendChild(timer);
	}

	function createErrorFeed() {
		if(document.getElementById('errorFeed')) return

		const errorFeed = document.createElement('table');
		errorFeed.innerHTML = '<tbody id="errorFeed"></tbody>'

		document.getElementById('kalibracjaWstepnaBtn').insertAdjacentElement('afterend', errorFeed)
	}

	function displayError(error) {
		const errorElement = document.createElement('tr');
		errorElement.innerHTML = `<th>${errorSvg}</th><td style="font-weight: 600">${error.toString()}</td>`;

		document.getElementById('errorFeed').appendChild(errorElement)
	}

	function setSuccessFeed(text, svg, url = '') {
		for(const tr of document.getElementById('successFeedBody').children) {
			if(tr.children[0].textContent.toLowerCase() === text.toLowerCase()) {
				tr.children[1].innerHTML = svg;

                if(url) {
                    const link = tr.children[2].children[0];
						link.innerText = link.dataset.name;
						link.href = url;
                }

				break
			}
		}
	}

	function setUpFeeds() {
		for(const tr of document.getElementById('successFeedBody').children) {
			if(tr.classList.contains('successFeedAction')) tr.children[1].innerHTML = defaultSvg;
		}

		document.getElementById('errorFeed').innerHTML = '';
		document.getElementById('timer').innerText = '';
		document.getElementById('successFeedTr').style.display = '';
	}

    async function createFuelSettings() {
        fuelSettings.fuelType = guessFuelType();
        if(fuelSettings.fuelType === '') return

        fuelSettings.totalCapacity = await tanksCapacity();
        fuelSettings.callibrationPoints = createCallibrationPoints();
    }

	async function tanksCapacity() {
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
                const defaultCap = isTruck ? 999 : 99;
                const result = await askForCapacity(defaultCap)

				return result ? result : defaultCap;
			};
		};
	};

    function askForCapacity(defaultCap) {
		//if fuel capacity is not provided ask user if he wants to provide it
        return new Promise((resolve, reject) => {
            fl_confirm_input(`Brak pojemności zbiorników.\nPodaj własną wartość lub zostanie przyjęta wartość ${defaultCap}l`, answer => { resolve(+answer) }, () => { reject(+defaultCap) });
        })
    }

	function litersByPercent(fuelCapacity, percent) {
		return Math.floor(fuelCapacity * (percent / 100));
	};

	function isChecked(id) {
		return document.getElementById(id).checked;
	};

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
		}
	}

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