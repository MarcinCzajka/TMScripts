// ==UserScript==
// @name         Guziki konfiguracyjne telto
// @namespace    https://github.com/MarcinCzajka
// @version      1.1
// @description  Szybka konfiguracja przy użyciu guzików
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include *.pl/session/*
// ==/UserScript==

(function() {
    'use strict';

	const basicButtonStyle = 'btn-outline-secondary';

	const customDiv = document.createElement('div');
	  customDiv.id = 'customDiv';
	  customDiv.style = 'display:grid; grid-template-columns: repeat(10,10%); grid-template-rows: repeat(3, auto)';
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
			textbox.style.height = '140px';
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

    function createBtn(innerText, id, eventHandler, container, dataType, dataValue, customStyle) {
        const newBtn = document.createElement('button');
			newBtn.id = 'customBtn' + id;
			newBtn.type = 'button';
			newBtn.style = "margin-right: 0.4rem;" + customStyle;
			newBtn.innerText = innerText;
			

        newBtn.classList.add('btn', (innerText !== 'CPURESET' ? basicButtonStyle : 'btn-warning'));

		newBtn.addEventListener('click', eventHandler);
		
		if (dataType) {
			newBtn.dataset[dataType] = dataValue;
		};

        container.appendChild(newBtn);
    };

    function init() {
        createBtn('CAN 1', 'CAN1Btn', () => {handleChange('can', '1')}, customDiv, 'can', '1', 'grid-column:3/6;grid-row:1');
        createBtn('CAN 2', 'CAN2Btn', () => {handleChange('can', '2')}, customDiv, 'can', '2', 'grid-column:6/9;grid-row:1');
		createBtn('FMS 0', 'FMS0Btn', () => {handleChange('fms', '0')}, customDiv, 'fms', '0', 'grid-column:3/5;grid-row:2;margin-top:5px');
        createBtn('FMS 250', 'FMS250Btn', () => {handleChange('fms', '250')}, customDiv, 'fms', '250', 'grid-column:5/7;grid-row:2;margin-top:5px');
        createBtn('FMS 500', 'FMS500Btn', () => {handleChange('fms', '500')}, customDiv, 'fms', '500', 'grid-column:7/9;grid-row:2;margin-top:5px');
        createBtn('TACHOCHECK', 'tachocheckBtn', () => {handleChange('tachocheck', 'TACHOCHECK')}, customDiv, 'tachocheck', 'TACHOCHECK', 'grid-column:3/7;grid-row:3;margin-top:5px');
        createBtn('CPURESET', 'cpuresetBtn', () => {textbox.value = 'CPURESET'; triggerInput(); config.cpureset = true}, customDiv, '', '', 'grid-column:7/9;grid-row:3;margin-top:5px');
    };
	
	function changeBtnColor(dataType, dataValue) {
		const buttons = document.querySelectorAll(`[data-${dataType}]`);
		
		for (let btn of buttons) {
			if (btn.dataset[dataType] === dataValue && config[dataType] !== '') {
				btn.classList.add('btn-success');
				btn.classList.remove(basicButtonStyle);
			} else {
				btn.classList.add(basicButtonStyle);
				btn.classList.remove('btn-success');
			};
		};
	};
})();