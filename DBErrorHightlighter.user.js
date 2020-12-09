// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.10.8
// @description  Mark data in table that seems suspicious
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/DBErrorHightlighter.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/DBErrorHightlighter.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==


const headers = [];
const coloredElements = [];

let blackboxProducer = '';

(function() {
    'use strict';

    setTimeout(() => {
        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if(mutationRecord.target.style.display !== 'none') window.checkData();
            });
        });

        observer.observe(document.getElementsByTagName('table')[0], { attributes : true, attributeFilter : ['style'] });
    }, 1000);

    window.checkData = function () {
        if(document.getElementsByClassName('vuetable-empty-result').length) return;

        if(!blackboxProducer) blackboxProducer = guessBlackbox();
		clearElements();

        loopThroughColumn("Szerokość", lokalizacja);
        loopThroughColumn("Satelity", satelity);
        loopThroughColumn("Stacyjka", ignitionMatchVoltage);
        loopThroughColumn("Stacyjka", ignitionMatchDigital);
        loopThroughColumn("Nap. aku.", napAku);
        loopThroughColumn("Status kierowcy", incorrectTachoStatus);
        loopThroughColumn("Status kierowcy 2", incorrectTachoStatus);
        if(blackboxProducer === 'setivo') markEmptyCanValues();
    }

})();

// <--   Tests... --!>

function lokalizacja(el) {
    if(+el.innerText === 0) {
        markError(el, 'Brak pozycji GPS');
        markError(el.nextElementSibling, 'Brak pozycji GPS');
        return
    }

    const szerokosc = el.innerText;
    const dlugosc = el.nextElementSibling.innerText;

    if(szerokosc > 51.0935 && szerokosc < 51.0988) {
        if(dlugosc > 17.0044 && dlugosc < 17.0136) {
            markError(el, 'Pozycja wskazuje Jemiołową.');
            markError(el.nextElementSibling, 'Pozycja wskazuje Jemiołową.');
        }
    }
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
    if(el.innerText === 'Wył.' && (next(el) ? next(el).innerText === 'Wył' : false)) {
        const voltage = +el.nextElementSibling.innerText;
        const errorMsg = 'Stacyjka wyłączona pomimo, że jest włączony silnik.';

        if(voltage > 27) {
            markAlert(el, errorMsg);
            markAlert(el.nextElementSibling, errorMsg);
        } else if(voltage > 14 && voltage < 20) {
            markAlert(el, errorMsg);
            markAlert(el.nextElementSibling, errorMsg);
        }
    }
}

function ignitionMatchDigital(el) {
    const firstBinChar = decToBin(offset(el, 6).innerText).slice(-1);
    const errorMsg = 'Stacyjka wyłączona ale wejście cyfrowe pokazuje włączoną.';

    if(blackboxProducer === 'setivo') {
        if(el.innerText === 'Wył.' && firstBinChar !== '0') {
            if(blackboxProducer === 'setivo') {
                markError(el, errorMsg);
            } else if(decToBin(offset(next(el), 6)).slice(-1) !== 0) {
                markError(el, errorMsg);
            }
        } else if(el.innerText === 'Wł.' && firstBinChar !== '1') {
            if(blackboxProducer === 'setivo') {
                markError(el, errorMsg);
            } else if(decToBin(offset(next(el), 6)).slice(-1) !== 1) {
                markError(el, errorMsg);
            }
        }
    }
}

function napAku(el) {
    if(+el.innerText < 9) markAlert(el, 'Zbyt niskie napięcie akumulatora.');
}

function incorrectTachoStatus(el) {
    if(+el.innerText > 3) markError(el, 'Błędny status tachografu.');
}

function markEmptyCanValues() {
    const canHeaders = ['Poziom paliwa', 'Zuż. paliwa', 'Dystans (CAN)', 'Prędkość (CAN)', 'Obroty silnika (CAN)'];
    for(let header of canHeaders) {
        if(isHexDataAvailable(header)) {
            loopThroughColumn(header, (el) => {
                if(el.children[0].title.split('').every(char => char === 'F')) {
                    if(getCellInRowByColumn(el, 'Stacyjka').innerText === 'Wł.') markMissingCanData(el, `${el.children[0].title} - Ramka przepisana`);
                }
            });
        }
    }
}

// <--  Helper functions... --!>

function loopThroughColumn(columnName, callback) {
    const index = headers.indexOf(columnName);

    for(let row of document.getElementsByTagName('tbody')[0].children) {
        callback(row.children[index]);
    };
}

function markError(el, msg) {
    el.style.backgroundColor = 'rgba(255, 105, 100, 0.3)';
    if(msg) el.title = msg;
	coloredElements.push(el);
}

function markAlert(el, msg) {
    el.style.backgroundColor = 'rgba(242, 195, 41, 0.5)';
    if(msg) el.title = msg;
	coloredElements.push(el);
}

function markMissingCanData(el, msg) {
    el.style.backgroundColor = 'rgba(255, 0, 0, 0.16)';
    if(msg) el.title = msg;
	coloredElements.push(el);
}

function clearElements() {
	coloredElements.forEach(function(el) {
        el.style = '';
        el.title = '';
	});

    coloredElements.length = 0;
}

function guessBlackbox() {
    try {
        const id = document.querySelectorAll('[placeholder="IMEI urządzenia"]')[0].value;
        const left = id.slice(0,3);

        if(left === 'H1_' || left === 'H3_' || +id < 99999) {
            return 'setivo'
        } else if(+id > 9999999) {
            return 'teltonika'
        } else {
            return 'albatros'
        }
    } catch(err) {
        console.log(err);
    }
}

function isHexDataAvailable(columnName) {
    try {
        if(document.getElementsByTagName('tbody')[0].children[0].children[ headers.indexOf(columnName) ].children[0].title !== '') {
            return true
        } else {
            return false
        }
    } catch(err) {
        return false
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

function getCellInRowByColumn(el, columnName) {
    return document.getElementsByTagName('tbody')[0].children[getRowIndex(el)].children[headers.indexOf(columnName)];
}

function offset(el, offset) {
    let result = el;

    for(let i = 1; i <= offset; i++) {
        result = result.nextElementSibling;
    }

    return result;
}

function getRowIndex(el) {
    return +el.parentElement.getAttribute('item-index');
}

function getColumnIndex(el) {
    let i = 0;
    let node = el;

    while( (node = node.previousElementSibling) != null ) i++;
    return i;
}

function next(el) {
    if(el.parentElement.nextElementSibling) {
        return el.parentElement.nextElementSibling.children[getColumnIndex(el)];
    } else {
        return false
    }
}

