// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.6.1
// @description  Mark data in table that seems suspicious
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include *.pl/record/*
// ==/UserScript==


const headers = [];
const coloredElements = [];
const timeToWait = 250;

let blackboxProducer = '';

(function() {
    'use strict';

    setTimeout(() => {
        blackboxProducer = guessBlackbox();

        for(let button of document.getElementsByClassName('btn')) {
            if(button.innerText === "Filtruj" || button.innerText === "Resetuj") {
                button.addEventListener('click', () => {setTimeout(() => {checkData()}, timeToWait)});
            }
		}

		document.getElementById('per-page').addEventListener('change', () => {setTimeout(() => {checkData()}, timeToWait)});

        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        checkData();

    }, 5000);

    function checkData() {
		clearElements();

		loopThroughColumn("Szerokość", pozycja);
		loopThroughColumn("Długość", pozycja);
        loopThroughColumn("Satelity", satelity);
        loopThroughColumn("Stacyjka", ignitionMatchVoltage);
        loopThroughColumn("Stacyjka", ignitionMatchDigital);
        loopThroughColumn("Nap. aku.", napAku);
        loopThroughColumn("Status kierowcy", incorrectTachoStatus);
        loopThroughColumn("Status kierowcy 2", incorrectTachoStatus);
    }

})();

// <--   Tests... --!>

function pozycja(el) {
    if(+el.innerText === 0) markAlert(el, 'Brak pozycji GPS');
}

function satelity(el) {
    if(+el.innerText === 0) {
        markError(el, 'Brak połączonych satelit');
    } else if(+el.innerText < 4) {
        markAlert(el, `Tylko ${el.innerText} połączone satelity.`);
    }
}

function antenaStatus(el) {
    const status = +el.innerText;

    if(blackboxProducer === 'setivo') {
        if(status !== 1) markError(el, 'Błędny status anteny.');
    } else if(blackboxProducer === 'teltonika') {
        if(status === 3) {
            return;
        } else if(status === 2) {
            markAlert(el, 'Prawdopodobnie błędny status anteny.');
        } else {
            markError(el, 'Błędny status anteny.');
        }
    }
}

function ignitionMatchVoltage(el) {
    if(el.innerText === 'Wył.') {
        const voltage = +el.nextElementSibling.innerText;
        const errorMsg = 'Stacyjka wyłączona pomimo, że jest włączony silnik.';
        if(voltage > 26) {
            markAlert(el, errorMsg);
            markAlert(el.nextElementSibling, errorMsg);
        } else if(voltage > 14 && voltage < 20) {
            markAlert(el, errorMsg);
            markAlert(el.nextElementSibling, errorMsg);
        }
    }
}

function ignitionMatchDigital(el) {
    if(blackboxProducer === 'setivo') {
        const firstBinChar = decToBin(offset(el, 6).innerText).slice(-1);

        if(el.innerText === 'Wył.' && firstBinChar !== '0') {
            markError(el, 'Stacyjka wyłączona ale wejście cyfrowe pokazuje włączoną.');
        } else if(el.innerText === 'Wł.' && firstBinChar !== '1') {
            markError(el, 'Stacyjka włączona ale wejście cyfrowe pokazuje wyłączoną.');
        }
    }
}

function napAku(el) {
    if(+el.innerText < 9) markAlert(el, 'Zbyt niskie napięcie akumulatora.');
}

function incorrectTachoStatus(el) {
    if(+el.innerText > 3) markError(el, 'Błędny status tachografu.');
}

// <--  Helper functions... --!>

function loopThroughColumn(columnName, callback) {
    const index = headers.indexOf(columnName);

    for(let row of document.getElementsByTagName('tbody')[0].children) {
        callback(row.children[index]);
    };
}

function markError(el, msg) {
    el.style.backgroundColor = '#ff697d';
    el.title = msg;
	coloredElements.push(el);
}

function markAlert(el, msg) {
    el.style.backgroundColor = '#f2c329';
    el.title = msg;
	coloredElements.push(el);
}

function clearElements() {
	coloredElements.forEach(function(el, index, object) {
        el.style = '';
        el.title = '';
		object.splice(index, 1);
	});
}

function guessBlackbox() {
    const id = document.getElementById('__BVID__37').value;
    const left = id.slice(0,2);

    if(left === 'H1_' || left === 'H3_' || +id < 99999) {
        return 'setivo'
    } else if(+id > 9999999) {
        return 'teltonika'
    } else {
        return 'albatros'
    }
}

function decToBin(num) {
    let result = '';

    try {
        result = parseInt(num, 10).toString(2);
    } catch(err) {
        alert(err);
    }

    return result;
}

function offset(el, offset) {
    let result = el;

    for(let i = 1; i <= offset; i++) {
        result = result.nextElementSibling;
    }

    return result;
}