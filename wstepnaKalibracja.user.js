// ==UserScript==
// @name         Wstępna kalibracja pojazdu
// @namespace    https://github.com/MarcinCzajka
// @version      1.0
// @description  Wstępne założenie kartoteki pojazdu
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include */api/installation*
// @exclude */api/installation/main/index/*
// ==/UserScript==

(function() {
    'use strict';

	const confirmBtn = document.getElementById('confirm-trigger');
	const wasVehicleCreated = $('.vehicle-files')[0];

	if(confirmBtn && wasVehicleCreated && $('#type_id').val() % 2 !== 0) {
		const kalibracjaWstepnaBtn = document.createElement('input');
			kalibracjaWstepnaBtn.type = "button";
			kalibracjaWstepnaBtn.id = "kalibracjaWstepnaBtn";
			kalibracjaWstepnaBtn.value = "Konfiguracja wstępna";
			kalibracjaWstepnaBtn.style = "width:150px;height:25px;padding:5px 15px;display:block;margin-top:5px";

			document.getElementById('confirm-trigger').parentElement.parentElement.parentElement.nextElementSibling.children[1].appendChild(kalibracjaWstepnaBtn);
			document.getElementById('kalibracjaWstepnaBtn').addEventListener('click', kalibracjaWstepna);
	};

	function kalibracjaWstepna() {
		const btn = document.getElementById('kalibracjaWstepnaBtn');
		btn.style.background = '#ce2305';
		btn.value = "Working...";
		$('#kalibracjaWstepnaBtn').fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });

		const baseUrl = window.location.origin;
		const vehicleId = wasVehicleCreated.dataset.pojazd_id;

		function* AsyncCounter() {
			for(let i = 1; i <= 2; i++) {
				yield i;
			}

			btn.style.background = '#28bea9';
			btn.value = "Konfiguracja wstępna";
			$('#kalibracjaWstepnaBtn').fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });
			return false;
		};
		
		const asyncCounter = AsyncCounter();

		downloadFrames(vehicleId, baseUrl, asyncCounter)

        setPaliwo(vehicleId, baseUrl, asyncCounter);
	}

    async function setPaliwo(vehicleId, baseUrl, asyncCounter) {
        const nrKartoteki = await getNrKartoteki(vehicleId, baseUrl).then((result) => {
            const all_calibration_points = createCalibrationPoints();

			if(all_calibration_points) { //Sonda
			//Kalibracja paliwa
				$.ajax({
					url: `${baseUrl}/api/fuel/main/calibrationsave/${vehicleId}/${result}`,
					type: "POST",
					data: { 'data': all_calibration_points,'comment':'Kalibracja wstępna' },
					dataType: 'text',
					success : function() {asyncCounter.next()}
				});

			//ustawienia paliwa
				const data = createFuelSettingsData(vehicleId, result);
				$.ajax({
					url: `${baseUrl}/api/fuel/main/settingssave`,
					type: "POST",
					data: data,
					dataType: 'text',
					success : function() {asyncCounter.next()}
				});
			};
        });
    };

    function getNrKartoteki(vehicleId, baseUrl) {
        const url = baseUrl + '/api/vehicle/admin/index/' + vehicleId;
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(res => {
                res.text()
                    .then(res => {
                    let editedResponse = res.slice(res.indexOf('<tbody>'), res.indexOf('</tbody>') + 8 );
                    editedResponse = editedResponse.slice(editedResponse.indexOf('</td>') + 10);
                    editedResponse = editedResponse.slice(0, editedResponse.indexOf('</td>'));
                    editedResponse = editedResponse.slice(editedResponse.indexOf('value="') + 7, editedResponse.indexOf('">'));

                    resolve(editedResponse);
                });
            });
        });
    };

    function createCalibrationPoints() {

		const tanksTr = document.getElementsByClassName('tanks_tr');

		if(tanksTr) {
			let index = 1;
			const all_calibration_points = [];

			for(let tr of tanksTr) {
				const tankCapacity = tr.children[2].children[0].children[2].value + ".00";
				all_calibration_points.push(["0.00", "0.00", index])
				all_calibration_points.push(["244.00", tankCapacity, index])

				index++;
			};

			return all_calibration_points;
		} else {
			return false;
		};
    };

	function downloadFrames(vehicleId, baseUrl, asyncCounter) {
		const dateTime = $('#kiedy2').val() + " " + $('#kiedy2hour').val() + ":" + $('#kiedy2minute').val() + ":00";
		const data = {"vehicleId":parseInt(vehicleId),"datetimeFrom":dateTime,"datetimeTo":""};

		$.ajax({
			url: `${baseUrl}/api/vehicle/gps/ajaxReloadVehicleFrames`,
			type: "POST",
			data: data,
			success : function() {asyncCounter.next()}
		});
	};

	function createFuelSettingsData(vehicleId, nrKartoteki) {
		const dateFrom = $('#kiedy2').val() + " 00:00";
		let dateTo = $.datepicker.parseDate('yy-mm-dd', $('#kiedy2').val());
		dateTo.setDate(dateTo.getDate() + 1);
		dateTo = $.datepicker.formatDate('yy-mm-dd', dateTo) + " 23:59";

		const data = {
			'comment': '',
			'pojazd_id': vehicleId,
			'pomiar_paliwa_id': 2,
			'pojazd_admin_multi_id': nrKartoteki,
			'date_from': dateFrom,
			'date_to': dateTo,
			'data[points_to_average]': 3,
			'data[alg_obroty_typ]': 2,
			'data[invoice_matching]': 3600,
			'data[fa_trust_voltage_low]': ($('#vehicle_type_id').val() == "1" ? 21 : 12),
			'data[alg_stacyjka_typ]': 1,
			'data[alg_obroty_typ]': ($('#spn190_c').val() == "1" ? 2 : 0),
			'data[alg_predkosc_typ]': ($('#spn84_c').val() == "1" ? 2 : 1),
			'data[alg_dystans_typ]': ($('#spn917_c').val() == "1" ? 3 : 0),
		};

		return data;
	};

})();