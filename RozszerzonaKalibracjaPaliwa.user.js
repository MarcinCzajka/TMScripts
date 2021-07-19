// ==UserScript==
// @name         Rozszerzona Kalibracja Paliwa
// @namespace    https://github.com/MarcinCzajka
// @version      2.0.3
// @description  Dodanie dodatkowych funkcji do kalibracji paliwa
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/RozszerzonaKalibracjaPaliwa.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/RozszerzonaKalibracjaPaliwa.user.js
// @author       MAC
// @match        */api/fuel/main/calibration/*
// @match        */api/fuel/main/chart/*
// @grant        none
// @include      */api/fuel/main/calibration/*
// ==/UserScript==

(function() {
    'use strict';

    if(!window.location.href.includes('/api/fuel/main/calibration/')) return

    window.onConfirmedEvents = function() {
        const saveCalibration = document.getElementById('save_calibration');
        saveCalibration.style.filter = 'sepia() saturate(10000%) hue-rotate(16deg)';
        saveCalibration.title = 'Wątek zawiera wyjaśnione zdarzenia';
    }

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
            $('#save_calibration').css('opacity', 1);
        };
    }

    function makePoints(obj, textboxId) {

        const addValue = parseInt($(`#${textboxId}`).val().split(' ')[0] || 0);
        const offset = parseInt($(`#${textboxId}`).val().split(' ')[1] || 0)

        const points = volvoCalibration(addValue, offset)

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
        const offsetY = (topY + (topX / 2));
        const bottomOffsetX = bottomX + (topX - offsetX);
        const bottomOffsetY = bottomY - (topX / 2);

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

//Operations on iframe
(function() {
    'use strict';

    if(window.location.href.includes('/api/fuel/main/calibration/')) return

    const iframe = document.querySelector('iframe#fuel_chart');
    const iframeWindow = iframe ? iframe.contentWindow : window;
    const iframeDocument = iframe ? iframe.contentDocument : document;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.addedNodes[0]?.classList?.contains('newDot')) {
                const newDot = mutation.addedNodes[0];
                const sizeElement = iframeDocument.querySelector('#chart canvas.dygraph-rangesel-fgcanvas');

                const newLine = iframeDocument.createElement('div');
                newLine.style = `position: absolute; pointer-events: none; border-bottom: 1px #ff5959 dashed; top: 25%; left: -${(newDot.style.left.slice(0, -2) - sizeElement.style.left.slice(0, -2)) - 10}px; width: ${sizeElement.style.width};`;

                newDot.append(newLine);
            }

        })
    })

    observer.observe(iframeDocument.querySelector('body'), {childList: true});

    //Edition will be turned off by default
    const fixBugObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(mutation.addedNodes[0]?.id === 'chart') {
                checkForConfirmedEvents();

                if(iframeDocument.getElementById('edition')?.checked) iframeDocument.getElementById('edition').click();
                fixBugObserver.disconnect();
            }
        })
    })

    fixBugObserver.observe(iframeDocument.getElementById('container'), {childList: true, subtree: true});
    //-//

    function checkForConfirmedEvents() {
        if(window.parent?.onConfirmedEvents) {
            if(iframeDocument.querySelector('img[src$="tick_green_small.png"][class^="invoice_report_status"]')) iframeWindow.parent.onConfirmedEvents()
        }
    }

    //Show advanced settings on minut key click
    $(window).keypress(({keyCode}) => {if(keyCode === 45) $('.advanced_setting').css({'display': 'inline-block'})})

})();



