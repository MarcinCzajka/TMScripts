// ==UserScript==
// @name         Guziki konfiguracyjne telto
// @namespace    https://github.com/MarcinCzajka
// @version      3.5
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

	addStylesheet();

	const basicButtonStyle = 'btn-outline-secondary';
	const buttonChecked = 'btn-success';
	const buttonCheckedInactive = 'btn-outline-success';
	const buttonCpureset = 'btn-warning';
	const buttonCpuresetInactive = 'btn-outline-warning';
	const buttonWarning = 'btn-outline-danger';

	let lvcanPrograms = null;

	const fmb640 = fmb640Element();
	const lvCan = lvCanElement();
	const fm5300 = fm5300Element();
    const rfid = rfidElement();
	const thermometers = thermometersElement();

	const tabStrip = document.createElement('div');
	tabStrip.id = 'tabStrip';
	tabStrip.innerHTML = `<ul>
		<li class="teltoNav" id="fmb640-nav">
			<input type="radio" name="tabStrip1" checked="checked" id="tab1" />
			<label for="tab1">FMB640</label>
			<div></div>
		</li>
		<li class="teltoNav" id="lvCan200-nav">
			<input type="radio" name="tabStrip1" id="tab2" />
			<label for="tab2">LVCan200</label>
			<div></div>
		</li>
		<li class="teltoNav" id="fm5300-nav">
			<input type="radio" name="tabStrip1" id="tab3" />
			<label for="tab3">FM5300</label>
			<div></div>
		</li>
		<li class="teltoNav" id="rfid-nav">
			<input type="radio" name="tabStrip1" id="tab4" />
			<label for="tab4">RFID</label>
			<div></div>
		</li>
		<li class="teltoNav" id="thermometers-nav">
			<input type="radio" name="tabStrip1" id="tab5" />
			<label for="tab5">Termometry</label>
			<div></div>
		</li>
	</ul>`;

	//Append new container to inexistent (at document.ready) element. Timeout at 0 is not enough
    (function showButtons() {
        const IMEI = document.querySelector('input')
        if(!IMEI) {
            setTimeout(showButtons,100);
            return
        }

        if(Number(IMEI.value) > 999999999) {

			document.getElementsByClassName('btn-secondary')[0].addEventListener('click', triggerButtonCreation);

            //If script is launched in mini sessionWindow (another script)
            setTimeout(() => {
                if(document.getElementById('exampleInputPassword1')) {
                    triggerButtonCreation();
                }
            }, 500);

            function triggerButtonCreation() {
                if(document.getElementById('exampleInputPassword1') && !document.getElementById('tabStrip')) {
					document.getElementById('exampleInputPassword1').parentNode.appendChild(tabStrip);

                    document.querySelector('#fmb640-nav>div').appendChild(fmb640);
                    document.querySelector('#lvCan200-nav>div').appendChild(lvCan);
                    document.querySelector('#fm5300-nav>div').appendChild(fm5300);
					document.querySelector('#rfid-nav>div').appendChild(rfid);
					document.querySelector('#thermometers-nav>div').appendChild(thermometers);

                    function onVehiclesInput(e) {
                        const value = document.getElementById('vehiclesInput').value.toLowerCase();
                        const options = document.getElementById('vehiclesList').children;

                        for(let i = 0; i < options.length; i++) {
                            if(options[i].value.toLowerCase() === value) {
                                document.getElementById('exampleInputPassword1').value = 'lvcansetprog ' + options[i].dataset.program;
                                document.getElementById('exampleInputPassword1').focus();
                                triggerInput();
                                break;
                            }
                        }
                    }

                    const lvCanVehiclesInput = document.getElementById('vehiclesInput');
                    lvCanVehiclesInput.addEventListener('input', onVehiclesInput);
					lvCanVehiclesInput.addEventListener('keyup', onVehiclesInput);


					document.getElementById('firstThermometer').addEventListener('change', onThermometersChange);
					document.getElementById('secondThermometer').addEventListener('change', onThermometersChange);
					function onThermometersChange() {
						const firstThermometer = document.getElementById('firstThermometer').value;
						const secondThermometer = document.getElementById('secondThermometer').value;

						let result = '';

						if(firstThermometer || secondThermometer) {
							result = `setparam 1115:0;1100:120;1113:110;1114:9999;1110:6;50620:1;50610:1;50580:1;\nsetparam 50570:1;50540:150530:1;1250:1;1200:1;`;

							if(firstThermometer) result += '1201:' + firstThermometer + ';';
							if(secondThermometer) result += '1251:' + secondThermometer;


						}

						const input = document.getElementById('exampleInputPassword1');
						input.value = result;
						input.focus();
						triggerInput();
					}

                }
            }
        }
    })()

    function triggerInput() {
		const event = new Event('input', {
		  bubbles: true,
		  cancelable: true,
		});
		document.getElementById('exampleInputPassword1').dispatchEvent(event);
        focusTextarea();
	};

	function triggerEvent(e, element) {
		const event = new Event(e, {
			bubbles: true,
			cancelable: true,
		  });
		  element.dispatchEvent(event);
	}

    function focusTextarea() {
        document.getElementById('exampleInputPassword1').focus();
    }

    function createBtn(innerText, eventHandler, container, dataType, dataValue, customStyle) {
        const newBtn = document.createElement('button');
			newBtn.type = 'button';
			if(customStyle) newBtn.style = `${newBtn.style ? newBtn.style + ';' : ''}${customStyle}`;
			newBtn.innerText = innerText;


        newBtn.classList.add('btn', 'customBtn', (innerText !== 'cpureset' ? basicButtonStyle : buttonCpuresetInactive));

		newBtn.addEventListener('click', eventHandler);

		if (dataType) {
			newBtn.dataset[dataType] = dataValue;
		};

        container.appendChild(newBtn);
    }

	//////Custom tabs\\\\\\

    function rfidElement() {
        const customDiv = document.createElement('div');
        customDiv.id = 'rfidElement';

        createBtn('Włącz RFID', (e) => {setMsg('setparam 11700:1;11702:1;50390:1;50391:5;50394:1;11805:1')}, customDiv, null, null, 'grid-column:3/5;grid-row:1');
        createBtn('Wyłącz RFID', (e) => {setMsg('setparam 11700:0')}, customDiv, null, null, 'grid-column:5/7;grid-row:1');

        return customDiv
	}

	function thermometersElement() {
        const customDiv = document.createElement('div');
		customDiv.id = 'thermometersElement';

		const firstThermometer = document.createElement('input');
		firstThermometer.id = 'firstThermometer';
		firstThermometer.placeholder = 'Pierwszy termometr';
		const secondThermometer = document.createElement('input');
		secondThermometer.id = 'secondThermometer';
		secondThermometer.placeholder = 'Drugi termometr';

		customDiv.append(firstThermometer, secondThermometer);

        return customDiv
    }

	function fm5300Element() {
		const customDiv = document.createElement('div');
		customDiv.id = 'fm5300Element';

		createBtn('VDO', (e) => {setParam('120', '1')}, customDiv, null, null, 'grid-column:3/4;grid-row:1');
		createBtn('SRE', (e) => {setParam('120', '2')}, customDiv, null, null, 'grid-column:4/5;grid-row:1');
        createBtn('SCANFMS', (e) => {setMsg('scanfms')}, customDiv, null, null, 'grid-column:5/7;grid-row:1');
		createBtn('TACHOCHECK', (e) => {setMsg('tachocheck')}, customDiv, null, null, 'grid-column:7/9;grid-row:1');
		createBtn('Mapowanie poziomu paliwa w Volvo 2013+', e => {setMsg('setparam 3771 1\nsetparam 3772 FFFFBF11\nsetparam 3773 1')}, customDiv, null, null, 'grid-column:3/9;grid-row:2');
		createBtn("Prędkość FMS dla Mercedesa (domyślnie 500)", e => {setMsg('setparam 157 500\nsetparam 760 500\nsetparam 30010 1')}, customDiv, null, null, 'grid-column:3/9;grid-row:3');

		return customDiv
	}

	function setParam(param, value, separator = ' ') {
		setMsg(`setparam ${param}${separator}${value}`);
	}

	function setMsg(msg) {
		document.getElementById('exampleInputPassword1').value = msg;
		triggerInput();
        focusTextarea();
	}

	function lvCanElement() {
		const customDiv = document.createElement('div');
		customDiv.id = 'lvCanElement';

		if(!lvcanPrograms) lvcanPrograms = lvConfig();

		const dropdown = document.createElement('div');
        dropdown.classList.add('customBtn');
		dropdown.innerHTML = `
			<input placeholder="lvcansetprog" id="vehiclesInput" list="vehiclesList">
		`;

		dropdown.style = 'grid-column:5/8;grid-row:1'

        const datalist = document.createElement('datalist');
        datalist.id = 'vehiclesList';

        dropdown.appendChild(datalist);

        for(let i = 0; i < lvcanPrograms.length; i++) {
            const option = document.createElement('option');
            const program = lvcanPrograms[i].program;
            option.value = `${lvcanPrograms[i].model}  //  ${lvcanPrograms[i].year}r.  //  (${program})`;
            option.dataset.program = program;

            datalist.appendChild(option);
        }

		customDiv.appendChild(dropdown);

		createBtn('lvcangetinfo', (e) => {setMsg('lvcangetinfo')}, customDiv, null, null, 'grid-column:3/5;grid-row:1');
		createBtn('Aktywacja LVCAN200 dla FMB640', (e) => {setMsg('setparam 45100:1;45110:1;45120:1;45130:1;45140:1;45150:1;45160:1;45170:1\nsetparam 45180:1;45200:1;45210:1;45220:1;45230:1;45240:1;45250:1;45260:1;45270:1;45280:1')}, customDiv, null, null, 'grid-column:3/8;grid-row:3');

		return customDiv
	}

	function fmb640Element() {
		const customDiv = document.createElement('div');
		customDiv.id = 'fmb640Element';

		const config = {
			'can': '',
			'configureCan': false,
			'fms': '',
			'tachocheck': '',
			'scanfms': '',
			'result': '',
			'cpureset': false,
			'frame': 1
		}

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
		}

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
		}

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

			document.getElementById('exampleInputPassword1').value = config.result;
			triggerInput();
            focusTextarea();
		}

		function forceFrame() {
			const temp = document.getElementById('exampleInputPassword1').value;

			document.getElementById('exampleInputPassword1').value = 'getrecord';
			triggerInput();

			const sendBtn = document.getElementsByClassName('btn-primary')[0];
			triggerEvent('click', sendBtn);

			if(document.getElementById('exampleInputPassword1')) {
				document.getElementById('exampleInputPassword1').value = temp;
				triggerInput();
			}
		}

		function updateBtnColors() {
			const currentSuccessBtn = (config.cpureset ? buttonCheckedInactive : buttonChecked);
			const toRemoveBtn = (config.cpureset ? buttonChecked : buttonCheckedInactive);

			const buttons = document.querySelectorAll('#fmb640Element .customBtn');
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
					}
				}
			}
		}

		createBtn('CAN 1', (e) => {canChange(e, '1')}, customDiv, 'can', '1', 'grid-column:3/6;grid-row:1');
        createBtn('CAN 2', (e) => {canChange(e, '2')}, customDiv, 'can', '2', 'grid-column:6/9;grid-row:1');
		createBtn('FMS 0', (e) => {fmsChange(e, '0')}, customDiv, 'fms', '0', 'grid-column:3/5;grid-row:2');
        createBtn('FMS 250', (e) => {fmsChange(e, '250')}, customDiv, 'fms', '250', 'grid-column:5/7;grid-row:2');
        createBtn('FMS 500', (e) => {fmsChange(e, '500')}, customDiv, 'fms', '500', 'grid-column:7/9;grid-row:2');
		createBtn('TACHOCHECK', (e) => {tachocheckChange(e, 'TACHOCHECK')}, customDiv, 'tachocheck', 'TACHOCHECK', 'grid-column:3/5;grid-row:3');
		createBtn('SCANFMS', (e) => {scanfmsChange(e, 'SCANFMS')}, customDiv, 'scanfms', 'SCANFMS', 'grid-column:5/7;grid-row:3');
		createBtn('CPURESET', (e) => {cpuresetChange(e)}, customDiv, 'cpureset', '1', 'grid-column:7/9;grid-row:3');
		createBtn('Wymuś ramkę', forceFrame, customDiv, 'frame', '0', 'grid-column:9/11;grid-row:1');

		return customDiv
	}

	function addStylesheet() {
        const stylesheet = document.createElement('style');
        stylesheet.type = "text/css";

		stylesheet.textContent = `
			#fmb640Element, #lvCanElement, #fm5300Element, #rfidElement, #thermometersElement {
				display:grid;
				grid-template-rows: repeat(3, auto);
				grid-template-columns: 15px 15px 12% 12% 12% 12% 12% 12% 12% 10%;
				padding: 0 70px;
			}
			#fm5300Element .customBtn:focus, #lvCanElement .customBtn:focus {
				box-shadow: 0 0 0 0.2rem #28a745 !important;
				border-color: #28a745 !important;
			}
			#exampleInputPassword1 {
				height: 100px;
			}
            #lvCanElement, #fm5300Element {
                grid-row-gap: 2px;
            }
            #tabStrip div input {
                width: 100%;
                height: 100%;
                font-weight: 500;
			}
			#thermometersElement {
				margin-top: 5px;
			}
			#thermometersElement input {
				height: 33px !important;
				width: 97% !important;
			}
            #tabStrip ::-webkit-input-placeholder {
               text-align: center;
            }
            #tabStrip :-moz-placeholder {
               text-align: center;
            }
            #tabStrip ::-moz-placeholder {
               text-align: center;
            }
            #tabStrip :-ms-input-placeholder {
               text-align: center;
			}
			#firstThermometer {
				grid-column: 3/5;
				grid-row: 1;
			}
			#secondThermometer {
				grid-column: 5/7;
				grid-row: 1;
			}
			.customBtn {
				margin-right: 0.4rem;
				margin-top: 5px;
				font-size: 1.2em;
				border-width: 0.1em;
                letter-spacing: 2px;
			}
			#tabStrip {
				width: 100%;
				height: auto;
				font: normal 11px Arial, Sans-serif;
				color: #404040;
			}
            #tabStrip ul,
			#tabStrip li {
				margin: 0;
				padding: 0;
				list-style: none;
			}
			#tabStrip,
			#tabStrip input[type="radio"]:checked + label {
				position: relative;
			}
			#tabStrip li,
			#tabStrip input[type="radio"] + label {
				display: inline-block;
			}
			#tabStrip li > div,
			#tabStrip input[type="radio"] {
				position: absolute;
			}
			#tabStrip li > div,
			#tabStrip input[type="radio"] + label {
				border: solid 1px #ccc;
			}
			#tabStrip li {
				vertical-align: top;
				height: 170px;
			}
			#tabStrip li:first-child {
				margin-left: 8px;
			}
			#tabStrip li > div {
				top: 33px;
				bottom: 0;
				left: 0;
				width: 100%;
				padding: 8px;
				overflow: auto;
				background: #fff;
				-moz-box-sizing: border-box;
				-webkit-box-sizing: border-box;
				box-sizing: border-box;
			}
			#tabStrip input[type="radio"] + label {
				margin: 0 2px 0 0;
				padding: 0 18px;
				line-height: 32px;
				background: #f1f1f1;
				text-align: center;
				border-radius: 5px 5px 0 0;
				cursor: pointer;
				user-select: none;
			}
			#tabStrip input[type="radio"]:checked + label {
				z-index: 1;
				background: #fff;
				border-bottom-color: #fff;
				cursor: default;
			}
			#tabStrip input[type="radio"] {
				opacity: 0;
			}
			#tabStrip input[type="radio"] ~ div {
				display: none;
			}
			#tabStrip input[type="radio"]:checked:not(:disabled) ~ div {
				display: block;
			}
			#tabStrip input[type="radio"]:disabled + label {
				opacity: .5;
				cursor: no-drop;
			}
        `;

        document.querySelector('head').appendChild(stylesheet);
	}

	function lvConfig() {
		return [{model:"ABARTH 124 SPIDER",program:"12259",year:"2016"},{model:"ABARTH 595",program:"12687",year:"2016"},{model:"ABARTH 695",program:"12687",year:"2017"},{model:"ACURA RDX",program:"11113",year:"2007"},{model:"ACURA TL",program:"11167",year:"2004"},{model:"ACURA TLX",program:"12363",year:"2015"},{model:"ACURA TSX",program:"12578",year:"2009"},{model:"ACURA TSX",program:"11167",year:"2004"},{model:"ALFA ROMEO 159",program:"11128",year:"2005"},{model:"ALFA ROMEO BRERA",program:"11128",year:"2008"},{model:"ALFA ROMEO GIULIA",program:"12242",year:"2017"},{model:"ALFA ROMEO GIULIETTA",program:"11127",year:"2010"},{model:"ALFA ROMEO GT",program:"11128",year:"2005"},{model:"ALFA ROMEO MITO",program:"11127",year:"2009"},{model:"ALFA ROMEO STELVIO",program:"12234",year:"2018"},{model:"ASTON MARTIN VANTAGE V8",program:"11397",year:"2009"},{model:"AUDI A1 (GB)",program:"13112",year:"2019"},{model:"AUDI A1 (8X)",program:"11173",year:"2010"},{model:"AUDI A3 (8V)",program:"12423",year:"2016"},{model:"AUDI A3 (8V)",program:"11448",year:"2013"},{model:"AUDI A3 / S3 (8P)",program:"11173",year:"2010"},{model:"AUDI A3 / S3 (8P)",program:"11136",year:"2003"},{model:"AUDI A4 (F4)",program:"12979",year:"2019"},{model:"AUDI A4 (F4)",program:"11917",year:"2016"},{model:"AUDI A4 / S4 (8K)",program:"11158",year:"2008"},{model:"AUDI A4 / S4 (8E)",program:"11132",year:"2001"},{model:"AUDI A5 (F5)",program:"11917",year:"2017"},{model:"AUDI A5 / S5",program:"11158",year:"2007"},{model:"AUDI A6 (F2)",program:"12417",year:"2019"},{model:"AUDI A6 (4G)",program:"11273",year:"2011"},{model:"AUDI A6 (4B)",program:"11262",year:"1998"},{model:"AUDI A6 / S6 / RS6 (4F)",program:"11131",year:"2005"},{model:"AUDI A7 (F2)",program:"12418",year:"2019"},{model:"AUDI A7",program:"11273",year:"2010"},{model:"AUDI A8 (F8)",program:"12214",year:"2018"},{model:"AUDI A8 (4H)",program:"11273",year:"2010"},{model:"AUDI A8 / S8 (4E)",program:"11171",year:"2003"},{model:"AUDI ALLROAD (4F)",program:"11131",year:"2006"},{model:"AUDI E-TRON (GE) (Electric)",program:"12988",year:"2019"},{model:"AUDI Q2 (GA)",program:"11923",year:"2017"},{model:"AUDI Q3 (F3) (Sportback)",program:"12899",year:"2020"},{model:"AUDI Q3 (F3)",program:"12898",year:"2019"},{model:"AUDI Q3 (8U)",program:"11173",year:"2015"},{model:"AUDI Q5 (FY)",program:"11921",year:"2017"},{model:"AUDI Q5 (8R)",program:"11158",year:"2008"},{model:"AUDI Q5 / SQ5 (FP)",program:"11158",year:"2013"},{model:"AUDI Q7 (4M)",program:"12989",year:"2020"},{model:"AUDI Q7 (4M)",program:"11646",year:"2016"},{model:"AUDI Q7 (4L)",program:"11131",year:"2005"},{model:"AUDI Q8 (F1)",program:"12449",year:"2018"},{model:"AUDI R8 (FX)",program:"12974",year:"2016"},{model:"AUDI R8 (42)",program:"11111",year:"2008"},{model:"AUDI TT (FV)",program:"11448",year:"2015"},{model:"AUDI TT (8J)",program:"11173",year:"2010"},{model:"AUDI TT / TTS (8J)",program:"11111",year:"2006"},{model:"BENTLEY CONTINENTAL GT (3W)",program:"11211",year:"2005"},{model:"BMW 1 (F40)",program:"12931",year:"2019"},{model:"BMW 1 (F20)",program:"12763",year:"2015"},{model:"BMW 1 (F20)",program:"12746",year:"2011"},{model:"BMW 1 (E81 / E82 / E87 / E88)",program:"11118",year:"2004"},{model:"BMW 1 (E81 / E82 / E87 / E88) (Keyless)",program:"11137",year:"2004"},{model:"BMW 2 (F45)",program:"12778",year:"2014"},{model:"BMW 3 (G20)",program:"12764",year:"2019"},{model:"BMW 3 (G20) (Hybrid) (Plug-in)",program:"12932",year:"2019"},{model:"BMW 3 (F30)",program:"12746",year:"2012"},{model:"BMW 3 (F30) (RHD)",program:"12747",year:"2012"},{model:"BMW 3 (E90 / E91 / E92 / E93)",program:"11118",year:"2005"},{model:"BMW 3 (E90 / E91 / E92 / E93) (Keyless)",program:"11137",year:"2005"},{model:"BMW 3 GT (F34)",program:"12313",year:"2013"},{model:"BMW 4 (F36)",program:"12183",year:"2014"},{model:"BMW 4 (F32)",program:"12762",year:"2013"},{model:"BMW 5 (G30) (Hybrid) (Plug-in)",program:"12822",year:"2017"},{model:"BMW 5 (G30)",program:"12186",year:"2017"},{model:"BMW 5 (F10 / F11)",program:"11275",year:"2010"},{model:"BMW 5 (F18)",program:"11275",year:"2010"},{model:"BMW 5 (E60 / E61)",program:"11118",year:"2003"},{model:"BMW 5 (E60 / E61) (Keyless)",program:"11137",year:"2003"},{model:"BMW 5 GT (F07)",program:"11275",year:"2009"},{model:"BMW 6 (E63 / E64)",program:"11118",year:"2005"},{model:"BMW 6 (E63 / E64) (Keyless)",program:"11137",year:"2005"},{model:"BMW 6 / M6 (F13)",program:"11275",year:"2011"},{model:"BMW 6 GT (G32)",program:"12182",year:"2017"},{model:"BMW 7 (G11)",program:"12858",year:"2019"},{model:"BMW 7 (G11)",program:"11691",year:"2016"},{model:"BMW 7 (F01 / F02)",program:"11275",year:"2008"},{model:"BMW 7 (E65 / E66)",program:"11118",year:"2005"},{model:"BMW 7 (E65 / E66) (Keyless)",program:"11137",year:"2005"},{model:"BMW i3 (I01) (Electric)",program:"12971",year:"2018"},{model:"BMW i3 (I01) (Electric)",program:"11727",year:"2013"},{model:"BMW i8 (I12) (Hybrid) (Plug-in)",program:"11692",year:"2014"},{model:"BMW M2 (F87)",program:"12926",year:"2015"},{model:"BMW M4 (F82)",program:"12554",year:"2014"},{model:"BMW R 1200 GS (LC)",program:"13216",year:"2013"},{model:"BMW R 1250 GS (EXCLUSIVE)",program:"13273",year:"2019"},{model:"BMW X1 (F48)",program:"13241",year:"2020"},{model:"BMW X1 (F48)",program:"12529",year:"2015"},{model:"BMW X1 (E84) (Keyless)",program:"11137",year:"2009"},{model:"BMW X1 (E84)",program:"11118",year:"2009"},{model:"BMW X2 (F39)",program:"12262",year:"2018"},{model:"BMW X3 (G01)",program:"12421",year:"2018"},{model:"BMW X3 (F25)",program:"11351",year:"2010"},{model:"BMW X4 (G02)",program:"12479",year:"2018"},{model:"BMW X4 (F26)",program:"11351",year:"2014"},{model:"BMW X5 (G05)",program:"12595",year:"2018"},{model:"BMW X5 (F15) (Hybrid) (Plug-in)",program:"12852",year:"2016"},{model:"BMW X5 (F15) (Immobilizer)",program:"12594",year:"2013"},{model:"BMW X5 (E70)",program:"11118",year:"2007"},{model:"BMW X5 (E70) (Keyless)",program:"11137",year:"2007"},{model:"BMW X5 (E53)",program:"11293",year:"1999"},{model:"BMW X6 (F16)",program:"12661",year:"2015"},{model:"BMW X6 (E71)",program:"11118",year:"2008"},{model:"BMW X6 (E71) (Keyless)",program:"11137",year:"2008"},{model:"BMW X7 (G07)",program:"12936",year:"2019"},{model:"BMW Z4 (E89)",program:"11118",year:"2009"},{model:"BMW Z4 (E89) (Keyless)",program:"11137",year:"2009"},{model:"BRILLIANCE H230",program:"11543",year:"2012"},{model:"BRILLIANCE H530",program:"11515",year:"2011"},{model:"BRILLIANCE V5 (Keyless)",program:"11515",year:"2013"},{model:"BUICK ENCORE",program:"11243",year:"2012"},{model:"CADILLAC ATS",program:"11425",year:"2013"},{model:"CADILLAC BLS",program:"11126",year:"2006"},{model:"CADILLAC CTS",program:"11227",year:"2008"},{model:"CADILLAC ESCALADE",program:"13248",year:"2015"},{model:"CADILLAC ESCALADE",program:"11198",year:"2007"},{model:"CADILLAC SRX",program:"11183",year:"2010"},{model:"CADILLAC SRX",program:"11198",year:"2007"},{model:"CADILLAC STS",program:"11229",year:"2008"},{model:"CADILLAC XT5",program:"11844",year:"2017"},{model:"CHANGAN CS35",program:"11512",year:"2013"},{model:"CHANGAN CS35 PLUS",program:"12831",year:"2018"},{model:"CHANGAN EADO",program:"11512",year:"2014"},{model:"CHERY ARRIZO7 (Keyless)",program:"11576",year:"2015"},{model:"CHERY BONUS3",program:"11577",year:"2013"},{model:"CHERY INDIS",program:"11591",year:"2014"},{model:"CHERY M11",program:"11592",year:"2013"},{model:"CHERY TIGGO FL",program:"11593",year:"2014"},{model:"CHERY TIGGO2",program:"12289",year:"2018"},{model:"CHERY TIGGO3",program:"12288",year:"2018"},{model:"CHERY TIGGO5",program:"11576",year:"2014"},{model:"CHEVROLET AVEO",program:"11243",year:"2011"},{model:"CHEVROLET CAMARO V",program:"11586",year:"2014"},{model:"CHEVROLET CAPTIVA",program:"11149",year:"2007"},{model:"CHEVROLET COBALT",program:"11243",year:"2012"},{model:"CHEVROLET CRUZE",program:"11243",year:"2009"},{model:"CHEVROLET D-MAX",program:"11582",year:"2012"},{model:"CHEVROLET FTR",program:"11539",year:"2014"},{model:"CHEVROLET FVR",program:"11539",year:"2014"},{model:"CHEVROLET MALIBU",program:"11243",year:"2013"},{model:"CHEVROLET NKR",program:"11539",year:"2013"},{model:"CHEVROLET NPR",program:"11539",year:"2013"},{model:"CHEVROLET ORLANDO",program:"11243",year:"2010"},{model:"CHEVROLET SPARK",program:"13255",year:"2019"},{model:"CHEVROLET SPARK",program:"11585",year:"2013"},{model:"CHEVROLET SUBURBAN",program:"11687",year:"2007"},{model:"CHEVROLET TAHOE (Keyless)",program:"11584",year:"2015"},{model:"CHEVROLET TAHOE",program:"11198",year:"2008"},{model:"CHEVROLET TRAILBLAZER",program:"11243",year:"2012"},{model:"CHEVROLET TRAX",program:"11243",year:"2013"},{model:"CHEVROLET VOLT (Hybrid) (Plug-in)",program:"11859",year:"2011"},{model:"CHRYSLER 200S",program:"12597",year:"2015"},{model:"CHRYSLER 300 II (Keyless)",program:"11332",year:"2011"},{model:"CHRYSLER 300C",program:"11116",year:"2005"},{model:"CHRYSLER GRAND VOYAGER",program:"11245",year:"2008"},{model:"CHRYSLER PACIFICA (Hybrid) (Plug-in)",program:"13244",year:"2017"},{model:"CHRYSLER PACIFICA",program:"12477",year:"2017"},{model:"CHRYSLER PT CRUISER",program:"11116",year:"2006"},{model:"CHRYSLER SEBRING",program:"11116",year:"2007"},{model:"CHRYSLER TOWN&COUNTRY",program:"11245",year:"2011"},{model:"CITROEN BERLINGO",program:"13163",year:"2019"},{model:"CITROEN BERLINGO",program:"12311",year:"2015"},{model:"CITROEN BERLINGO",program:"11143",year:"2008"},{model:"CITROEN BERLINGO",program:"11193",year:"2008"},{model:"CITROEN BERLINGO",program:"11292",year:"2003"},{model:"CITROEN C-CROSSER",program:"11142",year:"2007"},{model:"CITROEN C-ELYSEE",program:"12321",year:"2017"},{model:"CITROEN C-ELYSEE",program:"11298",year:"2013"},{model:"CITROEN C1",program:"13162",year:"2018"},{model:"CITROEN C1",program:"12312",year:"2014"},{model:"CITROEN C2",program:"11143",year:"2006"},{model:"CITROEN C2",program:"11193",year:"2006"},{model:"CITROEN C3",program:"13164",year:"2016"},{model:"CITROEN C3",program:"11143",year:"2006"},{model:"CITROEN C3",program:"11193",year:"2006"},{model:"CITROEN C3 AIRCROSS",program:"13175",year:"2018"},{model:"CITROEN C3 PICASSO",program:"11193",year:"2009"},{model:"CITROEN C3 PICASSO",program:"11192",year:"2009"},{model:"CITROEN C4 (SPACETOURER)",program:"13171",year:"2019"},{model:"CITROEN C4",program:"12325",year:"2015"},{model:"CITROEN C4",program:"11298",year:"2011"},{model:"CITROEN C4",program:"11143",year:"2007"},{model:"CITROEN C4",program:"11193",year:"2007"},{model:"CITROEN C4 AIRCROSS",program:"11451",year:"2013"},{model:"CITROEN C4 CACTUS",program:"13174",year:"2018"},{model:"CITROEN C4 CACTUS",program:"12184",year:"2014"},{model:"CITROEN C4 PICASSO (EXCLUSIVE)(Keyless)",program:"11495",year:"2013"},{model:"CITROEN C5",program:"11192",year:"2008"},{model:"CITROEN C5",program:"11143",year:"2004"},{model:"CITROEN C5",program:"11193",year:"2004"},{model:"CITROEN C5 AIRCROSS",program:"13172",year:"2019"},{model:"CITROEN C6",program:"11143",year:"2005"},{model:"CITROEN C6",program:"11193",year:"2005"},{model:"CITROEN C8",program:"11143",year:"2002"},{model:"CITROEN C8",program:"11193",year:"2002"},{model:"CITROEN DS3",program:"11143",year:"2010"},{model:"CITROEN DS3",program:"11193",year:"2010"},{model:"CITROEN DS4",program:"11298",year:"2011"},{model:"CITROEN DS4 CROSSBACK",program:"12317",year:"2016"},{model:"CITROEN DS5",program:"12315",year:"2015"},{model:"CITROEN JUMPER (EURO 6)",program:"12314",year:"2017"},{model:"CITROEN JUMPER (EURO 5 PLUS)",program:"13167",year:"2014"},{model:"CITROEN JUMPER",program:"13168",year:"2011"},{model:"CITROEN JUMPER",program:"11129",year:"2006"},{model:"CITROEN JUMPY",program:"11949",year:"2017"},{model:"CITROEN JUMPY",program:"13169",year:"2016"},{model:"CITROEN JUMPY",program:"11143",year:"2007"},{model:"CITROEN JUMPY",program:"11193",year:"2007"},{model:"CITROEN NEMO",program:"12966",year:"2008"},{model:"CITROEN SPACETOURER",program:"11949",year:"2017"},{model:"CITROEN XSARA PICASSO",program:"11292",year:"2004"},{model:"DACIA DOKKER",program:"11574",year:"2012"},{model:"DACIA DUSTER",program:"12217",year:"2018"},{model:"DACIA DUSTER",program:"11574",year:"2014"},{model:"DACIA DUSTER",program:"11283",year:"2010"},{model:"DACIA LODGY",program:"11574",year:"2012"},{model:"DACIA LOGAN II",program:"11574",year:"2013"},{model:"DACIA LOGAN MCV II",program:"11574",year:"2013"},{model:"DACIA LOGAN VAN",program:"11283",year:"2008"},{model:"DACIA SANDERO",program:"11574",year:"2012"},{model:"DACIA SANDERO STEPWAY",program:"13119",year:"2017"},{model:"DACIA SANDERO STEPWAY",program:"11574",year:"2012"},{model:"DAF CF (EURO 6)",program:"11465",year:"2013"},{model:"DAF CF",program:"11217",year:"2006"},{model:"DAF LF (EURO 6)",program:"11465",year:"2013"},{model:"DAF LF",program:"11217",year:"2001"},{model:"DAF XF (EURO 6)",program:"12152",year:"2017"},{model:"DAF XF (EURO 6)",program:"11465",year:"2013"},{model:"DAF XF105 (EURO 5) (RussianMarket)",program:"13311",year:"2006"},{model:"DAF XF105 (EURO 4)",program:"11217",year:"2006"},{model:"DAF XF95 (EURO 3)",program:"11217",year:"2001"},{model:"DAIHATSU GRAN MAX (RHD)",program:"12522",year:"2007"},{model:"DAIHATSU SIRION",program:"12489",year:"2008"},{model:"DAIHATSU TERIOS (RHD)",program:"12493",year:"2018"},{model:"DAIHATSU TERIOS (RHD)",program:"12492",year:"2014"},{model:"DAIHATSU XENIA (RHD)",program:"12518",year:"2015"},{model:"DAIHATSU LUXIO LUXIO (RHD)",program:"12522",year:"2014"},{model:"DATSUN mi-DO",program:"11977",year:"2015"},{model:"DODGE AVANGER",program:"11116",year:"2007"},{model:"DODGE CALIBER",program:"11116",year:"2006"},{model:"DODGE CHALLENGER SRT HELLCAT",program:"12938",year:"2015"},{model:"DODGE DURANGO",program:"13243",year:"2018"},{model:"DODGE DURANGO",program:"12659",year:"2014"},{model:"DODGE DURANGO",program:"11116",year:"2004"},{model:"DODGE JOURNEY",program:"12665",year:"2014"},{model:"DODGE JOURNEY",program:"11245",year:"2008"},{model:"DODGE MAGNUM",program:"11116",year:"2005"},{model:"DODGE RAM",program:"11245",year:"2009"},{model:"DODGE RAM",program:"11116",year:"2006"},{model:"DODGE SPRINTER (PE7)",program:"12678",year:"2007"},{model:"DUCATI MULTISTRADA 1260S",program:"13271",year:"2018"},{model:"FAW BESTURN B50",program:"11578",year:"2012"},{model:"FIAT 124 SPIDER",program:"12259",year:"2016"},{model:"FIAT 500",program:"11127",year:"2007"},{model:"FIAT 500E (Electric)",program:"12431",year:"2013"},{model:"FIAT 500L",program:"12637",year:"2018"},{model:"FIAT 500X",program:"12638",year:"2018"},{model:"FIAT 500X (Keyless)",program:"11554",year:"2015"},{model:"FIAT 500X",program:"11599",year:"2015"},{model:"FIAT BRAVO",program:"11129",year:"2007"},{model:"FIAT CROMA",program:"11128",year:"2005"},{model:"FIAT DOBLO NATURAL POWER",program:"12233",year:"2017"},{model:"FIAT DOBLO",program:"12235",year:"2017"},{model:"FIAT DOBLO NATURAL POWER",program:"11879",year:"2015"},{model:"FIAT DOBLO",program:"11127",year:"2010"},{model:"FIAT DOBLO NATURAL POWER",program:"11873",year:"2010"},{model:"FIAT DOBLO",program:"11112",year:"2006"},{model:"FIAT DOBLO",program:"11263",year:"2001"},{model:"FIAT DUCATO (EURO 6)",program:"13258",year:"2020"},{model:"FIAT DUCATO (EURO 6)",program:"12213",year:"2017"},{model:"FIAT DUCATO (EURO 5 PLUS)",program:"12677",year:"2014"},{model:"FIAT DUCATO",program:"12675",year:"2011"},{model:"FIAT DUCATO NATURAL POWER",program:"11881",year:"2011"},{model:"FIAT DUCATO",program:"11129",year:"2006"},{model:"FIAT FIORINO",program:"12681",year:"2016"},{model:"FIAT FIORINO",program:"11127",year:"2008"},{model:"FIAT FREEMONT",program:"11332",year:"2011"},{model:"FIAT FULLBACK",program:"12266",year:"2016"},{model:"FIAT GRANDE PUNTO",program:"11127",year:"2006"},{model:"FIAT LINEA",program:"11146",year:"2007"},{model:"FIAT PANDA II",program:"11112",year:"2004"},{model:"FIAT PANDA III",program:"11127",year:"2012"},{model:"FIAT PUNTO",program:"11127",year:"2014"},{model:"FIAT PUNTO EVO",program:"11127",year:"2009"},{model:"FIAT QUBO",program:"12682",year:"2016"},{model:"FIAT QUBO",program:"11127",year:"2008"},{model:"FIAT SCUDO",program:"11143",year:"2007"},{model:"FIAT SCUDO",program:"11193",year:"2007"},{model:"FIAT SEDICI",program:"11115",year:"2006"},{model:"FIAT STILO",program:"11112",year:"2006"},{model:"FIAT TALENTO",program:"12232",year:"2017"},{model:"FIAT TIPO (Hatchback)",program:"11714",year:"2017"},{model:"FIAT TIPO (Station Wagon)",program:"12673",year:"2016"},{model:"FIAT TIPO (Sedan)",program:"11714",year:"2015"},{model:"FIAT ULYSSE",program:"11143",year:"2007"},{model:"FIAT ULYSSE",program:"11193",year:"2007"},{model:"FORD C-MAX (Hybrid)",program:"12968",year:"2013"},{model:"FORD C-MAX",program:"11276",year:"2010"},{model:"FORD C-MAX",program:"11121",year:"2003"},{model:"FORD C-MAX ENERGI (TITANIUM) (Hybrid) (Plug-in) (USA Market)",program:"11864",year:"2013"},{model:"FORD CARGO",program:"11791",year:"2012"},{model:"FORD CARGO",program:"11222",year:"2007"},{model:"FORD ECO SPORT (TITANIUM) (Keyless)",program:"12261",year:"2017"},{model:"FORD ECO SPORT (TREND)",program:"11575",year:"2014"},{model:"FORD ECO SPORT (TITANIUM) (Keyless)",program:"11583",year:"2014"},{model:"FORD EDGE",program:"12897",year:"2019"},{model:"FORD EDGE (Keyless)",program:"11978",year:"2017"},{model:"FORD EDGE",program:"11424",year:"2013"},{model:"FORD ESCAPE (SE)",program:"12587",year:"2017"},{model:"FORD ESCAPE (TITANIUM) (Keyless)",program:"12415",year:"2013"},{model:"FORD EXPLORER",program:"11843",year:"2016"},{model:"FORD EXPLORER",program:"11424",year:"2011"},{model:"FORD F 1848T (E5) (EURO 5)",program:"12494",year:"2018"},{model:"FORD F-MAX 1850T (E5) (EURO 5)",program:"12731",year:"2019"},{model:"FORD F150",program:"12664",year:"2017"},{model:"FORD F250 SUPER DUTY",program:"11456",year:"2008"},{model:"FORD FIESTA (ST)",program:"13276",year:"2018"},{model:"FORD FIESTA",program:"12795",year:"2017"},{model:"FORD FIESTA (TITANIUM)",program:"12269",year:"2017"},{model:"FORD FIESTA (TREND)",program:"11175",year:"2013"},{model:"FORD FIESTA (TITANIUM) (Keyless)",program:"11846",year:"2013"},{model:"FORD FIESTA",program:"11175",year:"2009"},{model:"FORD FIESTA",program:"12895",year:"2006"},{model:"FORD FOCUS (ST)",program:"12793",year:"2019"},{model:"FORD FOCUS",program:"12836",year:"2019"},{model:"FORD FOCUS (SYNC EDITION) (Keyless)",program:"12113",year:"2017"},{model:"FORD FOCUS (RS)",program:"12788",year:"2015"},{model:"FORD FOCUS (TREND SPORT)",program:"11689",year:"2015"},{model:"FORD FOCUS (TITANIUM)",program:"11276",year:"2011"},{model:"FORD FOCUS (TREND)",program:"11454",year:"2011"},{model:"FORD FOCUS",program:"11121",year:"2005"},{model:"FORD FUSION (TITANIUM) (Hybrid) (Plugin) (USA Market)",program:"11865",year:"2013"},{model:"FORD FUSION (S) (USA Market)",program:"12588",year:"2013"},{model:"FORD FUSION (TITANIUM) (Keyless) (USA Market)",program:"12589",year:"2013"},{model:"FORD FUSION",program:"12895",year:"2006"},{model:"FORD GALAXY",program:"12139",year:"2015"},{model:"FORD GALAXY",program:"11133",year:"2006"},{model:"FORD GRAND-C-MAX",program:"11276",year:"2010"},{model:"FORD Ka",program:"11194",year:"2009"},{model:"FORD Ka",program:"12258",year:"2017"},{model:"FORD Ka+ ACTIVE",program:"12824",year:"2018"},{model:"FORD KUGA (Hybrid) (Plug-in)",program:"13269",year:"2020"},{model:"FORD KUGA",program:"13281",year:"2020"},{model:"FORD KUGA",program:"12797",year:"2018"},{model:"FORD KUGA",program:"11869",year:"2017"},{model:"FORD KUGA",program:"11276",year:"2013"},{model:"FORD KUGA",program:"11121",year:"2008"},{model:"FORD MONDEO (MK V) (Hybrid)",program:"13282",year:"2020"},{model:"FORD MONDEO (MK V)",program:"12798",year:"2019"},{model:"FORD MONDEO (MK V)",program:"11624",year:"2015"},{model:"FORD MONDEO (MK V)",program:"11711",year:"2015"},{model:"FORD MONDEO",program:"11133",year:"2007"},{model:"FORD MONDEO VIGNALE",program:"11624",year:"2015"},{model:"FORD MUSTANG",program:"13195",year:"2019"},{model:"FORD MUSTANG",program:"11867",year:"2015"},{model:"FORD MUSTANG SHELBY GT500",program:"11459",year:"2013"},{model:"FORD MUSTANG",program:"11281",year:"2010"},{model:"FORD MUSTANG (GT)",program:"11396",year:"2007"},{model:"FORD RANGER (T6)",program:"12785",year:"2019"},{model:"FORD RANGER (T6)",program:"11866",year:"2015"},{model:"FORD RANGER (T6)",program:"11462",year:"2012"},{model:"FORD S-MAX",program:"11711",year:"2015"},{model:"FORD S-MAX",program:"11133",year:"2007"},{model:"FORD TOURNEO",program:"11247",year:"2007"},{model:"FORD TOURNEO CONNECT",program:"11454",year:"2013"},{model:"FORD TOURNEO CONNECT",program:"11172",year:"2010"},{model:"FORD TOURNEO COURIER",program:"13275",year:"2018"},{model:"FORD TOURNEO COURIER",program:"11175",year:"2014"},{model:"FORD TOURNEO CUSTOM",program:"12787",year:"2018"},{model:"FORD TOURNEO CUSTOM",program:"11782",year:"2016"},{model:"FORD TOURNEO CUSTOM",program:"11422",year:"2012"},{model:"FORD TRANSIT",program:"12847",year:"2020"},{model:"FORD TRANSIT",program:"11868",year:"2016"},{model:"FORD TRANSIT",program:"11247",year:"2006"},{model:"FORD TRANSIT CONNECT",program:"12796",year:"2019"},{model:"FORD TRANSIT CONNECT (RussianMarket)",program:"13117",year:"2008"},{model:"FORD TRANSIT CONNECT",program:"11172",year:"2006"},{model:"FORD TRANSIT COURIER",program:"12786",year:"2018"},{model:"FORD TRANSIT CUSTOM",program:"12647",year:"2018"},{model:"FORD TRANSIT",program:"11422",year:"2012"},{model:"FREIGHTLINER ARGOSY",program:"11248",year:"2010"},{model:"FREIGHTLINER CENTURY",program:"11248",year:"2002"},{model:"FREIGHTLINER COLUMBIA",program:"11248",year:"2001"},{model:"GAZel 33106 (Valday)",program:"11383",year:"2012"},{model:"GAZel NEXT",program:"12342",year:"2018"},{model:"GAZel NEXT",program:"11383",year:"2015"},{model:"GAZel NEXT (UMZ)",program:"12644",year:"2014"},{model:"GAZon NEXT",program:"11383",year:"2015"},{model:"GEELY ATLAS NL3",program:"12821",year:"2016"},{model:"GEELY EMGRAND EC7",program:"11544",year:"2013"},{model:"GEELY EMGRAND X7",program:"12253",year:"2017"},{model:"GEELY EMGRAND X7",program:"11542",year:"2012"},{model:"GEELY GC6",program:"11589",year:"2014"},{model:"GENESIS G70 (Keyless)",program:"12426",year:"2018"},{model:"GENESIS G80 (Keyless)",program:"13233",year:"2017"},{model:"GMC CANYON (USA Market)",program:"12369",year:"2014"},{model:"GOLAZ 525110 VOYAGE (EURO 5)",program:"11221",year:"2012"},{model:"GOLAZ 529115 CRUZE (EURO 5)",program:"11221",year:"2010"},{model:"GREAT WALL H3",program:"11588",year:"2015"},{model:"GREAT WALL HOVER H6",program:"11516",year:"2011"},{model:"HAIMA 7",program:"11545",year:"2012"},{model:"HARLEY DAVIDSON DYNA FXDF (FAT BOB)",program:"12428",year:"2014"},{model:"HAVAL H6 COUPE",program:"12192",year:"2017"},{model:"HAVAL H8 (Keyless)",program:"11858",year:"2015"},{model:"HAVAL H9",program:"12189",year:"2015"},{model:"HIGER KLQ 6119 TQ",program:"11342",year:"2012"},{model:"HIGER KLQ 6129 Q",program:"11342",year:"2010"},{model:"HINO 300 (EURO 4)",program:"11944",year:"2015"},{model:"HINO 300 (EURO 4)",program:"11622",year:"2011"},{model:"HINO 500 (EURO 4)",program:"11613",year:"2011"},{model:"HONDA ACCORD",program:"13224",year:"2018"},{model:"HONDA ACCORD (RHD) (Keyless)",program:"12524",year:"2016"},{model:"HONDA ACCORD",program:"11169",year:"2008"},{model:"HONDA ACCORD",program:"12176",year:"2003"},{model:"HONDA BR-V (RHD)",program:"12531",year:"2015"},{model:"HONDA BRIO SATYA (RHD)",program:"12528",year:"2013"},{model:"HONDA CITY",program:"11113",year:"2009"},{model:"HONDA CIVIC",program:"13266",year:"2020"},{model:"HONDA CIVIC (Keyless)",program:"11345",year:"2012"},{model:"HONDA CIVIC",program:"11972",year:"2012"},{model:"HONDA CIVIC",program:"11113",year:"2006"},{model:"HONDA CIVIC TOURER",program:"11732",year:"2014"},{model:"HONDA CR-V",program:"11971",year:"2017"},{model:"HONDA CR-V (RHD)",program:"12538",year:"2015"},{model:"HONDA CR-V",program:"11732",year:"2015"},{model:"HONDA CR-V",program:"11345",year:"2012"},{model:"HONDA CR-V",program:"11113",year:"2007"},{model:"HONDA CROSSTOUR",program:"11169",year:"2011"},{model:"HONDA FIT",program:"11113",year:"2008"},{model:"HONDA HR-V (Keyless) (USA Market)",program:"13265",year:"2019"},{model:"HONDA HR-V",program:"11732",year:"2015"},{model:"HONDA HR-V (RHD) (Keyless)",program:"12535",year:"2015"},{model:"HONDA HR-V (RHD)",program:"12535",year:"2015"},{model:"HONDA INSIGHT",program:"11113",year:"2009"},{model:"HONDA JAZZ",program:"11732",year:"2015"},{model:"HONDA JAZZ",program:"13267",year:"2012"},{model:"HONDA JAZZ",program:"11113",year:"2009"},{model:"HONDA LEGEND",program:"11212",year:"2005"},{model:"HONDA MOBILIO (RHD)",program:"12532",year:"2014"},{model:"HONDA ODYSSEY",program:"12662",year:"2011"},{model:"HONDA ODYSSEY",program:"12579",year:"2006"},{model:"HONDA PILOT (Keyless)",program:"11962",year:"2016"},{model:"HONDA PILOT",program:"11189",year:"2009"},{model:"HONDA RIDGELINE (Keyless)",program:"13225",year:"2017"},{model:"HUMMER H2",program:"11198",year:"2008"},{model:"HYUNDAI CRETA",program:"12293",year:"2017"},{model:"HYUNDAI CRETA",program:"11795",year:"2015"},{model:"HYUNDAI ELANTRA",program:"11812",year:"2017"},{model:"HYUNDAI ELANTRA",program:"11419",year:"2013"},{model:"HYUNDAI ELANTRA",program:"11244",year:"2011"},{model:"HYUNDAI EQUUS (Keyless)",program:"11569",year:"2014"},{model:"HYUNDAI EQUUS",program:"11235",year:"2010"},{model:"HYUNDAI GENESIS (Keyless)",program:"11571",year:"2014"},{model:"HYUNDAI GENESIS",program:"11235",year:"2009"},{model:"HYUNDAI GRAND STAREX",program:"11236",year:"2007"},{model:"HYUNDAI GRANDEUR (Keyless)",program:"11427",year:"2012"},{model:"HYUNDAI GRANDEUR",program:"11152",year:"2007"},{model:"HYUNDAI H1",program:"12759",year:"2018"},{model:"HYUNDAI H350",program:"11671",year:"2015"},{model:"HYUNDAI HD260",program:"11222",year:"2011"},{model:"HYUNDAI HD78 (EURO 4)",program:"11553",year:"2014"},{model:"HYUNDAI i10",program:"13176",year:"2020"},{model:"HYUNDAI i10",program:"11674",year:"2015"},{model:"HYUNDAI i20",program:"13179",year:"2020"},{model:"HYUNDAI i20",program:"11672",year:"2015"},{model:"HYUNDAI i20",program:"11645",year:"2008"},{model:"HYUNDAI i30",program:"12198",year:"2017"},{model:"HYUNDAI i30",program:"11299",year:"2015"},{model:"HYUNDAI i30",program:"11299",year:"2012"},{model:"HYUNDAI i40 (Keyless)",program:"11417",year:"2011"},{model:"HYUNDAI i40",program:"11437",year:"2011"},{model:"HYUNDAI i45 SONATA",program:"11244",year:"2011"},{model:"HYUNDAI IONIQ (Hybrid)",program:"12175",year:"2017"},{model:"HYUNDAI IONIQ (Electric)",program:"12982",year:"2017"},{model:"HYUNDAI ix20",program:"11829",year:"2015"},{model:"HYUNDAI ix20",program:"11244",year:"2010"},{model:"HYUNDAI ix35",program:"11635",year:"2010"},{model:"HYUNDAI ix55",program:"11152",year:"2009"},{model:"HYUNDAI KONA (Hybrid)",program:"13177",year:"2020"},{model:"HYUNDAI KONA (Electric)",program:"12981",year:"2018"},{model:"HYUNDAI KONA (Keyless)",program:"12211",year:"2018"},{model:"HYUNDAI KONA (Keyless) (USA Market)",program:"13251",year:"2018"},{model:"HYUNDAI SANTA FE (Keyless)",program:"12553",year:"2019"},{model:"HYUNDAI SANTA FE (Keyless)",program:"11386",year:"2013"},{model:"HYUNDAI SANTA FE",program:"11426",year:"2013"},{model:"HYUNDAI SOLARIS (COMFORT)",program:"11925",year:"2017"},{model:"HYUNDAI SOLARIS (ACTIVE PLUS)",program:"12121",year:"2017"},{model:"HYUNDAI SOLARIS",program:"11236",year:"2015"},{model:"HYUNDAI SOLARIS (Keyless)",program:"11572",year:"2015"},{model:"HYUNDAI SOLARIS (Keyless)",program:"11296",year:"2011"},{model:"HYUNDAI SONATA",program:"12914",year:"2020"},{model:"HYUNDAI SONATA",program:"12634",year:"2018"},{model:"HYUNDAI SONATA (Hybrid)",program:"13173",year:"2016"},{model:"HYUNDAI TUCSON",program:"13191",year:"2019"},{model:"HYUNDAI TUCSON (Keyless)",program:"13178",year:"2019"},{model:"HYUNDAI TUCSON",program:"11821",year:"2016"},{model:"HYUNDAI TUCSON (Keyless)",program:"11669",year:"2016"},{model:"HYUNDAI UNIVERSE SPACE LUXURY",program:"11222",year:"2010"},{model:"HYUNDAI VELOSTER (Keyless)",program:"11416",year:"2011"},{model:"HYUNDAI XCIENT",program:"12453",year:"2013"},{model:"INFINITI EX35 / EX37 / EX50",program:"11249",year:"2010"},{model:"INFINITI EX35 / EX37 / EX50",program:"11216",year:"2008"},{model:"INFINITI FX30D",program:"11249",year:"2012"},{model:"INFINITI FX35 / FX37 / FX50",program:"11249",year:"2010"},{model:"INFINITI FX35 / FX37 / FX50",program:"11216",year:"2008"},{model:"INFINITI G25 / G35 / G37",program:"11249",year:"2010"},{model:"INFINITI G25 / G35 / G37",program:"11216",year:"2007"},{model:"INFINITI JX35",program:"11387",year:"2012"},{model:"INFINITI M35 / M35x / M45",program:"11187",year:"2008"},{model:"INFINITI M37 / M37x / M56 / M56x (EuropeMarket)",program:"11297",year:"2010"},{model:"INFINITI M37x (USA Market)",program:"11297",year:"2010"},{model:"INFINITI Q30",program:"11838",year:"2016"},{model:"INFINITI Q50",program:"11562",year:"2013"},{model:"INFINITI Q70",program:"11297",year:"2014"},{model:"INFINITI QX30",program:"11838",year:"2016"},{model:"INFINITI QX50 (J55)",program:"12542",year:"2018"},{model:"INFINITI QX50",program:"11561",year:"2013"},{model:"INFINITI QX56 (USA Market)",program:"11216",year:"2011"},{model:"INFINITI QX56 (EuropeMarket)",program:"11279",year:"2011"},{model:"INFINITI QX56",program:"11174",year:"2008"},{model:"INFINITI QX60 (Hybrid)",program:"11563",year:"2013"},{model:"INFINITI QX60",program:"11563",year:"2013"},{model:"INFINITI QX70",program:"11561",year:"2013"},{model:"INFINITI QX80",program:"11279",year:"2014"},{model:"INTERNATIONAL 3800 (T444E)",program:"13211",year:"2000"},{model:"INTERNATIONAL 9200",program:"11248",year:"2000"},{model:"INTERNATIONAL 9400",program:"11248",year:"2000"},{model:"ISUZU CYZ (EURO 5)",program:"12255",year:"2014"},{model:"ISUZU D-MAX (RHD)",program:"12547",year:"2013"},{model:"ISUZU D-MAX",program:"11582",year:"2012"},{model:"ISUZU D-MAX",program:"11837",year:"2008"},{model:"ISUZU FVR34 (EURO 6)",program:"12167",year:"2014"},{model:"ISUZU L35 (EURO 5)",program:"11539",year:"2011"},{model:"ISUZU P60 (EURO 5)",program:"11539",year:"2012"},{model:"ISUZU TURQUOISE (EURO 5)",program:"11539",year:"2012"},{model:"IVECO DAILY (EURO 6)",program:"12896",year:"2020"},{model:"IVECO DAILY (EURO 6)",program:"12277",year:"2017"},{model:"IVECO DAILY (EURO 6) (RDE)",program:"12277",year:"2017"},{model:"IVECO DAILY",program:"11346",year:"2011"},{model:"IVECO DAILY (EURO 4)",program:"11269",year:"2006"},{model:"IVECO DAILY (EURO 3)",program:"11222",year:"2001"},{model:"IVECO EUROCARGO (EURO 6)",program:"12268",year:"2015"},{model:"IVECO EUROCARGO (EURO 5)",program:"11155",year:"2009"},{model:"IVECO EUROCARGO (EURO 4)",program:"11155",year:"2006"},{model:"IVECO EUROCARGO (EURO 3)",program:"11155",year:"2002"},{model:"IVECO FIRST (EURO 6)",program:"11552",year:"2016"},{model:"IVECO IRISBUS CROSSWAY",program:"12257",year:"2013"},{model:"IVECO IRISBUS CROSSWAY",program:"11421",year:"2006"},{model:"IVECO KAPENA (EURO 6)",program:"11552",year:"2014"},{model:"IVECO MAGIRUS",program:"11155",year:"2006"},{model:"IVECO S-WAY (EURO 6)",program:"13123",year:"2020"},{model:"IVECO STRALIS (EURO 6) LNG",program:"12987",year:"2018"},{model:"IVECO STRALIS (EURO 6)",program:"11848",year:"2017"},{model:"IVECO STRALIS (EURO 6)",program:"11151",year:"2013"},{model:"IVECO STRALIS (EURO 5)",program:"11151",year:"2012"},{model:"IVECO STRALIS (EURO 4)",program:"11151",year:"2006"},{model:"IVECO STRALIS (EURO 3)",program:"11151",year:"2002"},{model:"IVECO TRAKKER (RussianMarket)",program:"12779",year:"2006"},{model:"IVECO TRAKKER",program:"11155",year:"2006"},{model:"JAC S3",program:"12551",year:"2017"},{model:"JAGUAR E-PACE (X540)",program:"12885",year:"2018"},{model:"JAGUAR F-PACE (X761)",program:"12884",year:"2019"},{model:"JAGUAR F-PACE (X761)",program:"12857",year:"2016"},{model:"JAGUAR F-TYPE (X152)",program:"12777",year:"2017"},{model:"JAGUAR F-TYPE (X152)",program:"11233",year:"2013"},{model:"JAGUAR I-PACE (EV400) (Electric)",program:"12888",year:"2018"},{model:"JAGUAR XE (X760)",program:"12939",year:"2020"},{model:"JAGUAR XE (X760)",program:"12574",year:"2018"},{model:"JAGUAR XE (X760)",program:"12856",year:"2015"},{model:"JAGUAR XF (X260)",program:"12886",year:"2016"},{model:"JAGUAR XF (X250)",program:"11566",year:"2012"},{model:"JAGUAR XF (X250)",program:"11241",year:"2008"},{model:"JAGUAR XJ (X351)",program:"11233",year:"2011"},{model:"JAGUAR XJ (X350)",program:"11311",year:"2003"},{model:"JAGUAR XJL (X351)",program:"11233",year:"2011"},{model:"JAGUAR XK (X150)",program:"11196",year:"2007"},{model:"JEEP CHEROKEE",program:"12552",year:"2019"},{model:"JEEP CHEROKEE",program:"11528",year:"2014"},{model:"JEEP COMMANDER",program:"11116",year:"2006"},{model:"JEEP COMPASS (Keyless)",program:"12294",year:"2017"},{model:"JEEP COMPASS",program:"12291",year:"2017"},{model:"JEEP COMPASS",program:"11278",year:"2014"},{model:"JEEP COMPASS",program:"11116",year:"2007"},{model:"JEEP GRAND CHEROKEE",program:"13218",year:"2014"},{model:"JEEP GRAND CHEROKEE",program:"11245",year:"2010"},{model:"JEEP GRAND CHEROKEE",program:"11278",year:"2005"},{model:"JEEP LAREDO",program:"11278",year:"2005"},{model:"JEEP PATRIOT",program:"11116",year:"2007"},{model:"JEEP RENEGADE",program:"12286",year:"2018"},{model:"JEEP RENEGADE (Keyless)",program:"12296",year:"2018"},{model:"JEEP RENEGADE (Keyless)",program:"11554",year:"2015"},{model:"JEEP RENEGADE",program:"11599",year:"2015"},{model:"JEEP WRANGLER (RUBICON)",program:"12475",year:"2018"},{model:"JEEP WRANGLER",program:"11245",year:"2007"},{model:"KAMAZ 43118",program:"12861",year:"2015"},{model:"KAMAZ 43253 (Engine Cummins)",program:"11222",year:"2008"},{model:"KAMAZ 53605",program:"11222",year:"2011"},{model:"KAMAZ 5490 (EURO 5) CNG",program:"13134",year:"2017"},{model:"KAMAZ 5490 (EURO 5) CNG",program:"12823",year:"2013"},{model:"KAMAZ 5490 (EURO 5)",program:"11662",year:"2013"},{model:"KAMAZ 65115",program:"12825",year:"2015"},{model:"KAMAZ 65115",program:"11222",year:"2008"},{model:"KAMAZ 65117",program:"11222",year:"2007"},{model:"KAMAZ 6520 (EURO 4) (Engine Cummins)",program:"11248",year:"2007"},{model:"KAMAZ T2642 (EURO 5)",program:"11947",year:"2016"},{model:"KAMAZ MARCOPOLO BRAVIS",program:"12147",year:"2014"},{model:"KENWORTH C500",program:"11222",year:"2005"},{model:"KENWORTH C500",program:"11248",year:"1997"},{model:"KENWORTH K500",program:"11286",year:"2008"},{model:"KENWORTH T2000",program:"11248",year:"2001"},{model:"KIA CADENZA (Keyless)",program:"11363",year:"2009"},{model:"KIA CARENS",program:"12436",year:"2016"},{model:"KIA CARENS",program:"11398",year:"2013"},{model:"KIA CARNIVAL",program:"11119",year:"2006"},{model:"KIA CEED (Hybrid) (Plug-in)",program:"13256",year:"2020"},{model:"KIA CEED",program:"12441",year:"2018"},{model:"KIA CEED",program:"11657",year:"2016"},{model:"KIA CEED (Keyless) (SlovakianMarket)",program:"11918",year:"2016"},{model:"KIA CEED PRO GT (Keyless)",program:"11352",year:"2014"},{model:"KIA CEED GT (Keyless)",program:"11352",year:"2014"},{model:"KIA CEED (Keyless)",program:"11352",year:"2013"},{model:"KIA CEED",program:"11389",year:"2013"},{model:"KIA CEED",program:"11236",year:"2009"},{model:"KIA CERATO",program:"12642",year:"2018"},{model:"KIA CERATO (Keyless)",program:"11344",year:"2013"},{model:"KIA CERATO",program:"11412",year:"2013"},{model:"KIA CERATO",program:"11479",year:"2010"},{model:"KIA K5 (Keyless) (BETA)",program:"13232",year:"2020"},{model:"KIA K7 (KoreanMarket)",program:"13226",year:"2020"},{model:"KIA K900",program:"12646",year:"2018"},{model:"KIA MAGENTIS",program:"11236",year:"2009"},{model:"KIA MOHAVE",program:"12645",year:"2018"},{model:"KIA MOHAVE (Keyless)",program:"11478",year:"2011"},{model:"KIA MOHAVE",program:"11232",year:"2009"},{model:"KIA NIRO (Hybrid)",program:"13285",year:"2020"},{model:"KIA NIRO (Electric)",program:"13254",year:"2020"},{model:"KIA NIRO (Hybrid)",program:"11813",year:"2016"},{model:"KIA NIRO (Hybrid) (Plug-in)",program:"13125",year:"2016"},{model:"KIA OPIRUS",program:"11234",year:"2004"},{model:"KIA OPTIMA (Hybrid) (Plug-in)",program:"13264",year:"2018"},{model:"KIA OPTIMA (Keyless)",program:"13283",year:"2018"},{model:"KIA OPTIMA (Keyless)",program:"12367",year:"2016"},{model:"KIA OPTIMA",program:"12368",year:"2016"},{model:"KIA OPTIMA",program:"11564",year:"2014"},{model:"KIA OPTIMA",program:"11344",year:"2012"},{model:"KIA PICANTO GT LINE",program:"12177",year:"2018"},{model:"KIA PICANTO",program:"11299",year:"2011"},{model:"KIA PROCEED",program:"13284",year:"2019"},{model:"KIA QUORIS (Keyless)",program:"11413",year:"2013"},{model:"KIA RIO",program:"13277",year:"2020"},{model:"KIA RIO",program:"11979",year:"2017"},{model:"KIA RIO (RussianMarket)",program:"12194",year:"2017"},{model:"KIA RIO (RussianMarket)(Keyless)",program:"11416",year:"2013"},{model:"KIA RIO (RussianMarket)",program:"11479",year:"2013"},{model:"KIA RIO",program:"11244",year:"2011"},{model:"KIA RIO",program:"11236",year:"2005"},{model:"KIA SORENTO",program:"13268",year:"2018"},{model:"KIA SORENTO",program:"11621",year:"2015"},{model:"KIA SORENTO",program:"11411",year:"2012"},{model:"KIA SORENTO",program:"11231",year:"2010"},{model:"KIA SORENTO PRIME",program:"12285",year:"2015"},{model:"KIA SOUL",program:"12794",year:"2018"},{model:"KIA SOUL (Keyless)",program:"11498",year:"2014"},{model:"KIA SOUL",program:"11514",year:"2014"},{model:"KIA SOUL",program:"11343",year:"2012"},{model:"KIA SOUL (Keyless)",program:"11481",year:"2012"},{model:"KIA SPORTAGE",program:"12433",year:"2019"},{model:"KIA SPORTAGE",program:"11812",year:"2016"},{model:"KIA SPORTAGE (Keyless)",program:"11669",year:"2016"},{model:"KIA SPORTAGE",program:"11244",year:"2011"},{model:"KIA SPORTAGE",program:"11236",year:"2008"},{model:"KIA STINGER",program:"12434",year:"2018"},{model:"KIA STONIC",program:"12435",year:"2017"},{model:"KIA VENGA",program:"11236",year:"2012"},{model:"KIA VENGA (Keyless)",program:"11271",year:"2010"},{model:"KIA XCEED",program:"13257",year:"2020"},{model:"KIA XCEED (Hybrid) (Plug-in)",program:"13286",year:"2020"},{model:"KING LONG XMQ6129Y (EURO 4)",program:"12144",year:"2012"},{model:"LADA GRANTA",program:"13231",year:"2019"},{model:"LADA GRANTA",program:"11461",year:"2012"},{model:"LADA KALINA",program:"11461",year:"2014"},{model:"LADA LARGUS",program:"12619",year:"2012"},{model:"LADA LARGUS CROSS",program:"11796",year:"2012"},{model:"LADA PRIORA",program:"11461",year:"2015"},{model:"LADA VESTA (SW CROSS)",program:"12245",year:"2018"},{model:"LADA VESTA",program:"11699",year:"2015"},{model:"LADA X-RAY",program:"11574",year:"2016"},{model:"LANCIA DELTA",program:"11129",year:"2008"},{model:"LANCIA MUSA",program:"11129",year:"2007"},{model:"LANCIA PHEDRA",program:"11143",year:"2007"},{model:"LANCIA PHEDRA",program:"11193",year:"2007"},{model:"LANCIA THEMA (Keyless)",program:"11332",year:"2011"},{model:"LANCIA YPSILON",program:"11127",year:"2011"},{model:"LANCIA YPSILON",program:"11129",year:"2006"},{model:"LAND ROVER DEFENDER (L316)",program:"11447",year:"2012"},{model:"LAND ROVER DISCOVERY 3 (L319)",program:"11199",year:"2006"},{model:"LAND ROVER DISCOVERY 4 (L319)",program:"11233",year:"2010"},{model:"LAND ROVER DISCOVERY 5 (L462)",program:"12889",year:"2019"},{model:"LAND ROVER DISCOVERY 5 (L462)",program:"11899",year:"2017"},{model:"LAND ROVER DISCOVERY SPORT",program:"12883",year:"2020"},{model:"LAND ROVER DISCOVERY SPORT (L550)",program:"12854",year:"2016"},{model:"LAND ROVER FREELANDER 2 (L359)",program:"11446",year:"2013"},{model:"LAND ROVER FREELANDER 2 (L359)",program:"11214",year:"2007"},{model:"LAND ROVER LR2 (L359)",program:"11214",year:"2007"},{model:"LAND ROVER RANGE ROVER (L405)",program:"12887",year:"2018"},{model:"LAND ROVER RANGE ROVER (L405)",program:"11445",year:"2014"},{model:"LAND ROVER RANGE ROVER (L322)",program:"11213",year:"2006"},{model:"LAND ROVER RANGE ROVER EVOQUE (L551)",program:"12882",year:"2019"},{model:"LAND ROVER RANGE ROVER EVOQUE (L538)",program:"12745",year:"2017"},{model:"LAND ROVER RANGE ROVER EVOQUE (L538)",program:"11446",year:"2014"},{model:"LAND ROVER RANGE ROVER",program:"11233",year:"2011"},{model:"LAND ROVER RANGE ROVER SPORT (L494)",program:"12429",year:"2018"},{model:"LAND ROVER RANGE ROVER SPORT (L494)",program:"11849",year:"2017"},{model:"LAND ROVER RANGE ROVER SPORT (L494)",program:"11445",year:"2014"},{model:"LAND ROVER RANGE ROVER SPORT (L320)",program:"13252",year:"2010"},{model:"LAND ROVER RANGE ROVER SPORT (L320)",program:"11199",year:"2006"},{model:"LAND ROVER RANGE ROVER VELAR (L560) (RHD)",program:"12783",year:"2017"},{model:"LAND ROVER RANGE ROVER VELAR (L560)",program:"12154",year:"2017"},{model:"LAND ROVER RANGE ROVER VOGUE (L405)",program:"12241",year:"2018"},{model:"LAND ROVER RANGE ROVER Vogue (L405)",program:"11445",year:"2014"},{model:"LAND ROVER RANGE ROVER Vogue (L322)",program:"12855",year:"2010"},{model:"LEXUS CT (Hybrid)",program:"13193",year:"2018"},{model:"LEXUS CT (Hybrid)",program:"11138",year:"2011"},{model:"LEXUS ES (Hybrid)",program:"13192",year:"2019"},{model:"LEXUS ES",program:"11338",year:"2013"},{model:"LEXUS ES (Hybrid)",program:"11338",year:"2013"},{model:"LEXUS ES",program:"11138",year:"2007"},{model:"LEXUS GS (Hybrid)",program:"13214",year:"2016"},{model:"LEXUS GS (Hybrid)",program:"11338",year:"2013"},{model:"LEXUS GS",program:"11338",year:"2012"},{model:"LEXUS GS",program:"11181",year:"2006"},{model:"LEXUS GX",program:"11568",year:"2014"},{model:"LEXUS GX",program:"11138",year:"2010"},{model:"LEXUS IS (Hybrid)",program:"13215",year:"2017"},{model:"LEXUS IS",program:"11338",year:"2013"},{model:"LEXUS IS",program:"11181",year:"2005"},{model:"LEXUS LS",program:"11251",year:"2006"},{model:"LEXUS LX",program:"11668",year:"2015"},{model:"LEXUS LX",program:"11138",year:"2012"},{model:"LEXUS LX",program:"11138",year:"2008"},{model:"LEXUS NX (Hybrid)",program:"12851",year:"2017"},{model:"LEXUS NX",program:"11893",year:"2014"},{model:"LEXUS RC",program:"11338",year:"2016"},{model:"LEXUS RX",program:"13194",year:"2020"},{model:"LEXUS RX (CanadaMarket)",program:"12564",year:"2017"},{model:"LEXUS RX (Hybrid)",program:"11968",year:"2016"},{model:"LEXUS RX",program:"11138",year:"2010"},{model:"LEXUS RX",program:"11226",year:"2010"},{model:"LEXUS SC",program:"11138",year:"2006"},{model:"LEXUS UX",program:"12714",year:"2019"},{model:"LEXUS UX (Hybrid)",program:"12846",year:"2019"},{model:"LIAZ 5292.22",program:"11817",year:"2011"},{model:"LIAZ 621321-01 (EURO 4)",program:"11539",year:"2006"},{model:"LIFAN CEBRIUM (720)",program:"11594",year:"2014"},{model:"LIFAN MYWAY",program:"12243",year:"2017"},{model:"LIFAN SOLANO (620)",program:"11595",year:"2013"},{model:"LUXGEN U7 TURBO",program:"11518",year:"2014"},{model:"MAN LE (12.220)",program:"11219",year:"2004"},{model:"MAN LION'S COACH (EURO 5)",program:"11219",year:"2009"},{model:"MAN TGA",program:"11219",year:"2005"},{model:"MAN TGE (UY)",program:"12451",year:"2017"},{model:"MAN TGE (UZ)",program:"12452",year:"2017"},{model:"MAN TGL",program:"11219",year:"2005"},{model:"MAN TGM",program:"11219",year:"2005"},{model:"MAN TGS (EURO 6)",program:"12437",year:"2018"},{model:"MAN TGS",program:"11219",year:"2005"},{model:"MAN TGX",program:"11219",year:"2007"},{model:"MAN TGX EFFICIENT LINE (EURO 6)",program:"12438",year:"2017"},{model:"MASERATI GHIBLI",program:"13291",year:"2017"},{model:"MASERATI GHIBLI",program:"12676",year:"2013"},{model:"MASERATI LEVANTE",program:"12486",year:"2017"},{model:"MAZ 206086 (EURO 5)",program:"11827",year:"2014"},{model:"MAZ 6310 (EURO 4)",program:"12143",year:"2014"},{model:"MAZ 6430B9 (EURO 4)",program:"13235",year:"2015"},{model:"MAZ 6430C9 (EURO 4)",program:"13236",year:"2020"},{model:"MAZ 6501B5 (EURO 4)",program:"11639",year:"2014"},{model:"MAZDA 2 (DE)",program:"11195",year:"2007"},{model:"MAZDA 2 (NC)",program:"11667",year:"2002"},{model:"MAZDA 3 (BP)",program:"12782",year:"2019"},{model:"MAZDA 3 (BN)",program:"12832",year:"2016"},{model:"MAZDA 3 (BM) (RHD)",program:"12833",year:"2014"},{model:"MAZDA 3 (BM)",program:"11339",year:"2014"},{model:"MAZDA 3 (BL)",program:"11195",year:"2009"},{model:"MAZDA 3 (BK)",program:"11121",year:"2005"},{model:"MAZDA 5 (CR)",program:"11228",year:"2006"},{model:"MAZDA 6 (GL)",program:"13196",year:"2017"},{model:"MAZDA 6 (GJ)",program:"11339",year:"2013"},{model:"MAZDA 6 (GH)",program:"11643",year:"2008"},{model:"MAZDA 6 (GG / GY)",program:"11337",year:"2005"},{model:"MAZDA CX3 (DK)",program:"11966",year:"2016"},{model:"MAZDA CX5 (KF)",program:"12447",year:"2017"},{model:"MAZDA CX5 (KE) (Keyless)",program:"11973",year:"2017"},{model:"MAZDA CX5 (KE)",program:"11339",year:"2012"},{model:"MAZDA CX7 (ER)",program:"11154",year:"2007"},{model:"MAZDA CX9 (TC)",program:"12164",year:"2016"},{model:"MAZDA CX9 (TB)",program:"11154",year:"2007"},{model:"MAZDA MX5 (NC)",program:"11195",year:"2005"},{model:"MERCEDES A (177)",program:"12425",year:"2018"},{model:"MERCEDES A (176)",program:"11399",year:"2013"},{model:"MERCEDES A (169)",program:"11162",year:"2004"},{model:"MERCEDES A (168)",program:"11246",year:"1997"},{model:"MERCEDES ACTROS MP5 (EURO 6) (FMS)",program:"13274",year:"2019"},{model:"MERCEDES ACTROS MP5 (EURO 6)",program:"12761",year:"2019"},{model:"MERCEDES ACTROS MP4 (EURO 6)",program:"11862",year:"2011"},{model:"MERCEDES ACTROS MP3",program:"11148",year:"2008"},{model:"MERCEDES ACTROS MP2",program:"11148",year:"2003"},{model:"MERCEDES ACTROS MP1",program:"11148",year:"1997"},{model:"MERCEDES ANTOS (EURO 6)",program:"11861",year:"2013"},{model:"MERCEDES AROCS (EURO 6)",program:"11857",year:"2013"},{model:"MERCEDES ATEGO (EURO 6)",program:"12135",year:"2016"},{model:"MERCEDES ATEGO",program:"11148",year:"2004"},{model:"MERCEDES AXOR (EURO 5) (TACHO SIMPLE)",program:"12287",year:"2009"},{model:"MERCEDES AXOR",program:"11148",year:"2002"},{model:"MERCEDES B (246)",program:"11399",year:"2012"},{model:"MERCEDES B (245)",program:"11162",year:"2005"},{model:"MERCEDES C (205) (RHD)",program:"12791",year:"2018"},{model:"MERCEDES C (205)",program:"12859",year:"2018"},{model:"MERCEDES C (205)",program:"11485",year:"2014"},{model:"MERCEDES C (204)",program:"13242",year:"2007"},{model:"MERCEDES C (203)",program:"11159",year:"2001"},{model:"MERCEDES C CABRIO (205)",program:"13198",year:"2016"},{model:"MERCEDES CITAN (415)",program:"12247",year:"2017"},{model:"MERCEDES CITAN (415)",program:"11174",year:"2012"},{model:"MERCEDES CITARO (EURO 5)",program:"11541",year:"2009"},{model:"MERCEDES CL (216)",program:"11141",year:"2007"},{model:"MERCEDES CL (215)",program:"11125",year:"2002"},{model:"MERCEDES CL (215)",program:"11125",year:"1999"},{model:"MERCEDES CLA COUPE (117)",program:"11399",year:"2013"},{model:"MERCEDES CLK (209)",program:"11117",year:"2003"},{model:"MERCEDES CLK (208)",program:"11157",year:"1999"},{model:"MERCEDES CLS (257)",program:"12445",year:"2018"},{model:"MERCEDES CLS (218)",program:"11141",year:"2011"},{model:"MERCEDES CLS (219)",program:"11117",year:"2005"},{model:"MERCEDES CONECTO SOLO (EURO 5)",program:"11513",year:"2009"},{model:"MERCEDES E (213)",program:"13197",year:"2017"},{model:"MERCEDES E (213)",program:"11693",year:"2016"},{model:"MERCEDES E (212)",program:"11491",year:"2013"},{model:"MERCEDES E (212)",program:"11141",year:"2009"},{model:"MERCEDES E (211)",program:"11117",year:"2002"},{model:"MERCEDES E (210)",program:"11157",year:"1997"},{model:"MERCEDES E CABRIO (207)",program:"12618",year:"2010"},{model:"MERCEDES E COUPE (238)",program:"12119",year:"2017"},{model:"MERCEDES E COUPE (207)",program:"11141",year:"2009"},{model:"MERCEDES EQC (293) (Electric)",program:"12935",year:"2019"},{model:"MERCEDES G (463)",program:"12525",year:"2018"},{model:"MERCEDES G (463)",program:"11399",year:"2012"},{model:"MERCEDES G (463)",program:"11159",year:"2004"},{model:"MERCEDES GL (166)",program:"11836",year:"2013"},{model:"MERCEDES GL (164)",program:"11117",year:"2006"},{model:"MERCEDES GLA (156)",program:"13199",year:"2018"},{model:"MERCEDES GLA (156)",program:"11399",year:"2014"},{model:"MERCEDES GLC (253)",program:"11688",year:"2016"},{model:"MERCEDES GLC COUPE (253)",program:"12581",year:"2016"},{model:"MERCEDES GLC_COUPE (253)",program:"12881",year:"2020"},{model:"MERCEDES GLE (167)",program:"12934",year:"2019"},{model:"MERCEDES GLE (166)",program:"13246",year:"2016"},{model:"MERCEDES GLE COUPE (292)",program:"11686",year:"2016"},{model:"MERCEDES GLK (204)",program:"11141",year:"2008"},{model:"MERCEDES GLS (166)",program:"11686",year:"2016"},{model:"MERCEDES INTOURO",program:"11349",year:"2007"},{model:"MERCEDES ML (166)",program:"11399",year:"2012"},{model:"MERCEDES ML (164)",program:"11117",year:"2005"},{model:"MERCEDES ML (163)",program:"11246",year:"1998"},{model:"MERCEDES R (251)",program:"11117",year:"2006"},{model:"MERCEDES S (222)",program:"12118",year:"2018"},{model:"MERCEDES S (222)",program:"11485",year:"2013"},{model:"MERCEDES S (221)",program:"11141",year:"2009"},{model:"MERCEDES S (221)",program:"12614",year:"2005"},{model:"MERCEDES S (220)",program:"11125",year:"2002"},{model:"MERCEDES S (220)",program:"11125",year:"1998"},{model:"MERCEDES S COUPE (217)",program:"12663",year:"2015"},{model:"MERCEDES SL (231)",program:"12844",year:"2012"},{model:"MERCEDES SL (230)",program:"13245",year:"2008"},{model:"MERCEDES SL (230)",program:"11125",year:"2001"},{model:"MERCEDES SLK (172)",program:"11491",year:"2011"},{model:"MERCEDES SLK (171)",program:"11163",year:"2005"},{model:"MERCEDES SPRINTER (907)",program:"12454",year:"2018"},{model:"MERCEDES SPRINTER (910)",program:"12512",year:"2018"},{model:"MERCEDES SPRINTER (906)",program:"12671",year:"2013"},{model:"MERCEDES SPRINTER (909)",program:"11598",year:"2013"},{model:"MERCEDES SPRINTER (906)",program:"11164",year:"2006"},{model:"MERCEDES SPRINTER",program:"11246",year:"2001"},{model:"MERCEDES TOURISMO (EURO 6)",program:"12622",year:"2018"},{model:"MERCEDES TOURISMO RHD M (EURO 6)",program:"11222",year:"2016"},{model:"MERCEDES TOURISMO RHD M (EURO 6)",program:"11546",year:"2016"},{model:"MERCEDES TOURISMO BLUETEC 5 (RussianMarket)",program:"11546",year:"2015"},{model:"MERCEDES TOURISMO RHD L (EURO 6)",program:"11546",year:"2014"},{model:"MERCEDES TOURISMO RHD L (EURO 5)",program:"11222",year:"2009"},{model:"MERCEDES TOURISMO RHD L (EURO 5)",program:"11467",year:"2009"},{model:"MERCEDES TOURISMO RHD L (EURO 4)",program:"11349",year:"2006"},{model:"MERCEDES TOURISMO O 350 (EURO 3)",program:"11148",year:"2003"},{model:"MERCEDES TRAVEGO RHD (EURO 5)",program:"11467",year:"2008"},{model:"MERCEDES UNIMOG U400",program:"11148",year:"2006"},{model:"MERCEDES UNIMOG U500 (EURO 4)",program:"11854",year:"2006"},{model:"MERCEDES V (447)",program:"11521",year:"2014"},{model:"MERCEDES VIANO (639)",program:"11164",year:"2003"},{model:"MERCEDES VITO (447)",program:"11856",year:"2014"},{model:"MERCEDES VITO (639)",program:"11164",year:"2003"},{model:"MERCEDES X (470)",program:"12448",year:"2017"},{model:"MINI CLUBMAN (F54)",program:"13262",year:"2020"},{model:"MINI CLUBMAN (F45)",program:"11724",year:"2015"},{model:"MINI COOPER (F55)",program:"13261",year:"2020"},{model:"MINI COOPER (F56)",program:"11724",year:"2015"},{model:"MINI COOPER (F57)",program:"11724",year:"2015"},{model:"MINI COOPER (F55)",program:"11724",year:"2015"},{model:"MINI COOPER (R56)",program:"11118",year:"2006"},{model:"MINI COOPER (R56) (Keyless)",program:"11137",year:"2006"},{model:"MINI COOPER D (F55)",program:"11724",year:"2015"},{model:"MINI COUNTRYMAN (F60)",program:"12683",year:"2017"},{model:"MINI COUNTRYMAN (R60)",program:"11118",year:"2010"},{model:"MINI COUNTRYMAN (R60) (Keyless)",program:"11137",year:"2010"},{model:"MINI COUNTRYMAN SE (F60) (Hybrid) (Plug-in)",program:"13253",year:"2017"},{model:"MINI JCW (F56)",program:"13263",year:"2016"},{model:"MINI ONE (R56)",program:"11118",year:"2007"},{model:"MINI ONE (R56) (Keyless)",program:"11137",year:"2007"},{model:"MINI PACEMAN (R61)",program:"11118",year:"2013"},{model:"MINI PACEMAN (R61) (Keyless)",program:"11137",year:"2013"},{model:"MITSUBISHI ASX",program:"11451",year:"2010"},{model:"MITSUBISHI COLT",program:"11394",year:"2008"},{model:"MITSUBISHI ECLIPSE CROSS (Keyless)",program:"12655",year:"2018"},{model:"MITSUBISHI FUSO CANTER",program:"12473",year:"2016"},{model:"MITSUBISHI FUSO CANTER (RussianMarket)",program:"12149",year:"2015"},{model:"MITSUBISHI FUSO CANTER",program:"11499",year:"2012"},{model:"MITSUBISHI I-MIEV (Electric)",program:"11914",year:"2013"},{model:"MITSUBISHI I-MIEV (Electric)",program:"11783",year:"2009"},{model:"MITSUBISHI L200",program:"11712",year:"2015"},{model:"MITSUBISHI L200",program:"11179",year:"2006"},{model:"MITSUBISHI LANCER (X)",program:"11451",year:"2011"},{model:"MITSUBISHI LANCER (X)",program:"11142",year:"2008"},{model:"MITSUBISHI OUTLANDER (Keyless)",program:"12643",year:"2018"},{model:"MITSUBISHI OUTLANDER",program:"11393",year:"2013"},{model:"MITSUBISHI OUTLANDER (XL)",program:"11142",year:"2007"},{model:"MITSUBISHI OUTLANDER SPORT (RHD)",program:"12546",year:"2010"},{model:"MITSUBISHI PAJERO",program:"11178",year:"2007"},{model:"MITSUBISHI PAJERO SPORT",program:"12161",year:"2016"},{model:"MITSUBISHI PAJERO SPORT (RHD)",program:"12548",year:"2013"},{model:"MITSUBISHI PAJERO SPORT",program:"11179",year:"2008"},{model:"MITSUBISHI SPACE STAR",program:"11618",year:"2014"},{model:"MITSUBISHI TRITON (RHD)",program:"12544",year:"2016"},{model:"NAVECO C300",program:"12244",year:"2015"},{model:"NEOPLAN DURABUS",program:"11723",year:"2012"},{model:"NISSAN 350Z",program:"11216",year:"2006"},{model:"NISSAN 350Z (Z33)",program:"11728",year:"2004"},{model:"NISSAN ALTIMA",program:"11216",year:"2007"},{model:"NISSAN CABSTAR",program:"11289",year:"2007"},{model:"NISSAN CUBE",program:"11259",year:"2010"},{model:"NISSAN e-NV200 (Electric)",program:"12983",year:"2018"},{model:"NISSAN EVALIA (RHD)",program:"12549",year:"2012"},{model:"NISSAN GT-R",program:"12748",year:"2015"},{model:"NISSAN INTERSTAR",program:"11224",year:"2006"},{model:"NISSAN JUKE (F16)",program:"13121",year:"2020"},{model:"NISSAN JUKE (F15)",program:"12543",year:"2018"},{model:"NISSAN JUKE (F15) (Keyless)",program:"12545",year:"2018"},{model:"NISSAN JUKE",program:"11259",year:"2010"},{model:"NISSAN LEAF (ZE1) (Electric)",program:"12346",year:"2018"},{model:"NISSAN LEAF (ZE0) (Electric)",program:"12112",year:"2016"},{model:"NISSAN LEAF (CP6) (Electric)",program:"11665",year:"2010"},{model:"NISSAN MAXIMA",program:"13278",year:"2019"},{model:"NISSAN MAXIMA",program:"11174",year:"2004"},{model:"NISSAN MICRA (K14) (Keyless)",program:"11938",year:"2017"},{model:"NISSAN MICRA (K14)",program:"11963",year:"2017"},{model:"NISSAN MICRA",program:"11259",year:"2010"},{model:"NISSAN MICRA",program:"11145",year:"2006"},{model:"NISSAN MICRA (Keyless)",program:"11186",year:"2006"},{model:"NISSAN MURANO (Z52)",program:"11958",year:"2015"},{model:"NISSAN MURANO (Z51)",program:"11216",year:"2011"},{model:"NISSAN MURANO",program:"11174",year:"2007"},{model:"NISSAN NAVARA",program:"11139",year:"2005"},{model:"NISSAN NAVARA NP300 (D23)",program:"12972",year:"2015"},{model:"NISSAN NOTE",program:"11259",year:"2013"},{model:"NISSAN NOTE",program:"11145",year:"2006"},{model:"NISSAN NOTE (Keyless)",program:"11186",year:"2006"},{model:"NISSAN NT400",program:"12271",year:"2014"},{model:"NISSAN NV200 EVALIA",program:"11259",year:"2013"},{model:"NISSAN NV200",program:"11145",year:"2009"},{model:"NISSAN PATHFINDER (R52) (Keyless)",program:"11387",year:"2015"},{model:"NISSAN PATHFINDER (R52) (Keyless) (Hybrid)",program:"12236",year:"2014"},{model:"NISSAN PATHFINDER (Keyless) (USA Market)",program:"12237",year:"2006"},{model:"NISSAN PATHFINDER (USA Market)",program:"12238",year:"2006"},{model:"NISSAN PATROL",program:"11279",year:"2011"},{model:"NISSAN PRIMASTAR",program:"11224",year:"2001"},{model:"NISSAN PULSAR (C13)",program:"11468",year:"2014"},{model:"NISSAN QASHQAI (J11) (RHD)",program:"12784",year:"2017"},{model:"NISSAN QASHQAI (J11)",program:"12124",year:"2017"},{model:"NISSAN QASHQAI (J11)",program:"11468",year:"2014"},{model:"NISSAN QASHQAI",program:"11139",year:"2007"},{model:"NISSAN QASHQAI (Keyless)",program:"11147",year:"2007"},{model:"NISSAN ROGUE",program:"11174",year:"2007"},{model:"NISSAN SENTRA (B17)",program:"11297",year:"2014"},{model:"NISSAN TEANA (L33) (Keyless)",program:"11567",year:"2014"},{model:"NISSAN TEANA (J32)",program:"11216",year:"2011"},{model:"NISSAN TEANA (J32)",program:"11216",year:"2008"},{model:"NISSAN TERRANO",program:"11283",year:"2014"},{model:"NISSAN TIIDA",program:"11145",year:"2007"},{model:"NISSAN TIIDA (Keyless)",program:"11186",year:"2007"},{model:"NISSAN TITAN",program:"11259",year:"2004"},{model:"NISSAN WINGROAD (Y12)",program:"11147",year:"2006"},{model:"NISSAN X-TRAIL (T32)",program:"12125",year:"2017"},{model:"NISSAN X-TRAIL (T32)",program:"11468",year:"2014"},{model:"NISSAN X-TRAIL",program:"11139",year:"2007"},{model:"NISSAN X-TRAIL (Keyless)",program:"11147",year:"2007"},{model:"OPEL ADAM",program:"11183",year:"2013"},{model:"OPEL ANTARA",program:"11149",year:"2007"},{model:"OPEL ASTRA K",program:"11834",year:"2016"},{model:"OPEL ASTRA J",program:"11183",year:"2010"},{model:"OPEL ASTRA H",program:"11184",year:"2004"},{model:"OPEL COMBO E",program:"12728",year:"2019"},{model:"OPEL COMBO D",program:"11127",year:"2012"},{model:"OPEL COMBO C",program:"11322",year:"2006"},{model:"OPEL CORSA F",program:"13213",year:"2020"},{model:"OPEL CORSA E",program:"11243",year:"2014"},{model:"OPEL CORSA D",program:"11354",year:"2006"},{model:"OPEL CROSSLAND X",program:"12348",year:"2018"},{model:"OPEL GRANDLAND X",program:"12347",year:"2017"},{model:"OPEL INSIGNIA A",program:"11453",year:"2014"},{model:"OPEL INSIGNIA A",program:"11183",year:"2009"},{model:"OPEL INSIGNIA B",program:"12341",year:"2017"},{model:"OPEL KARL",program:"13212",year:"2016"},{model:"OPEL MERIVA B",program:"11183",year:"2010"},{model:"OPEL MOKKA",program:"11243",year:"2012"},{model:"OPEL MOKKA X",program:"11912",year:"2016"},{model:"OPEL MOVANO (EURO 6)",program:"13147",year:"2019"},{model:"OPEL MOVANO (EURO 6)",program:"12922",year:"2014"},{model:"OPEL MOVANO",program:"11436",year:"2010"},{model:"OPEL SIGNUM",program:"11114",year:"2002"},{model:"OPEL VECTRA C",program:"11114",year:"2002"},{model:"OPEL VIVARO",program:"12849",year:"2019"},{model:"OPEL VIVARO",program:"12839",year:"2014"},{model:"OPEL VIVARO",program:"11224",year:"2001"},{model:"OPEL ZAFIRA TOURER C",program:"11183",year:"2012"},{model:"OPEL ZAFIRA B",program:"11184",year:"2005"},{model:"OTOKAR VECTIO T (EURO 6)",program:"11818",year:"2016"},{model:"PAZ 320412",program:"11619",year:"2013"},{model:"PAZ VECTOR 3",program:"11619",year:"2014"},{model:"PEUGEOT 2008 (GT-line) (Keyless)",program:"13124",year:"2020"},{model:"PEUGEOT 2008",program:"11298",year:"2013"},{model:"PEUGEOT 207",program:"11143",year:"2006"},{model:"PEUGEOT 207",program:"11193",year:"2006"},{model:"PEUGEOT 208",program:"13153",year:"2019"},{model:"PEUGEOT 208",program:"11298",year:"2012"},{model:"PEUGEOT 3008 (Hybrid) (Plug-in)",program:"13127",year:"2020"},{model:"PEUGEOT 3008 (Allure) (Keyless)",program:"13122",year:"2017"},{model:"PEUGEOT 3008",program:"11143",year:"2009"},{model:"PEUGEOT 3008",program:"11193",year:"2009"},{model:"PEUGEOT 307",program:"11193",year:"2006"},{model:"PEUGEOT 307",program:"11143",year:"2006"},{model:"PEUGEOT 308",program:"12924",year:"2017"},{model:"PEUGEOT 308",program:"11143",year:"2007"},{model:"PEUGEOT 308",program:"11193",year:"2007"},{model:"PEUGEOT 4007",program:"11142",year:"2007"},{model:"PEUGEOT 4008",program:"11451",year:"2012"},{model:"PEUGEOT 407",program:"11143",year:"2006"},{model:"PEUGEOT 407",program:"11193",year:"2006"},{model:"PEUGEOT 408",program:"11143",year:"2010"},{model:"PEUGEOT 408",program:"11193",year:"2010"},{model:"PEUGEOT 5008",program:"13152",year:"2017"},{model:"PEUGEOT 508",program:"13151",year:"2018"},{model:"PEUGEOT 508 (Active) (Hybrid)",program:"12925",year:"2012"},{model:"PEUGEOT 508",program:"11298",year:"2011"},{model:"PEUGEOT 508 (Allure) (Keyless)",program:"12953",year:"2010"},{model:"PEUGEOT 607 (Z9)",program:"11143",year:"2005"},{model:"PEUGEOT 607 (Z9)",program:"11193",year:"2005"},{model:"PEUGEOT 807",program:"11143",year:"2006"},{model:"PEUGEOT 807",program:"11193",year:"2006"},{model:"PEUGEOT BIPPER",program:"11127",year:"2008"},{model:"PEUGEOT BOXER",program:"12213",year:"2014"},{model:"PEUGEOT BOXER",program:"13166",year:"2011"},{model:"PEUGEOT BOXER",program:"11129",year:"2006"},{model:"PEUGEOT e-208 (Keyless) (Electric)",program:"13129",year:"2019"},{model:"PEUGEOT EXPERT",program:"13114",year:"2016"},{model:"PEUGEOT EXPERT",program:"11143",year:"2007"},{model:"PEUGEOT EXPERT",program:"11193",year:"2007"},{model:"PEUGEOT PARTNER",program:"13288",year:"2019"},{model:"PEUGEOT PARTNER (Tepee)",program:"11143",year:"2008"},{model:"PEUGEOT PARTNER (Tepee)",program:"11193",year:"2008"},{model:"PEUGEOT PARTNER",program:"11292",year:"2003"},{model:"PEUGEOT RIFTER",program:"12789",year:"2018"},{model:"PORSCHE 718 CAYMAN (982)",program:"13223",year:"2017"},{model:"PORSCHE 911",program:"11153",year:"2006"},{model:"PORSCHE BOXSTER (981)",program:"12969",year:"2012"},{model:"PORSCHE BOXSTER",program:"11153",year:"2006"},{model:"PORSCHE CARRERA 4",program:"11153",year:"2006"},{model:"PORSCHE CAYENNE (92)",program:"11225",year:"2010"},{model:"PORSCHE CAYENNE",program:"11122",year:"2006"},{model:"PORSCHE CAYMAN (981)",program:"12776",year:"2012"},{model:"PORSCHE CAYMAN",program:"11153",year:"2006"},{model:"PORSCHE PANAMERA",program:"11225",year:"2009"},{model:"PORSCHE PANAMERA TURBO",program:"12749",year:"2017"},{model:"RAM 1500",program:"12526",year:"2019"},{model:"RAM 1500",program:"11332",year:"2013"},{model:"RAM 1500 PROMASTER",program:"13258",year:"2020"},{model:"RAM 1500 PROMASTER",program:"12668",year:"2017"},{model:"RAM 1500 PROMASTER",program:"12667",year:"2014"},{model:"RAM 2500 PROMASTER",program:"13258",year:"2020"},{model:"RAM 2500 PROMASTER",program:"12668",year:"2017"},{model:"RAM 2500 PROMASTER",program:"12667",year:"2014"},{model:"RAM 3500 PROMASTER",program:"13258",year:"2020"},{model:"RAM 3500 PROMASTER",program:"12668",year:"2017"},{model:"RAM 3500 PROMASTER",program:"12667",year:"2014"},{model:"RAM PROMASTER CITY",program:"12674",year:"2017"},{model:"RAM PROMASTER CITY",program:"12669",year:"2015"},{model:"RENAULT CAPTUR",program:"12984",year:"2020"},{model:"RENAULT CAPTUR",program:"12343",year:"2017"},{model:"RENAULT CAPTUR",program:"11372",year:"2013"},{model:"RENAULT CLIO V",program:"12853",year:"2020"},{model:"RENAULT CLIO IV",program:"12344",year:"2017"},{model:"RENAULT CLIO IV",program:"11372",year:"2012"},{model:"RENAULT CLIO III",program:"11174",year:"2005"},{model:"RENAULT DOKKER",program:"11574",year:"2012"},{model:"RENAULT DUSTER",program:"11283",year:"2011"},{model:"RENAULT ESPACE V (INITIALE) (Keyless)",program:"11625",year:"2015"},{model:"RENAULT ESPACE IV",program:"11224",year:"2003"},{model:"RENAULT FLUENCE",program:"11182",year:"2010"},{model:"RENAULT INITIALE (Keyless)",program:"11625",year:"2015"},{model:"RENAULT K (EURO 6)",program:"12672",year:"2018"},{model:"RENAULT KADJAR",program:"12742",year:"2019"},{model:"RENAULT KADJAR (Keyless)",program:"11625",year:"2015"},{model:"RENAULT KANGOO",program:"11174",year:"2008"},{model:"RENAULT KANGOO",program:"11224",year:"2004"},{model:"RENAULT KANGOO MAXI",program:"12249",year:"2017"},{model:"RENAULT KANGOO Z.E. (Electric)",program:"12679",year:"2019"},{model:"RENAULT KAPTUR",program:"12159",year:"2016"},{model:"RENAULT KERAX DCi (633)",program:"11223",year:"2005"},{model:"RENAULT KOLEOS",program:"12134",year:"2017"},{model:"RENAULT KOLEOS",program:"11443",year:"2008"},{model:"RENAULT LAGUNA III",program:"11182",year:"2008"},{model:"RENAULT LODGY",program:"11574",year:"2012"},{model:"RENAULT LOGAN",program:"11574",year:"2013"},{model:"RENAULT LOGAN MCV II",program:"11574",year:"2013"},{model:"RENAULT MAGNUM DCi (611)",program:"11223",year:"2004"},{model:"RENAULT MAGNUM DXi (617)",program:"11418",year:"2006"},{model:"RENAULT MASCOTT",program:"12281",year:"2004"},{model:"RENAULT MASTER (EURO 6)",program:"12923",year:"2020"},{model:"RENAULT MASTER (EURO 6)",program:"11855",year:"2014"},{model:"RENAULT MASTER (EURO 5)",program:"11436",year:"2010"},{model:"RENAULT MASTER DCi",program:"11224",year:"2005"},{model:"RENAULT MEGANE IV",program:"11625",year:"2016"},{model:"RENAULT MEGANE III",program:"11182",year:"2009"},{model:"RENAULT MEGANE II",program:"11174",year:"2006"},{model:"RENAULT MIDLUM DCi",program:"11223",year:"2002"},{model:"RENAULT MIDLUM DXi (644)",program:"11418",year:"2007"},{model:"RENAULT PREMIUM DCi (622)",program:"11223",year:"2003"},{model:"RENAULT PREMIUM DXi (627)",program:"11418",year:"2006"},{model:"RENAULT SANDERO",program:"11976",year:"2017"},{model:"RENAULT SANDERO",program:"11574",year:"2013"},{model:"RENAULT SANDERO STEPWAY",program:"11372",year:"2012"},{model:"RENAULT SCENIC IV",program:"12339",year:"2016"},{model:"RENAULT SCENIC III",program:"11182",year:"2009"},{model:"RENAULT SCENIC II",program:"11174",year:"2003"},{model:"RENAULT T (EURO 6)",program:"11464",year:"2013"},{model:"RENAULT TALISMAN (Keyless)",program:"11625",year:"2015"},{model:"RENAULT TRAFIC",program:"13217",year:"2020"},{model:"RENAULT TRAFIC",program:"12921",year:"2014"},{model:"RENAULT TRAFIC",program:"11224",year:"2001"},{model:"RENAULT TWINGO III",program:"11372",year:"2014"},{model:"RENAULT TWINGO II",program:"11174",year:"2008"},{model:"RENAULT TWIZY (Electric)",program:"12246",year:"2012"},{model:"RENAULT ZOE (Electric)",program:"13128",year:"2019"},{model:"RENAULT ZOE (Electric)",program:"12332",year:"2016"},{model:"SAAB 9-3 (YS3F)",program:"11126",year:"2003"},{model:"SAAB 9-5 (YS3E)",program:"11156",year:"1998"},{model:"SCANIA 4-serie (With EDC only)",program:"11221",year:"2000"},{model:"SCANIA G-serie (EURO6) LNG",program:"13126",year:"2018"},{model:"SCANIA G-serie (EURO 6)",program:"12893",year:"2017"},{model:"SCANIA G-serie (EURO 6) (FMS)",program:"12894",year:"2017"},{model:"SCANIA G-serie (G400) (EURO 5)",program:"12654",year:"2010"},{model:"SCANIA G-serie",program:"11221",year:"2007"},{model:"SCANIA IRIZAR (EURO 5)",program:"11221",year:"2010"},{model:"SCANIA L-serie",program:"11221",year:"1998"},{model:"SCANIA OMNIEXPRESS",program:"11221",year:"2007"},{model:"SCANIA OMNILINE",program:"11221",year:"2006"},{model:"SCANIA OMNILINK",program:"11221",year:"2006"},{model:"SCANIA P-serie (EURO 6) (FMS)",program:"12769",year:"2018"},{model:"SCANIA P-serie (EURO 6)",program:"22442",year:"2018"},{model:"SCANIA R-serie (EURO 5) CNG",program:"13118",year:"2018"},{model:"SCANIA R-serie (EURO 6) CNG",program:"13189",year:"2018"},{model:"SCANIA R-serie (EURO 6) (FMS)",program:"12767",year:"2016"},{model:"SCANIA R",program:"11221",year:"2005"},{model:"SCANIA R-series (EURO 6)",program:"21835",year:"2016"},{model:"SCANIA S-serie (EURO 6) (FMS)",program:"12768",year:"2016"},{model:"SCANIA S-series (EURO 6)",program:"22193",year:"2016"},{model:"SCANIA TOURING (EURO 5)",program:"11221",year:"2010"},{model:"SCION FR-S",program:"11392",year:"2012"},{model:"SEAT ALHABMRA (7N)",program:"11897",year:"2015"},{model:"SEAT ALTEA (5P)",program:"11111",year:"2005"},{model:"SEAT ALTEA XL (5P)",program:"11452",year:"2010"},{model:"SEAT ARONA (KJ)",program:"12195",year:"2018"},{model:"SEAT ATECA (5F)",program:"11884",year:"2016"},{model:"SEAT CORDOBA (6L)",program:"11161",year:"2003"},{model:"SEAT EXEO (3R)",program:"11132",year:"2009"},{model:"SEAT IBIZA (KJ)",program:"12196",year:"2018"},{model:"SEAT IBIZA (6J)",program:"11928",year:"2017"},{model:"SEAT IBIZA (6J)",program:"11449",year:"2013"},{model:"SEAT IBIZA (6J)",program:"11176",year:"2009"},{model:"SEAT IBIZA (6L)",program:"11161",year:"2003"},{model:"SEAT LEON (5F)",program:"11448",year:"2013"},{model:"SEAT LEON (1P)",program:"11111",year:"2006"},{model:"SEAT LEON (1M)",program:"11166",year:"2002"},{model:"SEAT LEON CUPRA (5F)",program:"11887",year:"2015"},{model:"SEAT MII (AA)",program:"11449",year:"2011"},{model:"SEAT TOLEDO (NH)",program:"12741",year:"2016"},{model:"SEAT TOLEDO (NH)",program:"11449",year:"2013"},{model:"SEAT TOLEDO (5P)",program:"11111",year:"2005"},{model:"SEAT TOLEDO (1M)",program:"11166",year:"2002"},{model:"SETRA S415 GT-HD (EURO 5)",program:"11467",year:"2010"},{model:"SETRA S415 HD (EURO 3)",program:"11349",year:"2003"},{model:"SETRA S416 GT-HD (EURO 5)",program:"11349",year:"2008"},{model:"SETRA S416 GT-HD (EURO 4)",program:"11467",year:"2006"},{model:"SETRA S417 GT-HD (EURO 5)",program:"11467",year:"2009"},{model:"SETRA S417 GT-HD (EURO 4)",program:"11467",year:"2006"},{model:"SETRA S417 GT-HD (EURO 3)",program:"11557",year:"2005"},{model:"SETRA S419 GT-HD (EURO 5)",program:"11467",year:"2009"},{model:"SETRA S431 DT (EURO 6)",program:"11348",year:"2013"},{model:"SETRA S431 DT (EURO 5)",program:"11466",year:"2010"},{model:"SETRA S431 DT (EURO 4)",program:"11349",year:"2008"},{model:"SETRA S515 HD (EURO 6)",program:"11348",year:"2012"},{model:"SETRA S516 HD (EURO 6)",program:"11348",year:"2012"},{model:"SETRA S517 HD (EURO 6)",program:"11348",year:"2012"},{model:"SKODA CITIGO (AA)",program:"12422",year:"2018"},{model:"SKODA CITIGO (AA)",program:"11449",year:"2013"},{model:"SKODA CITIGOe (AA) (Electric)",program:"12937",year:"2020"},{model:"SKODA FABIA III (NJ)",program:"11391",year:"2015"},{model:"SKODA FABIA II (5J)",program:"11449",year:"2013"},{model:"SKODA FABIA II (5J)",program:"11176",year:"2010"},{model:"SKODA FABIA II (5J)",program:"11161",year:"2007"},{model:"SKODA FABIA I (6Y)",program:"11161",year:"2000"},{model:"SKODA KAMIQ (NW)",program:"12986",year:"2019"},{model:"SKODA KAROQ (NU)",program:"12279",year:"2017"},{model:"SKODA KODIAQ (NS)",program:"11936",year:"2017"},{model:"SKODA OCTAVIA IV (NX)",program:"13149",year:"2020"},{model:"SKODA OCTAVIA III (NE)",program:"11943",year:"2017"},{model:"SKODA OCTAVIA III (NE)",program:"11391",year:"2013"},{model:"SKODA OCTAVIA III (NE) G-TEC",program:"11876",year:"2013"},{model:"SKODA OCTAVIA II (1Z)",program:"11173",year:"2009"},{model:"SKODA OCTAVIA II (1Z)",program:"11111",year:"2005"},{model:"SKODA OCTAVIA I (1U)",program:"11111",year:"2003"},{model:"SKODA OCTAVIA TOUR I (1U)",program:"11262",year:"2009"},{model:"SKODA RAPID (NH)",program:"11391",year:"2016"},{model:"SKODA RAPID (NH)",program:"11176",year:"2012"},{model:"SKODA ROOMSTER (5J)",program:"11176",year:"2010"},{model:"SKODA ROOMSTER (5J)",program:"11161",year:"2006"},{model:"SKODA SCALA (NW)",program:"12985",year:"2019"},{model:"SKODA SUPERB (NP) (Hybrid) (Plug-in)",program:"12976",year:"2019"},{model:"SKODA SUPERB (NP)",program:"11391",year:"2015"},{model:"SKODA SUPERB (3T)",program:"11173",year:"2009"},{model:"SKODA SUPERB (3U)",program:"11111",year:"2003"},{model:"SKODA YETI (5L)",program:"11492",year:"2014"},{model:"SKODA YETI (5L)",program:"11173",year:"2009"},{model:"SMART FORFOUR (453)",program:"11781",year:"2015"},{model:"SMART FORTWO (453)",program:"11781",year:"2015"},{model:"SMART FORTWO BRABUS (451)",program:"11654",year:"2007"},{model:"SMART FORTWO ELECTRIC DRIVE (EJ9)(Electric)",program:"11915",year:"2013"},{model:"SMART FORTWO MHD PASSION (451)",program:"11654",year:"2008"},{model:"SOLARIS URBINO 12 (EURO 5)",program:"11496",year:"2009"},{model:"SOLARIS URBINO 18 (EURO 6)",program:"12172",year:"2015"},{model:"SSANGYONG ACTYON",program:"11482",year:"2013"},{model:"SSANGYONG KYRON",program:"11482",year:"2007"},{model:"SSANGYONG REXTON",program:"11482",year:"2013"},{model:"SSANGYONG STAVIC",program:"11482",year:"2014"},{model:"SSANGYONG TIVOLI",program:"12191",year:"2015"},{model:"SUBARU BRZ (ZC)",program:"11931",year:"2015"},{model:"SUBARU CROSSTREK (GP)",program:"12845",year:"2017"},{model:"SUBARU FORESTER (SJ)",program:"12639",year:"2016"},{model:"SUBARU FORESTER",program:"11395",year:"2013"},{model:"SUBARU FORESTER (SH)",program:"11177",year:"2009"},{model:"SUBARU IMPREZA (GE / GH / GR / GV)",program:"11177",year:"2008"},{model:"SUBARU LEGACY (BL / BP)",program:"11177",year:"2004"},{model:"SUBARU LEVORG (VM) (Keyless)",program:"11713",year:"2015"},{model:"SUBARU OUTBACK (BS) (Keyless)",program:"11698",year:"2016"},{model:"SUBARU OUTBACK (BR)",program:"11423",year:"2013"},{model:"SUBARU OUTBACK (BR) (Keyless)",program:"11265",year:"2010"},{model:"SUBARU OUTBACK (BP)",program:"11177",year:"2004"},{model:"SUBARU TRIBECA B9 (WX)",program:"11197",year:"2006"},{model:"SUBARU XV (GT) (Keyless)",program:"12239",year:"2018"},{model:"SUBARU XV (GT)",program:"13249",year:"2018"},{model:"SUBARU XV (GP)",program:"11395",year:"2012"},{model:"SUBARU XV (GP) (Keyless)",program:"11395",year:"2012"},{model:"SUZUKI BALENO",program:"11744",year:"2016"},{model:"SUZUKI CELERIO",program:"11735",year:"2014"},{model:"SUZUKI ERTIGA (RHD)",program:"12533",year:"2012"},{model:"SUZUKI GRAND VITARA",program:"11115",year:"2005"},{model:"SUZUKI JIMNY",program:"12729",year:"2018"},{model:"SUZUKI JIMNY",program:"11627",year:"2015"},{model:"SUZUKI KIZASHI",program:"11415",year:"2010"},{model:"SUZUKI SPLASH",program:"11168",year:"2008"},{model:"SUZUKI SWIFT",program:"12838",year:"2017"},{model:"SUZUKI SWIFT",program:"11115",year:"2005"},{model:"SUZUKI SX4 (RussianMarket)",program:"11455",year:"2014"},{model:"SUZUKI SX4",program:"11115",year:"2006"},{model:"SUZUKI SX4 S-CROSS",program:"11455",year:"2014"},{model:"SUZUKI VITARA",program:"12837",year:"2018"},{model:"SUZUKI VITARA",program:"11738",year:"2015"},{model:"SUZUKI XL7",program:"11149",year:"2008"},{model:"TATRA PHOENIX (EURO 6)",program:"12584",year:"2018"},{model:"TEMSA OPALIN8 (EURO 4)",program:"11623",year:"2006"},{model:"TESLA S85 (Electric)",program:"11626",year:"2012"},{model:"TOYOTA 4RUNNER (N280)",program:"11138",year:"2010"},{model:"TOYOTA AGYA (RHD)",program:"12496",year:"2014"},{model:"TOYOTA ALPHARD",program:"12197",year:"2015"},{model:"TOYOTA ALPHARD",program:"11573",year:"2012"},{model:"TOYOTA AURIS (Hybrid)",program:"11822",year:"2015"},{model:"TOYOTA AURIS",program:"11338",year:"2013"},{model:"TOYOTA AURIS",program:"11138",year:"2007"},{model:"TOYOTA AVANZA (RHD)",program:"12491",year:"2016"},{model:"TOYOTA AVANZA (RHD)",program:"12498",year:"2014"},{model:"TOYOTA AVANZA VELOZ (RHD)",program:"12491",year:"2015"},{model:"TOYOTA AVENSIS",program:"11886",year:"2015"},{model:"TOYOTA AVENSIS",program:"11138",year:"2009"},{model:"TOYOTA AYGO",program:"13158",year:"2018"},{model:"TOYOTA AYGO",program:"11889",year:"2016"},{model:"TOYOTA C-HR",program:"13155",year:"2020"},{model:"TOYOTA C-HR (Hybrid)",program:"13161",year:"2020"},{model:"TOYOTA C-HR (Hybrid)",program:"11974",year:"2017"},{model:"TOYOTA C-HR",program:"11891",year:"2017"},{model:"TOYOTA CALYA (RHD)",program:"12516",year:"2017"},{model:"TOYOTA CAMRY (Hybrid)",program:"12973",year:"2019"},{model:"TOYOTA CAMRY",program:"12345",year:"2018"},{model:"TOYOTA CAMRY (RHD)",program:"12345",year:"2017"},{model:"TOYOTA CAMRY",program:"12224",year:"2015"},{model:"TOYOTA CAMRY (Keyless)",program:"12225",year:"2015"},{model:"TOYOTA CAMRY",program:"12223",year:"2012"},{model:"TOYOTA CAMRY",program:"12222",year:"2007"},{model:"TOYOTA COROLLA (Hybrid)",program:"12933",year:"2019"},{model:"TOYOTA COROLLA",program:"12386",year:"2017"},{model:"TOYOTA COROLLA",program:"11338",year:"2013"},{model:"TOYOTA COROLLA",program:"11138",year:"2007"},{model:"TOYOTA COROLLA ALTIS (RHD)",program:"12536",year:"2014"},{model:"TOYOTA FJ CRUISER",program:"11138",year:"2007"},{model:"TOYOTA FORTUNER",program:"12166",year:"2015"},{model:"TOYOTA FORTUNER (RHD)",program:"12181",year:"2015"},{model:"TOYOTA GT 86",program:"11392",year:"2012"},{model:"TOYOTA HARRIER (RHD)",program:"12527",year:"2013"},{model:"TOYOTA HIACE",program:"11138",year:"2006"},{model:"TOYOTA HIGHLANDER",program:"11486",year:"2014"},{model:"TOYOTA HIGHLANDER",program:"11138",year:"2008"},{model:"TOYOTA HILUX (VII) (ThailandMarket)(AT)",program:"12621",year:"2015"},{model:"TOYOTA HILUX (VIII) (Keyless)",program:"12138",year:"2015"},{model:"TOYOTA HILUX (VIII)",program:"12371",year:"2015"},{model:"TOYOTA HILUX (VII) (AT)",program:"12621",year:"2011"},{model:"TOYOTA HILUX (VII) (MT)",program:"11716",year:"2011"},{model:"TOYOTA INNOVA (RHD)",program:"12513",year:"2016"},{model:"TOYOTA INNOVA LUXURY (RHD)",program:"12513",year:"2016"},{model:"TOYOTA IQ",program:"11138",year:"2009"},{model:"TOYOTA LAND CRUISER 150 (PRADO)(Keyless)",program:"12165",year:"2018"},{model:"TOYOTA LAND CRUISER 150 (PRADO)",program:"12226",year:"2012"},{model:"TOYOTA LAND CRUISER 150 (PRADO)",program:"12227",year:"2010"},{model:"TOYOTA LAND CRUISER 200 (V8)",program:"11831",year:"2017"},{model:"TOYOTA LAND CRUISER 200 (4,5L V8 DIESEL)",program:"12228",year:"2012"},{model:"TOYOTA LAND CRUISER 200 (4,6L V8 PETROL)",program:"12481",year:"2012"},{model:"TOYOTA LAND CRUISER 200 (5,7L V8 PETROL)",program:"12482",year:"2012"},{model:"TOYOTA LAND CRUISER 200 (4,0L V6 PETROL)",program:"12483",year:"2012"},{model:"TOYOTA LAND CRUISER 200 (4,5L V8 DIESEL)",program:"12221",year:"2008"},{model:"TOYOTA LAND CRUISER 200 (4,7L V8 PETROL)",program:"12316",year:"2008"},{model:"TOYOTA LAND CRUISER 200 (5,7L V8 PETROL)",program:"12478",year:"2008"},{model:"TOYOTA LAND CRUISER 200 (4,0L V6 PETROL)",program:"12484",year:"2008"},{model:"TOYOTA LIMO (RHD)",program:"12534",year:"2013"},{model:"TOYOTA PRIUS (Hybrid) (Plug-in)",program:"12611",year:"2017"},{model:"TOYOTA PRIUS (Hybrid)",program:"11814",year:"2015"},{model:"TOYOTA PRIUS PLUS (Hybrid)",program:"12499",year:"2012"},{model:"TOYOTA PRIUS (Hybrid)",program:"11138",year:"2009"},{model:"TOYOTA PROACE",program:"11143",year:"2013"},{model:"TOYOTA PROACE",program:"11193",year:"2013"},{model:"TOYOTA PROACE CITY VERSO",program:"13157",year:"2019"},{model:"TOYOTA PROACE VERSO",program:"13156",year:"2016"},{model:"TOYOTA RAV4 (Hybrid)",program:"12599",year:"2019"},{model:"TOYOTA RAV4",program:"12598",year:"2019"},{model:"TOYOTA RAV4 (Hybrid)",program:"11715",year:"2016"},{model:"TOYOTA RAV4",program:"11338",year:"2013"},{model:"TOYOTA RAV4",program:"11642",year:"2006"},{model:"TOYOTA RUSH (RHD)",program:"12521",year:"2015"},{model:"TOYOTA SEQUOIA",program:"11138",year:"2008"},{model:"TOYOTA SIENNA",program:"12771",year:"2017"},{model:"TOYOTA SIENNA (Keyless)",program:"11226",year:"2011"},{model:"TOYOTA SIENNA",program:"11633",year:"2007"},{model:"TOYOTA SOLARA",program:"11138",year:"2007"},{model:"TOYOTA TUNDRA",program:"11847",year:"2014"},{model:"TOYOTA TUNDRA",program:"11138",year:"2008"},{model:"TOYOTA URBAN CRUISER",program:"11138",year:"2009"},{model:"TOYOTA VENZA",program:"11138",year:"2012"},{model:"TOYOTA VERSO",program:"11883",year:"2016"},{model:"TOYOTA VERSO",program:"11138",year:"2009"},{model:"TOYOTA VIOS (RHD)",program:"12519",year:"2013"},{model:"TOYOTA VOXY (RHD)",program:"12523",year:"2017"},{model:"TOYOTA YARIS (Hybrid)",program:"13165",year:"2020"},{model:"TOYOTA YARIS",program:"13159",year:"2017"},{model:"TOYOTA YARIS (Hybrid)",program:"11975",year:"2017"},{model:"TOYOTA YARIS (Hybrid)",program:"11824",year:"2015"},{model:"TOYOTA YARIS",program:"11896",year:"2015"},{model:"TOYOTA YARIS",program:"11338",year:"2011"},{model:"TOYOTA YARIS",program:"11138",year:"2006"},{model:"UAZ PATRIOT",program:"11845",year:"2016"},{model:"UD GW26490",program:"11248",year:"2012"},{model:"URAL 4320",program:"12711",year:"2016"},{model:"URAL NEXT",program:"12656",year:"2015"},{model:"VDL FUTURA FHD2 (EURO 6)",program:"11549",year:"2014"},{model:"VDL FUTURA FHD2 (EURO 5)",program:"11547",year:"2011"},{model:"VDL FUTURA FHD (EURO 4)",program:"11551",year:"2007"},{model:"VOLVO 670",program:"11248",year:"2004"},{model:"VOLVO 9700 (EURO 5)",program:"11494",year:"2009"},{model:"VOLVO B12B",program:"12248",year:"2003"},{model:"VOLVO C30",program:"11123",year:"2007"},{model:"VOLVO C70",program:"11123",year:"2007"},{model:"VOLVO FE (EURO 4)",program:"11418",year:"2006"},{model:"VOLVO FH (EURO 6)",program:"13234",year:"2020"},{model:"VOLVO FH (EURO 6) CNG",program:"13139",year:"2018"},{model:"VOLVO FH (EURO 6)",program:"11464",year:"2013"},{model:"VOLVO FH (EURO 5)",program:"11418",year:"2009"},{model:"VOLVO FH (EURO 4)",program:"11418",year:"2006"},{model:"VOLVO FH",program:"11218",year:"1998"},{model:"VOLVO FL (EURO 6)",program:"11418",year:"2013"},{model:"VOLVO FL (EURO 3)",program:"11218",year:"2001"},{model:"VOLVO FM (EURO 6)",program:"11464",year:"2013"},{model:"VOLVO FM (EURO 5)",program:"11418",year:"2009"},{model:"VOLVO FM (EURO 4)",program:"11418",year:"2006"},{model:"VOLVO FM",program:"11218",year:"1998"},{model:"VOLVO S40",program:"11123",year:"2005"},{model:"VOLVO S40",program:"11123",year:"2004"},{model:"VOLVO S60",program:"13228",year:"2019"},{model:"VOLVO S60",program:"11294",year:"2011"},{model:"VOLVO S60",program:"11124",year:"2005"},{model:"VOLVO S60",program:"11134",year:"2003"},{model:"VOLVO S80",program:"11295",year:"2012"},{model:"VOLVO S80",program:"11144",year:"2007"},{model:"VOLVO S80",program:"11124",year:"2005"},{model:"VOLVO S80",program:"11134",year:"2003"},{model:"VOLVO S90",program:"12414",year:"2017"},{model:"VOLVO UNVI URBIS 2.5DD B9 TL",program:"11617",year:"2013"},{model:"VOLVO V40 CROSS COUNTRY",program:"11565",year:"2015"},{model:"VOLVO V40 CROSS COUNTRY",program:"11414",year:"2013"},{model:"VOLVO V50",program:"11123",year:"2005"},{model:"VOLVO V50",program:"11123",year:"2004"},{model:"VOLVO V60",program:"11294",year:"2011"},{model:"VOLVO V70",program:"11144",year:"2008"},{model:"VOLVO V70",program:"11124",year:"2005"},{model:"VOLVO V70",program:"11134",year:"2003"},{model:"VOLVO V90",program:"11956",year:"2017"},{model:"VOLVO VNL64T",program:"11248",year:"2004"},{model:"VOLVO VNL64T",program:"11248",year:"1999"},{model:"VOLVO VNL670",program:"11248",year:"2004"},{model:"VOLVO XC60",program:"13229",year:"2018"},{model:"VOLVO XC60",program:"11294",year:"2014"},{model:"VOLVO XC60",program:"11294",year:"2012"},{model:"VOLVO XC60",program:"11144",year:"2010"},{model:"VOLVO XC60",program:"11144",year:"2008"},{model:"VOLVO XC70",program:"11295",year:"2014"},{model:"VOLVO XC70",program:"11295",year:"2013"},{model:"VOLVO XC70",program:"11144",year:"2008"},{model:"VOLVO XC70",program:"11124",year:"2005"},{model:"VOLVO XC90 (Keyless)",program:"12474",year:"2018"},{model:"VOLVO XC90 (Keyless)",program:"11634",year:"2016"},{model:"VOLVO XC90",program:"11124",year:"2012"},{model:"VOLVO XC90",program:"11124",year:"2005"},{model:"VOLVO XC90",program:"11134",year:"2003"},{model:"VW AMAROK (2H)",program:"12218",year:"2017"},{model:"VW AMAROK (2H)",program:"11176",year:"2010"},{model:"VW ARTEON (3H)",program:"12251",year:"2017"},{model:"VW ATLAS (CA)",program:"13247",year:"2018"},{model:"VW BEETLE (16)",program:"11792",year:"2016"},{model:"VW BEETLE (1C / 9C)",program:"11166",year:"2002"},{model:"VW BEETLE (1C / 9C)",program:"11165",year:"1998"},{model:"VW CADDY (2K)",program:"12978",year:"2015"},{model:"VW CADDY (2K)",program:"11173",year:"2010"},{model:"VW CADDY (2K)",program:"11111",year:"2004"},{model:"VW CARAVELLE (7H)",program:"11161",year:"2003"},{model:"VW CARAVELLE GP (7H)",program:"11176",year:"2010"},{model:"VW CARAVELLE T6 (7H)",program:"11697",year:"2015"},{model:"VW CARAVELLE T6.1 (7H)",program:"12977",year:"2020"},{model:"VW CRAFTER (SY)",program:"12219",year:"2017"},{model:"VW CRAFTER (SZ)",program:"11913",year:"2016"},{model:"VW CRAFTER",program:"11164",year:"2006"},{model:"VW eGOLF 7 (AU) (Electric)",program:"12216",year:"2017"},{model:"VW EOS (1F)",program:"11111",year:"2006"},{model:"VW eUP (AA) (Electric)",program:"12975",year:"2019"},{model:"VW eUP (AA) (Electric)",program:"12264",year:"2014"},{model:"VW GOLF 7 (AU)",program:"11927",year:"2017"},{model:"VW GOLF 7 GTE (AU) (Hybrid) (Plug-in)",program:"12215",year:"2015"},{model:"VW GOLF 7 (AU)",program:"11448",year:"2013"},{model:"VW GOLF 6 (1K)",program:"11173",year:"2008"},{model:"VW GOLF 5 (1K)",program:"11111",year:"2004"},{model:"VW GOLF 5 (1K)",program:"11262",year:"2004"},{model:"VW GOLF 4 (1J)",program:"11111",year:"2002"},{model:"VW GOLF 4 (1J)",program:"11165",year:"1998"},{model:"VW GOLF SPORTSVAN 7 (AU)",program:"12424",year:"2016"},{model:"VW JETTA (16)",program:"11587",year:"2015"},{model:"VW JETTA (AJ) (MexicoMarket)",program:"11661",year:"2015"},{model:"VW JETTA (1K)",program:"11173",year:"2010"},{model:"VW JETTA (1K)",program:"11111",year:"2005"},{model:"VW MULTIVAN (7H)",program:"11161",year:"2003"},{model:"VW MULTIVAN GP (7H)",program:"11176",year:"2010"},{model:"VW PASSAT B8 (3C)",program:"13113",year:"2019"},{model:"VW PASSAT B8 GTE (3C) (Hybrid) (Plug-in)",program:"12212",year:"2017"},{model:"VW PASSAT B8 (3C)",program:"11926",year:"2017"},{model:"VW PASSAT B8 (3C)",program:"11673",year:"2015"},{model:"VW PASSAT B7 (3C)",program:"11173",year:"2011"},{model:"VW PASSAT B7 (3C) ECOFUEL",program:"11892",year:"2011"},{model:"VW PASSAT B6 (3C)",program:"11111",year:"2005"},{model:"VW PASSAT B5 (3B)",program:"11111",year:"2001"},{model:"VW PASSAT B5 (3B)",program:"11165",year:"1998"},{model:"VW PASSAT CC (3C)",program:"11173",year:"2012"},{model:"VW PASSAT CC (3C)",program:"11111",year:"2009"},{model:"VW PHAETON (3D)",program:"11122",year:"2003"},{model:"VW POLO (AW)",program:"12265",year:"2018"},{model:"VW POLO (6R)",program:"11794",year:"2014"},{model:"VW POLO (61) (Sedan)",program:"11262",year:"2011"},{model:"VW POLO (6R)",program:"11176",year:"2009"},{model:"VW POLO (9N)",program:"11161",year:"2005"},{model:"VW SCIROCCO (13)",program:"11173",year:"2010"},{model:"VW SCIROCCO (13)",program:"11111",year:"2008"},{model:"VW SHARAN (7N)",program:"11173",year:"2010"},{model:"VW T-CROSS (C1)",program:"13111",year:"2019"},{model:"VW T-ROC (A1)",program:"12252",year:"2017"},{model:"VW T5 (7H)",program:"11161",year:"2003"},{model:"VW T5 GP (7H)",program:"11176",year:"2010"},{model:"VW TERAMONT (CA)",program:"12284",year:"2017"},{model:"VW TIGUAN ALLSPACE (5N)",program:"12263",year:"2017"},{model:"VW TIGUAN (5N)",program:"11673",year:"2016"},{model:"VW TIGUAN (5N)",program:"11524",year:"2013"},{model:"VW TIGUAN (5N)",program:"11173",year:"2010"},{model:"VW TIGUAN (5N)",program:"11111",year:"2007"},{model:"VW TOUAREG (CR)",program:"12419",year:"2018"},{model:"VW TOUAREG (7P)",program:"11273",year:"2011"},{model:"VW TOUAREG (7L)",program:"11122",year:"2003"},{model:"VW TOURAN (1T)",program:"11673",year:"2016"},{model:"VW TOURAN (1T)",program:"11173",year:"2010"},{model:"VW TOURAN (1T) ECOFUEL",program:"11877",year:"2010"},{model:"VW TOURAN (1T)",program:"11111",year:"2003"},{model:"VW TRANSPORTER (7H)",program:"11161",year:"2003"},{model:"VW TRANSPORTER GP (7H)",program:"11176",year:"2010"},{model:"VW TRANSPORTER T6 (7H)",program:"11697",year:"2015"},{model:"VW UP (AA)",program:"11929",year:"2017"},{model:"VW UP (AA)",program:"11449",year:"2016"},{model:"YAMAHA MT-07",program:"12834",year:"2014"},{model:"YAMAHA YZF-R1M",program:"13272",year:"2020"},{model:"YUTONG ZK6122H9",program:"12469",year:"2016"},{model:"ZAZ A10C",program:"12443",year:"2018"},{model:"ZAZ A10C",program:"12444",year:"2013"}]
    }

})();