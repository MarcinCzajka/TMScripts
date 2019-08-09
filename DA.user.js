	// ==UserScript==
	// @name         Presety - Dane Administracyjne
	// @namespace    http://tampermonkey.net/
	// @version      2.7
	// @description  try to take over the world!
	// @author       MAC
	// @match        */api/vehicle/admin/save/*
	// @grant        GM_getValue
	// @grant        GM_setValue
	// @grant        GM_deleteValue
	// @include      *api/vehicle/admin/save/*
	// ==/UserScript==

	(function() {
		'use strict';

	//2019-08-07
	
		let fuelCapacity = 0;

		const newBar = document.createElement("div");
		const truckProbeButton = '<button id="truckProbe">Ciężarowy - Sonda</button>';
		const truckFloaterButton = '<button id="truckFloater">Ciężarowy - Pływak</button>';
		const carFloaterButton = '<button id="carFloater">osobowy - Pływak</button>';
		const odklikajCan = '<button id="odklikajCan">Odklikaj CAN</button>';
		const serwisSondy = '<button id="serwisSondy">Serwis sondy</button>';
		const nowyWatek = '<button id="nowyWatek">Nowy wątek</button>';

		newBar.innerHTML = `<div id="buttonDiv">${truckProbeButton}${truckFloaterButton}  |  |  | ${carFloaterButton}  |  |  |  ${odklikajCan}  |  |  | ${serwisSondy} | | | | | ${nowyWatek}</div>`;

		$(".break")[0].children[0].append(newBar);

		document.getElementById("truckProbe").addEventListener('click', truckProbe);
		document.getElementById("truckFloater").addEventListener('click', truckFloater);
		document.getElementById("carFloater").addEventListener('click', carFloater);
		document.getElementById("odklikajCan").addEventListener('click', odklikajCanFunc);
		document.getElementById("serwisSondy").addEventListener('click', serwisSondyFunc);
		document.getElementById("nowyWatek").addEventListener('click', nowyWatekFunc);

		function truckProbe(e) {
			e.preventDefault();
			uniwersalne();
			ciezarowyUniwersalne();

			$("#s2id_pomiar_paliwa_id").select2('val', 2);
			click("#paliwo_z_sondy");

			$("#min_odchylenie").val(1.5);

			$("#prog_weryfikujacy_paliwa").val(litersByPercent(3.5));
			$("#prog_wartosci_paliwa").val(litersByPercent(3.5));
			$("#prog_weryfikujacy_paliwa_u").val(litersByPercent(2));
			$("#prog_wartosci_paliwa_u").val(litersByPercent(2));
		}

		function truckFloater(e) {
			e.preventDefault();
			uniwersalne();
			ciezarowyUniwersalne();

			$("#s2id_pomiar_paliwa_id").select2('val', 3);
			unclick("#paliwo_z_sondy");

			$("#min_odchylenie").val(100);

			const percentOfFuel = litersByPercent(5);
			$("#prog_weryfikujacy_paliwa").val((percentOfFuel > 50 ? 0 : percentOfFuel));
			$("#prog_wartosci_paliwa").val((percentOfFuel > 50 ? 0 : percentOfFuel));
			$("#prog_weryfikujacy_paliwa_u").val(0);
			$("#prog_wartosci_paliwa_u").val(0);
		}

		function ciezarowyUniwersalne() {
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
			click("#gen_zdarzen_predkosc2");
		}

		function carFloater(e) {
			e.preventDefault();
			uniwersalne();
			osobowyUniwersalne();

			$("#s2id_pomiar_paliwa_id").select2('val', 3);
			unclick("#paliwo_z_sondy");

			$("#min_odchylenie").val(5);


			$("#prog_weryfikujacy_paliwa").val(litersByPercent(10));
			$("#prog_wartosci_paliwa").val(litersByPercent(10));
			$("#prog_weryfikujacy_paliwa_u").val(0);
			$("#prog_wartosci_paliwa_u").val(0);
		}

		function osobowyUniwersalne() {
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

		function uniwersalne() {
			//Wersja algorytmu
			if($("#s2id_autogen4")[0].parentNode.previousSibling.previousSibling.innerText === "Wersja algorytmu:") {
				$("#s2id_autogen4").select2('val', 4);
			}
			
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

			click("#niewylaczony_zaplon");
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

		function odklikajCanFunc(e) {
			e.preventDefault();

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

		function serwisSondyFunc(e) {
			e.preventDefault();

			unclick("#paliwo_z_sondy");
			unclick("#divide");

			$("#min_odchylenie").val(100);

			$("#prog_weryfikujacy_paliwa").val(9999);
			$("#prog_wartosci_paliwa").val(9999);
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


	//Automatyczne zakładanie wątku
	const nrRejestracyjny = $("#bottom_header")[0].children[1].children[0].innerHTML.trim();
		const date = new Date
		const newVar = `${nrRejestracyjny}/${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

		console.log(GM_getValue(newVar))

		function nowyWatekFunc(e) {
			e.preventDefault();
			GM_setValue(newVar, 'save');
			$(".save")[0].click();
		}

		if(GM_getValue(newVar) === 'new') {
			let newDate = new Date($("#zakres_do").val());

			$("#zakres_od").val(incrementDate(newDate));
			$("#zakres_do").val('');
			GM_deleteValue(newVar);
			$(".save")[0].click();
		}

		if(GM_getValue(newVar) === 'save') {
			GM_setValue(newVar, 'new');
			$(".new_button")[0].click();
		}

		function incrementDate(passedDate) {
			let d = passedDate;
			d.setDate(d.getDate() + 1);

			let day = d.getDate();
			let month = d.getMonth() + 1;
			let year = d.getFullYear();

			if(day < 10) day = "0"+day;
			if(month < 10) month = "0"+month;

			return `${year}-${month}-${day}`
		}
		
	})();
