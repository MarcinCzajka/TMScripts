// ==UserScript==
// @name         Kalibracja
// @namespace    https://github.com/MarcinCzajka
// @version      1.18
// @description  Kalibracja
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/Kalibracja.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/Kalibracja.user.js
// @match        */api/fuel/main/calibration/*
// @grant        none
// @include      */api/fuel/main/calibration/*
// ==/UserScript==

(function() {
    'use strict';

    let intervalCount = 1;
    const checkForConfirmedEvents = setInterval(function(){
        console.log('Scanning for events: ' + intervalCount);
        if(intervalCount > 2) clearInterval(checkForConfirmedEvents);

        const eventStatuses = $("#fuel_chart").contents().find("img.invoice_report_status");
        if(eventStatuses[0]) {
            for(let i = 0; i < eventStatuses.length; i++) {
                if(eventStatuses[i].title !== 'status w raporcie: niepotwierdzone') {
                    alert('Wątek zawiera wyjaśnione zdarzenia.');

                    clearInterval(checkForConfirmedEvents);
                    break;
                };
            };
        } else {
            const fueldropStatuses = $("#fuel_chart").contents().find("img.invoice_report_status_fueldrop");
            if(fueldropStatuses[0]) {
                for(let i = 0; i < fueldropStatuses.length; i++) {
                    if(fueldropStatuses[i].title !== 'status w raporcie: niepotwierdzone') {
                        alert('Wątek zawiera wyjaśnione zdarzenia.');

                        clearInterval(checkForConfirmedEvents);
                        break;
                    };
                };
            };
        };

        intervalCount++;
    }, 2000);
	
	

	const fueltanksCount = document.getElementsByClassName('canvas-container').length / 2;
	for(let i = 1; i <= fueltanksCount; i++) {
		createInsertpointsButton(i);
	};

	if(fueltanksCount === 2) {
		//Guzik do zamiany wielkości zbiorników
		const tankSwapBtn = `<input id="tankSwap" type="button" title="Zamień pojemność zbiorników miejscami" value="Zamień zbiorniki" style="padding:5px;height:25px;margin:5px 8px 0 auto;cursor:pointer;"></input>`;
		document.getElementById('toolkit1').insertAdjacentHTML('beforeend', tankSwapBtn);

		document.getElementById("tankSwap").addEventListener('click', function() {
			$('#tankSwap').fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });
			this.style.background = '#daa520';

			const firstTankCapacity = cm1.fueltank_capacity;

			cm1.fueltank_capacity = cm2.fueltank_capacity;

			cm2.fueltank_capacity = firstTankCapacity;

			$('#save_calibration').css('opacity', 1);
		});
    };

	function createInsertpointsButton(index) {
		const newDiv =
			`<div id='toolkit${index}' style="position: relative;display: flex;flex-direction: row;">
				<div id='newButton${index}' title='Dodaj 3 punkty' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;'>
				  <div style='position:absolute;width:27px;height:27px;left:0px;border:1px solid #50C8BB;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
				  <div style='position:absolute;width:50%;height:27px;right:-2px;border:1px solid #50C8BB;border-left:0;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
			   </div>
			   <input id="newTextbox${index}" type="text" title="Przesuń skrajne punkty o tyle punktów" style="width:20px;margin:3px;border:1px solid #50C8BB;"></input>
				<div title="Usuń punkty" id="deletePointsBtn${index}" style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 15px;cursor:pointer;'>
				  <div style='position:absolute;width:27px;height:27px;left:0px;border:1px solid #50C8BB;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:left top'></div>
				  <div style='position:absolute;width:50%;height:27px;right:-2px;border:1px solid #50C8BB;border-left:0;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:right top'></div>
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 11px;left: calc(50% - 5px);top: calc(50% - 5px);">
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 9px;left: 0;bottom: 0;">
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 9px;left: 75%;top: calc(15% - 4px);">
			   </div>
			</div>`;
			
        document.getElementsByClassName('canvas-container')[(index * 2) -2].nextElementSibling.insertAdjacentHTML('beforeend', newDiv);

		const calibrationManager = eval('cm' + index);

        document.getElementById(`newButton${index}`).addEventListener('click', function() {makePoints(calibrationManager, `newTextbox${index}`)});
		document.getElementById(`newTextbox${index}`).addEventListener('input', function() {makePoints(calibrationManager, `newTextbox${index}`)});
		document.getElementById(`newTextbox${index}`).addEventListener('click', function() {
			this.value = "";
		});
		document.getElementById(`deletePointsBtn${index}`).addEventListener('click', function() {removePoints(calibrationManager)});
	};

function makePoints(obj, textboxId) {
    
    obj.removeAllPoints();

	const addValue = parseInt($(`#${textboxId}`).val() || 0);

    obj.setPointsXY([
        [0,300],
        [75, 225 + addValue],
        [150, 150],
        [225, 75 - addValue],
        [300,0]
    ]);

    obj.redrawScreen();

	$('#save_calibration').css('opacity', 1);
};

function removePoints(obj) {
	obj.removeAllPoints();
	
	obj.setPointsXY([
        [0,300],
        [300,0]
    ]);
	
	obj.redrawScreen();
	
	$('#save_calibration').css('opacity', 1);
};

})();