// ==UserScript==
// @name         Kalibracja
// @namespace    https://github.com/MarcinCzajka
// @version      1.11
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


    const calibrationToolkit1 = document.getElementsByClassName('canvas-container')[0].nextElementSibling;
    if(calibrationToolkit1) {
		const newDiv =
		  `<div id='newButton1' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;float:left'>
			  <div style='position:absolute;width:27px;height:27px;float:left;left:0px;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
			  <div style='position:absolute;width:50%;height:27px;right:0px;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
		   </div>
		   <input id="newTextbox1" type"text" style="width:20px;margin:3px"></input>`;
        calibrationToolkit1.insertAdjacentHTML('beforeend', newDiv);
		
        document.getElementById("newButton1").addEventListener('click', function() {makePoints(cm1, "newTextbox1")});
		document.getElementById("newTextbox1").addEventListener('input', function() {makePoints(cm1, "newTextbox1")});
    };

    const calibrationToolkit2 = document.getElementsByClassName('canvas-container')[2].nextElementSibling;
    if(calibrationToolkit2) {
		const newDiv =
		  `<div id='newButton2' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;float:left'>
			  <div style='position:absolute;width:27px;height:27px;float:left;left:0px;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
			  <div style='position:absolute;width:50%;height:27px;right:0px;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
		   </div>
		   <input id="newTextbox2" type"text" style="width:20px;margin:3px"></input>`;
        calibrationToolkit2.insertAdjacentHTML('beforeend', newDiv);
		
        document.getElementById("newButton2").addEventListener('click', function() {makePoints(cm2, "newTextbox2")});
		document.getElementById("newTextbox2").addEventListener('input', function() {makePoints(cm2, "newTextbox2")});
		
		//Guzik do zamiany wielkości zbiorników
		const tankSwapBtn = `<input id="tankSwap" type="button" value="Zamień zbiorniki"></input>`;
		calibrationToolkit1.insertAdjacentHTML('beforeend', tankSwapBtn);
		document.getElementById("tankSwap").addEventListener('click', function() {
			const firstTankCapacity = cm1.fueltank_capacity;
			const firstTankVoltage = cm1.fueltank_voltage;
			
			cm1.fueltank_capacity = cm2.fueltank_capacity;
			cm1.fueltank_voltage = cm2.fueltank_voltage;
			
			cm2.fueltank_capacity = firstTankCapacity;
			cm2.fueltank_voltage = firstTankVoltage;
		});
    }

    const calibrationToolkit3 = document.getElementsByClassName('canvas-container')[4].nextElementSibling;
    if(calibrationToolkit3) {
		const newDiv =
		  `<div id='newButton3' style='position:relative;height:27px;width:27px;padding:0;margin:3px 0 3px 0;cursor:pointer;float:left'>
			  <div style='position:absolute;width:27px;height:27px;float:left;left:0px;background-image:url("/api/media/images/newLayout/images/under.png");background-size:27px;background-position:left top'></div>
			  <div style='position:absolute;width:50%;height:27px;right:0px;background-image:url("/api/media/images/newLayout/images/above.png");background-size:27px;background-position:right top'></div>
		   </div>
		   <input id="newTextbox3" type"text" style="width:20px;margin:3px"></input>`;
        calibrationToolkit3.insertAdjacentHTML('beforeend', newDiv);
		
        document.getElementById("newButton3").addEventListener('click', function() {makePoints(cm3, "newTextbox3")});
		document.getElementById("newTextbox3").addEventListener('input', function() {makePoints(cm3, "newTextbox3")});
    }

function makePoints(obj, textboxId) {
    let p;
    obj.removeAllPoints()
	
	const addValue = parseInt($(`#${textboxId}`).val() || 0);

    p = obj.makePoint(0, 300);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(150, 150);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(75, 225 + addValue);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(225, 75 - addValue);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(300, 0);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);

    obj.redrawScreen();
}

})();