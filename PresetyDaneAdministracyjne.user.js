	// ==UserScript==
	// @name         Presety - Dane Administracyjne
	// @namespace    https://github.com/MarcinCzajka
	// @version      2.28.8
	// @description  Dodaje buttony z gotowymi ustawieniami
	// @author       MAC
	// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/PresetyDaneAdministracyjne.user.js
	// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/PresetyDaneAdministracyjne.user.js
	// @match        */api/vehicle/admin/save/*
	// @grant        GM_getValue
	// @grant        GM_setValue
	// @grant        GM_deleteValue
	// @include      *api/vehicle/admin/save/*
	// ==/UserScript==

	(function() {
		'use strict';

		let fuelCapacity = 0;

		if(!document.getElementById('newBar')) {
			const newBar = document.createElement("td");
				newBar.setAttribute('colspan', '6');
				newBar.id = 'newBar';
			newBar.style.width = '100%';

			const inputStyling = 'style="margin-right:5px;height:25px;cursor:pointer;" type="button"';

			newBar.insertAdjacentHTML('beforeend', `<input value="Ciężarowy - Sonda"  id="truckProbe"   ${inputStyling}></input>`);
			newBar.insertAdjacentHTML('beforeend', `<input value="Ciężarowy - Pływak" id="truckFloater" ${inputStyling}></input>`);
			newBar.insertAdjacentHTML('beforeend', `<input value="osobowy - Pływak"   id="carFloater"   ${inputStyling}></input>`);
			newBar.insertAdjacentHTML('beforeend', `<input value="Odklikaj CAN" 	  id="canService"   ${inputStyling}></input>`);
			newBar.insertAdjacentHTML('beforeend', `<input value="Serwis sondy" 	  id="probeService" ${inputStyling}></input>`);
			newBar.insertAdjacentHTML('beforeend', `<input value="Nowy wątek" 	      id="newThread"    ${inputStyling}></input>`);

			$(".break")[0].children[0].append(newBar);

			document.getElementById("truckProbe").addEventListener('click', truckProbe);
			document.getElementById("truckFloater").addEventListener('click', truckFloater);
			document.getElementById("carFloater").addEventListener('click', carFloater);
			document.getElementById("canService").addEventListener('click', canServicePreset);
			document.getElementById("probeService").addEventListener('click', probeServicePreset);
			document.getElementById("newThread").addEventListener('click', createNewThread);

		}

		function truckProbe(e) {
			e.preventDefault();
			generalSettings(e.target.id);
			generalTruckSettings();

			$('#pomiar_paliwa_id').select2('val', 2).trigger('change.select2');
			click("#paliwo_z_sondy");

			$("#min_odchylenie").val(1.5);

			$("#prog_weryfikujacy_paliwa").val(litersByPercent(3.5));
			$("#prog_wartosci_paliwa").val(litersByPercent(3.5));
			$("#prog_weryfikujacy_paliwa_u").val(litersByPercent(2));
			$("#prog_wartosci_paliwa_u").val(litersByPercent(2));

			usuwajPunktyZerowe(false);
		}

		function truckFloater(e) {
			e.preventDefault();
			generalSettings(e.target.id);
			generalTruckSettings();

			$('#pomiar_paliwa_id').select2('val', 3).trigger('change.select2');
			unclick("#paliwo_z_sondy");

			$("#min_odchylenie").val(100);

			const percentOfFuel = litersByPercent(5);
			$("#prog_weryfikujacy_paliwa").val((percentOfFuel > 50 ? 50 : percentOfFuel));
			$("#prog_wartosci_paliwa").val((percentOfFuel > 50 ? 50 : percentOfFuel));
			$("#prog_weryfikujacy_paliwa_u").val(0);
			$("#prog_wartosci_paliwa_u").val(0);

			usuwajPunktyZerowe(true);
		}

		function generalTruckSettings() {
			$("#min_napiecie_stacji").val(21);
			$("#s2id_poprawnosc_tacho_id").select2('val', 1);
			$("#s2id_paliwo_z_sondy_dyst").select2('val', 3);
			$("#s2id_paliwo_z_can_dyst").select2('val', 3);
			$("#wyjatek_brak_zasilania").val(21);

			click("#paliwo_z_can");
			click("#dystans_can_pokaz");
			click("#can_dystans");

			$("#max_obroty_silnika").val(2300);
			$("#max_obroty_silnika_przelicznik").val(1);

			click("#sposob_gener_zdarzen4");
			click("#rejestruj_obroty2");
			click("#tachometr_w_pojezdzie3");
			click("#gen_zdarzen_predkosc1");

			if(!fuelCapacity) {
				const fallbackCapacity = 999

				$('#pojemnosc_zbiornika_6').val(fallbackCapacity);
				$('#zone_tank_6').val(fallbackCapacity);
				fuelCapacity = fallbackCapacity;
			}
		}

		function carFloater(e) {
			e.preventDefault();
			generalSettings(e.target.id);
			generalCarSettings();

			$('#pomiar_paliwa_id').select2('val', 3).trigger('change.select2')

            const blackboxType = $('#rodzaj_rejestratora_id').val();
            if(blackboxType === '6' || blackboxType === '7') {
                click("#paliwo_z_sondy");
            } else {
                unclick("#paliwo_z_sondy");
            }

			$("#min_odchylenie").val(5);

			$("#prog_weryfikujacy_paliwa").val(litersByPercent(10));
			$("#prog_wartosci_paliwa").val(litersByPercent(10));
			$("#prog_weryfikujacy_paliwa_u").val(0);
			$("#prog_wartosci_paliwa_u").val(0);

			usuwajPunktyZerowe(true);
		}

		function generalCarSettings() {
            unclick('#corector_can_distance');

			$("#min_napiecie_stacji").val(12);
			$("#s2id_poprawnosc_tacho_id").select2('val', 1);
			$("#s2id_paliwo_z_sondy_dyst").select2('val', 3);
			$("#s2id_paliwo_z_can_dyst").select2('val', 3);
			click("#paliwo_z_can");
			$("#wyjatek_brak_zasilania").val(12);

			$("#max_obroty_silnika").val(5000);
			$("#max_obroty_silnika_przelicznik").val(1);

			click("#dystans_can_pokaz");
			click("#can_dystans");
		}

		function usuwajPunktyZerowe(bool) {
			if (bool) {
				click('#usuwaj_pkt_zerowe');
				$('#usuwaj_pkt_zerowe_do').val(1);
				$('#usuwaj2_pkt_zerowe_od').val(103);
				$('#usuwaj2_pkt_zerowe_do').val(109);
			} else {
				unclick('#usuwaj_pkt_zerowe');
				$('#usuwaj_pkt_zerowe_do').val(0);
				$('#usuwaj2_pkt_zerowe_od').val(0);
				$('#usuwaj2_pkt_zerowe_do').val(0);
			}
		}

		function generalSettings(targetElement) {

            flashButton(targetElement);

			//Wersja algorytmu
			$('[name=algorithm_version').select2('val', 5);

			$("#wywlaszczenie_zdarzenia").val(1000);

			fuelCapacity = 0;
			for(let i = 1; i <= 6; i++) {
				$("#zone_tank_" + i).val($("#pojemnosc_zbiornika_" + i).val());
				fuelCapacity += +$("#pojemnosc_zbiornika_" + i).val();
			}

			$("#ilosc_punktow_drogi").val(5);
			$("#ilosc_punktow_drogi_u").val(5);
			$("#odchylenie_standardowe").val(1);
			$("#odchylenie_standardowe_u").val(1);
			$("#liczba_przedzialow").val(2);
			$("#liczba_przedzialow_u").val(2);

            unclick("#niewylaczony_zaplon");
			click("#bez_zaniku_zasilania");
			click("#bez_zaniku_zasilania_u");
			click("#bez_zdarzenia_jazda");

			click("#dystans_gps_pokaz");
			click("#dystans_gps_w_pojezdzie");

			click("#wlacz_paliwo");
			click("#gen_lokalizacje");
			click("#gen_dop_predkosci");
			click("#divide");
			$("#divide_days").val(90);

			if(window.location.host === "kj.framelogic.pl") {
				click("#wysylaj_dhl");
			}
		}

		function canServicePreset(e) {
			e.preventDefault();

			flashButton(e.target.id);

			$("#sposob_gener_zdarzen1").click();
			$("#rejestruj_obroty0").click();
			$("#tachometr_w_pojezdzie0").click();
			$("#gen_zdarzen_predkosc1").click();

			$("#s2id_poprawnosc_tacho_id").select2('val', 0);
			$("#s2id_paliwo_z_sondy_dyst").select2('val', 1);
			$("#s2id_paliwo_z_can_dyst").select2('val', 1);

			unclick("#paliwo_z_can");
			unclick("#dystans_can_pokaz");
			unclick("#can_dystans");
		}

		function probeServicePreset(e) {
			e.preventDefault();

			flashButton(e.target.id);

			unclick("#paliwo_z_sondy");
			unclick("#divide");

			$("#min_odchylenie").val(100);

			fuelCapacity = getFuelCapacity();

			$("#prog_weryfikujacy_paliwa").val(9999);
			$("#prog_wartosci_paliwa").val(fuelCapacity / 4);
			$("#prog_weryfikujacy_paliwa_u").val(9999);
			$("#prog_wartosci_paliwa_u").val(9999);
		}

		function click(element) {
			if(!$(element)[0].checked) $(element).click();
		}

		function unclick(element) {
			if($(element)[0].checked) $(element).click();
		}

		function litersByPercent(percent) {
			return Math.floor(fuelCapacity * (percent / 100));
		}

		function flashButton(id) {
			$(`#${id}`).fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });
		}

		function getFuelCapacity() {
			let result = 0;

			for(let i = 1; i <= 6; i++) {
				result += +$("#pojemnosc_zbiornika_" + i).val();
			}

			return result
		}


	//Automatyczne zakładanie wątku
	const nrRejestracyjny = $("#bottom_header")[0].children[1].children[0].innerHTML.trim();
		const date = new Date
		const newVar = `${nrRejestracyjny}/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

		function createNewThread(e) {
			e.preventDefault();
			flashButton(e.target.id);

			if ($("input[name=datetime_to]").val() === "") {
				alert('Wprowadź datę zamknięcia obecnego wątku.');
			} else {
				GM_setValue(newVar, 'save');
				$(".save")[0].click();
			}
		}

		if(GM_getValue(newVar) === 'new') {
			let newDate = new Date($("input[name=datetime_to]").val());

			$("input[name=datetime_from]").val(incrementDate(newDate));
			$("input[name=datetime_to]").val('');
			GM_deleteValue(newVar);
			$(".save")[0].click();
		}

		if(GM_getValue(newVar) === 'save') {
			GM_setValue(newVar, 'new');
			$(".new_button")[0].click();
		}

		function incrementDate(date) {
			let d = date;
			d.setSeconds(d.getSeconds() + 1)

			let day = d.getDate();
			let month = d.getMonth() + 1;
			let year = d.getFullYear();

			if(day < 10) day = "0"+day;
			if(month < 10) month = "0"+month;

			return `${year}-${month}-${day} ${d.toLocaleTimeString()}`
		}

	})();
