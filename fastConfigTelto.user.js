// ==UserScript==
// @name         Guziki konfiguracyjne telto
// @namespace    https://github.com/MarcinCzajka
// @version      2.0
// @description  Szybka konfiguracja przy użyciu buttonów
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/fastConfigTelto.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/fastConfigTelto.user.js
// @match        http://*/api/installation*
// @grant        none
// @include *.pl/session/*
// ==/UserScript==

(function() {
    'use strict';

	const basicButtonStyle = 'btn-outline-secondary';
	const buttonChecked = 'btn-success';
	const buttonCheckedInactive = 'btn-outline-success';
	const buttonCpureset = 'btn-warning';
	const buttonCpuresetInactive = 'btn-outline-warning';
	const buttonWarning = 'btn-outline-danger';

	let textbox;

	const customDiv = document.createElement('div');
	  customDiv.id = 'customDiv';
	  customDiv.style = 'display:grid; grid-template-columns: repeat(10,10%); grid-template-rows: repeat(3, auto)';

	init();

	const config = {
		'can': '',
		'configureCan': false,
		'fms': '',
		'tachocheck': '',
		'scanfms': '',
		'result': '',
		'cpureset': false,
		'frame': 1
	};

	//Append new container to inexistent (at document.ready) element. Timeout at 0 is not enough
    setTimeout(() => {
        const IMEI = document.querySelectorAll('input')[0].value;
        if(Number(IMEI) > 999999999) {
            document.getElementsByClassName('btn-secondary')[0].addEventListener('click', () => {
                textbox = document.getElementById('exampleInputPassword1');
                textbox.parentNode.appendChild(customDiv);
                textbox.style.height = '140px';
            });

            //If script is launched in mini sessionWindow (another script)
            if(document.getElementById('exampleInputPassword1')) {
                customDiv.style.gridTemplateColumns = '15px 15px 12% 12% 12% 12% 12% 12% 12% 10%';
                textbox = document.getElementById('exampleInputPassword1')
                textbox.parentNode.appendChild(customDiv);
            }
        }
    }, 1000);

	function canChange(e, value) {
		if (config.can === value) {
			if(!config.cpureset) {
				config.configureCan = !config.configureCan;
			} else {
				config.cpureset = false;
			};
		} else {
			config.can = value;
			config.configureCan = true;

			config.cpureset = false;
		};

		handleChange(e);
	};

	function fmsChange(e, value) {
		if (!config.can) {
			e.target.classList.add(buttonWarning);
			e.target.classList.remove(basicButtonStyle);

			setTimeout(() => {
				e.target.classList.add(basicButtonStyle);
				e.target.classList.remove(buttonWarning);
			}, 250);

			return
		};

		if(!config.cpureset) {
			config.fms = (config.fms === value ? '' : value);
		} else {
			config.fms = value;
			config.cpureset = false;
		};

		config.cpureset = false;
		handleChange(e);
	};

	function tachocheckChange(e, value) {
		if(!config.cpureset) {
			config.tachocheck = (config.tachocheck === value ? '' : value);
		} else {
			config.tachocheck = value;
			config.cpureset = false;
		};

		config.cpureset = false;
		handleChange(e);
	};

	function scanfmsChange(e, value) {
		if(!config.cpureset) {
			config.scanfms = (config.scanfms === value ? '' : value);
		} else {
			config.scanfms = value;
			config.cpureset = false;
		};

		config.cpureset = false;
		handleChange(e);
	}

	function cpuresetChange(e) {
		config.cpureset = !config.cpureset;

		handleChange(e);
	};

	function handleChange(e) {
		if (config.cpureset) {
			config.result = 'cpureset';
		} else {
			config.result = '';

			if(config.configureCan) {
				config.result = (config.can === '1' ? "setparam 209:0" : "setparam 209:1");
			};

			if(config.fms) {
				const fmsParam = `${(config.can === '1' ? '205' : '207')}:${config.fms}`;

				if(config.configureCan) {
					config.result += `;${fmsParam}`;
				} else {
					config.result += `setparam ${fmsParam}`;
				};

			};

			config.result += (config.result === '' ? '' : '\n') + config.tachocheck + (config.tachocheck && config.scanfms ? '\n' : '') + config.scanfms
		};

		updateBtnColors();

		textbox.value = config.result;
		triggerInput();
	};

    function triggerInput() {
		const event = new Event('input', {
		  bubbles: true,
		  cancelable: true,
		});
		textbox.dispatchEvent(event);
	};

	function triggerEvent(e, element) {
		const event = new Event(e, {
			bubbles: true,
			cancelable: true,
		  });
		  element.dispatchEvent(event);
	}

	function forceFrame() {
		const temp = textbox.value;

		textbox.value = 'getrecord';
		triggerInput();

		const sendBtn = document.getElementsByClassName('btn-primary')[0];
		triggerEvent('click', sendBtn);

		textbox.value = temp;
		triggerInput();
	}

    function createBtn(innerText, eventHandler, container, dataType, dataValue, customStyle) {
        const newBtn = document.createElement('button');
			newBtn.type = 'button';
			newBtn.style = "margin-right: 0.4rem;margin-top:5px;font-size:1.2em;border-width:0.1em;" + customStyle;
			newBtn.innerText = innerText;


        newBtn.classList.add('btn', 'customBtn', (innerText !== 'cpureset' ? basicButtonStyle : buttonCpuresetInactive));

		newBtn.addEventListener('click', eventHandler);

		if (dataType) {
			newBtn.dataset[dataType] = dataValue;
		};

        container.appendChild(newBtn);
    };

    function init() {
        createBtn('CAN 1', (e) => {canChange(e, '1')}, customDiv, 'can', '1', 'grid-column:3/6;grid-row:1');
        createBtn('CAN 2', (e) => {canChange(e, '2')}, customDiv, 'can', '2', 'grid-column:6/9;grid-row:1');
		createBtn('FMS 0', (e) => {fmsChange(e, '0')}, customDiv, 'fms', '0', 'grid-column:3/5;grid-row:2');
        createBtn('FMS 250', (e) => {fmsChange(e, '250')}, customDiv, 'fms', '250', 'grid-column:5/7;grid-row:2');
        createBtn('FMS 500', (e) => {fmsChange(e, '500')}, customDiv, 'fms', '500', 'grid-column:7/9;grid-row:2');
		createBtn('TACHOCHECK', (e) => {tachocheckChange(e, 'TACHOCHECK')}, customDiv, 'tachocheck', 'TACHOCHECK', 'grid-column:3/5;grid-row:3');
		createBtn('SCANFMS', (e) => {scanfmsChange(e, 'SCANFMS')}, customDiv, 'scanfms', 'SCANFMS', 'grid-column:5/7;grid-row:3');
		createBtn('CPURESET', (e) => {cpuresetChange(e)}, customDiv, 'cpureset', '1', 'grid-column:7/9;grid-row:3');

		createBtn('Wymuś ramkę', forceFrame, customDiv, 'frame', '0', 'grid-column:9/11;grid-row:1');
    };

	function updateBtnColors() {
		const currentSuccessBtn = (config.cpureset ? buttonCheckedInactive : buttonChecked);
		const toRemoveBtn = (config.cpureset ? buttonChecked : buttonCheckedInactive);

		const buttons = document.getElementsByClassName('customBtn');
		for (let btn of buttons) {
			const btnDataType = Object.keys(btn.dataset)[0];

			if(btn.innerText === 'CPURESET') {
				btn.classList.add((config.cpureset ? buttonCpureset : buttonCpuresetInactive));
				btn.classList.remove((config.cpureset ? buttonCpuresetInactive : buttonCpureset));
			} else if(btnDataType === 'can' && btn.dataset[btnDataType] === config[btnDataType] && !config.configureCan) {

					btn.classList.add(buttonCheckedInactive);
					btn.classList.remove(basicButtonStyle, buttonChecked);

			} else {
				if(config[btnDataType] == btn.dataset[btnDataType]) {
					btn.classList.add(currentSuccessBtn);
					btn.classList.remove(basicButtonStyle, toRemoveBtn);
				} else {
					btn.classList.add(basicButtonStyle);
					btn.classList.remove(currentSuccessBtn, toRemoveBtn);
				};
			};
		};
	};

})();