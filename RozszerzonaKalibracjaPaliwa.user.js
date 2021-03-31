// ==UserScript==
// @name         Rozszerzona Kalibracja Paliwa
// @namespace    https://github.com/MarcinCzajka
// @version      1.21.2
// @description  Dodanie dodatkowych funkcji do kalibracji paliwa
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/RozszerzonaKalibracjaPaliwa.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/RozszerzonaKalibracjaPaliwa.user.js
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



	const fueltanksCount = document.getElementsByClassName('canvas-container').length / 2;
	for(let index = 1, panelsCount = 1; index <= 6; index++) {
        try {
            if (eval('cm' + index)) {
				createButtonPanel(index, panelsCount++);
            }
        } catch(err) {
            if(err.name !== 'ReferenceError') {
                console.log(err);
            }
        }
    };

    const changeVolateInput = `<input id="changeVoltage" title="Zmień napięcia dla wszystkich zbiorników" style="width:22px;margin:3px 3px 3px 14%;border:1px solid #50C8BB"></input>`
    document.getElementById('toolkit1').insertAdjacentHTML('beforeend', changeVolateInput);
    document.getElementById("changeVoltage").addEventListener('change', function(e) {setVoltageForAllTanks(e.target.value)});

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

	function createButtonPanel(index, panelsCount) {
		const newDiv =
			`<div id='toolkit${panelsCount}' style="position: relative;display: flex;flex-direction: row; height: 33px; transition: height .4s ease-in-out">
				<div id='newButton${panelsCount}' title='Dodaj 3 punkty' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;'>
				  <div style='position:absolute;width:27px;height:27px;left:0px;border:1px solid #50C8BB;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
				  <div style='position:absolute;width:50%;height:27px;right:-2px;border:1px solid #50C8BB;border-left:0;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
			   </div>
			   <input id="newTextbox${panelsCount}" type="text" title="Przesuń skrajne punkty o tyle punktów" style="width:20px;margin:3px;border:1px solid #50C8BB;"></input>
				<div title="Usuń punkty" id="deletePointsBtn${panelsCount}" style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 15px;cursor:pointer;'>
				  <div style='position:absolute;width:27px;height:27px;left:0px;border:1px solid #50C8BB;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:left top'></div>
				  <div style='position:absolute;width:50%;height:27px;right:-2px;border:1px solid #50C8BB;border-left:0;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:right top'></div>
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 11px;left: calc(50% - 5px);top: calc(50% - 5px);">
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 9px;left: 0;bottom: 0;">
					<img src="/api/media/images/newLayout/cross_red_small.png" style="position: absolute;width: 9px;left: 75%;top: calc(15% - 4px);">
			   </div>
			</div>`;

        document.getElementsByClassName('canvas-container')[(panelsCount * 2) -2].nextElementSibling.insertAdjacentHTML('beforeend', newDiv);

		const calibrationManager = eval('cm' + index);

        document.getElementById(`newButton${panelsCount}`).addEventListener('click', function() {makePoints(calibrationManager, `newTextbox${panelsCount}`)});
		document.getElementById(`newTextbox${panelsCount}`).addEventListener('input', function() {makePoints(calibrationManager, `newTextbox${panelsCount}`)});
		document.getElementById(`newTextbox${panelsCount}`).addEventListener('click', function() {
			this.value = "";
		});
		document.getElementById(`deletePointsBtn${panelsCount}`).addEventListener('click', function() {removePoints(calibrationManager)});
    };

    function setVoltageForAllTanks(val) {
        for(let i = 0; i < fueltanksCount; i++) {
            const calibrationManager = eval(`cm${i + 1}`);
            calibrationManager.showPoints();
            calibrationManager.calibrateChart([
                [0, 0],
                [Number(val), Number($('[name=fuel]')[i + (i + 1)].value)]
            ]);
            $('.fl_message').hide();
        };
    }

    function makePoints(obj, textboxId) {

        const addValue = parseInt($(`#${textboxId}`).val() || 0);

        const points = [
            [0,300],
            [75, 225 + addValue],
            [150, 150],
            [225, 75 - addValue],
            [300,0]
        ];

        setPoints(obj, points);
    };


    function setPoints(obj, points) {

        obj.removeAllPoints();
        obj.setPointsXY(points);
        obj.redrawScreen();

        $('#save_calibration').css('opacity', 1);
    };

    function volvoCalibration(value = 0, offset = 0) {

        const topX = 75 + +value;
        const topY = 225 + +value;
        const bottomX = 225 - +value;
        const bottomY = 75 - +value;
        const offsetX = (topX / 2) + +offset;
        const offsetY = (topY + (topX / 2)) - +offset;
        const bottomOffsetX = bottomX + (topX - offsetX);
        const bottomOffsetY = bottomY - (topX - offsetX);

        return [
            [0,300],
            [offsetX, offsetY],
            [topX, topY],
            [150, 150],
            [bottomX, bottomY],
            [bottomOffsetX, bottomOffsetY],
            [300,0]
        ]
    };

    function removePoints(obj) {
        setPoints(obj, [
            [0,300],
            [300,0]
        ]);
    };

})();