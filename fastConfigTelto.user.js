// ==UserScript==
// @name         Guziki konfiguracyjne telto
// @namespace    https://github.com/MarcinCzajka
// @version      1.0
// @description  Szybka konfiguracja przy użyciu guzików
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include *.pl/session/*
// ==/UserScript==

(function() {
    'use strict';

	const customDiv = document.createElement('div');
	  customDiv.id = 'customDiv';
	init();
	let textbox;

	const config = {
		'can': '',
		'fms': '',
		'tachocheck': '',
		'cpureset': false
	};

    setTimeout(() => {
        document.getElementsByClassName('btn-secondary')[0].addEventListener('click', () => {
            textbox = document.getElementById('exampleInputPassword1');
            textbox.parentNode.insertBefore(customDiv, textbox.nextSibling);
        });
    }, 1000);

	function handleChange(key, value) {
		if (config[key] !== value && !config.cpureset) {
			config[key] = value;
		} else if (!config.cpureset) {
			config[key] = '';
		} else {
			config[key] = value;
			config.cpureset = false;
		};
		
		let configString = '';
		
		if (config.can) {
			configString += (config.can === '1' ? "setparam 209:0" : "setparam 209:1") + '\n';
		};
		
		if (config.fms) {
			configString += `setparam ${(config.can === '1' ? '205' : '207')}:${config.fms}\n`;
		};

		configString += config.tachocheck

		textbox.value = configString;

		triggerInput();
		
		changeBtnColor(key, value);
	};

    function triggerInput() {
		var event = new Event('input', {
		  bubbles: true,
		  cancelable: true,
		});
		textbox.dispatchEvent(event);
    };

    function createBtn(innerText, id, eventHandler, container, dataType, dataValue) {
        const newBtn = document.createElement('button');
			newBtn.id = 'customBtn' + id;
			newBtn.type = 'button';
			newBtn.style = "margin-right: 0.4rem";
			newBtn.innerText = innerText;
			

        newBtn.classList.add('btn', 'btn-secondary');

		newBtn.addEventListener('click', eventHandler);
		
		if (dataType) {
			newBtn.dataset[dataType] = dataValue;
		};

        container.appendChild(newBtn);
    };

    function init() {
        createBtn('CAN 1', 'CAN1Btn', () => {handleChange('can', '1')}, customDiv, 'can', '1');
        createBtn('CAN 2', 'CAN2Btn', () => {handleChange('can', '2')}, customDiv, 'can', '2');
		createBtn('FMS 0', 'FMS0Btn', () => {handleChange('fms', '0')}, customDiv, 'fms', '0');
        createBtn('FMS 250', 'FMS250Btn', () => {handleChange('fms', '250')}, customDiv, 'fms', '250');
        createBtn('FMS 500', 'FMS500Btn', () => {handleChange('fms', '500')}, customDiv, 'fms', '500');
        createBtn('TACHOCHECK', 'tachocheckBtn', () => {handleChange('tachocheck', 'TACHOCHECK')}, customDiv, 'tachocheck', 'TACHOCHECK');
        createBtn('CPURESET', 'cpuresetBtn', () => {textbox.value = 'CPURESET'; triggerInput(); config.cpureset = true}, customDiv);
    };
	
	function changeBtnColor(dataType, dataValue) {
		const buttons = document.querySelectorAll(`[data-${dataType}]`);
		
		for (let btn of buttons) {
			if (btn.dataset[dataType] === dataValue && config[dataType] !== '') {
				btn.classList.add('btn-success');
				btn.classList.remove('btn-secondary');
			} else {
				btn.classList.add('btn-secondary');
				btn.classList.remove('btn-success');
			};
		};
	};
})();