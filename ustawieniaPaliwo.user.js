// ==UserScript==
// @name         Kalibracja-Ustawienia
// @namespace    https://github.com/MarcinCzajka
// @version      1.2
// @description  Kalibracja
// @author       MAC
// @match        */api/fuel/main/settings/*
// @grant        none
// @include      */api/fuel/main/settings/*
// ==/UserScript==

(function() {
    'use strict';
	
	const truckBtn = document.getElementById('bottom_header').children[0].children[0].children[0].insertAdjacentHTML('beforeend', '<td><input style="height:23px;width:75px;padding:0;border-radius:10px;background:#929DA7" type="button" value="Ciężarowy" id="truckBtn"></input></td>');
	document.getElementById("truckBtn").addEventListener('click', truckSettings);
	
	function truckSettings() {
			$('#invoice_matching').select2('val', 3600).trigger('change.select2');
		
			$('#alg_stacyjka_typ1').click();
			$('#alg_obroty_typ2').click();
			$('#alg_predkosc_typ2').click();
			$('#alg_dystans_typ3').click();
			
			$('#fa_trust_voltage_low').val(21);
			$('#fa_trust_rpm_low').val(0);
			$('#fa_trust_speed_low').val(0);
			
			$('#truckBtn').fadeTo(100, 0.5, function() { $(this).fadeTo(350, 1.0); });
	}
	
})();