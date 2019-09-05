// ==UserScript==
// @name         Kalibracja
// @namespace    https://github.com/MarcinCzajka
// @version      1.3
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
        }
        else {

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
	
	const calibrationToolkit = document.getElementsByClassName('canvas-container')[0].nextElementSibling;

function makePoints(obj) {
    let p;
    obj.removeAllPoints()

    p = obj.makePoint(150, 150);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(75, 225);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);
    p = obj.makePoint(225, 75);
					obj.points.push(p);
					obj.points.sort(compare);
					obj.canvas.add(p);

    obj.redrawScreen();
}

})();