// ==UserScript==
// @name         Kalibracja
// @namespace    https://github.com/MarcinCzajka
// @version      1.16
// @description  Kalibracja
// @author       MAC
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

	const nrOfCalibrationWindows = document.getElementsByClassName('canvas-container').length / 2;

	for(let i = 1; i <= nrOfCalibrationWindows; i++) {
		createInsertpointsButton(i);
	};

	if(nrOfCalibrationWindows > 1) {
		//Guzik do zamiany wielkości zbiorników
		const tankSwapBtn = `<input id="tankSwap" type="button" value="Zamień zbiorniki" style="padding:5px;height:25px;float:right;margin:5px;cursor:pointer;"></input>`;
		calibrationToolkit1.insertAdjacentHTML('beforeend', tankSwapBtn);

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
		  `<div id='newButton${index}' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;float:left'>
			  <div style='position:absolute;width:27px;height:27px;float:left;left:0px;border:1px solid #50C8BB;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
			  <div style='position:absolute;width:50%;height:27px;right:-2px;border:1px solid #50C8BB;border-left:0;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
		   </div>
		   <input id="newTextbox${index}" type"text" style="width:20px;margin:3px;border:1px solid #50C8BB;"></input>`;

        console.log(index, (index * 2))
        document.getElementsByClassName('canvas-container')[(index * 2) -2].nextElementSibling.insertAdjacentHTML('beforeend', newDiv);

		let calibrationManager;
		if(index === 1) calibrationManager = cm1;
		if(index === 2) calibrationManager = cm2;
		if(index === 3) calibrationManager = cm3;

        document.getElementById(`newButton${index}`).addEventListener('click', function() {makePoints(calibrationManager, `newTextbox${index}`)});
		document.getElementById(`newTextbox${index}`).addEventListener('input', function() {makePoints(calibrationManager, `newTextbox${index}`)});
		document.getElementById(`newTextbox${index}`).addEventListener('click', function() {
			this.value = "";
		});
	};

function makePoints(obj, textboxId) {
    let p;
    obj.removeAllPoints()

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
}

})();