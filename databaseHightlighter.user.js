// ==UserScript==
// @name         GPS Data Hightlighter
// @namespace    https://github.com/MarcinCzajka
// @version      0.10
// @description  Mark data in table that seems suspicious
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/databaseHightlighter.user.js
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
        blackboxProducer = guessBlackbox();

        for(let item of document.getElementsByTagName('th')) {
            headers.push(item.children[0].innerText)
        }

        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                if(mutationRecord.target.style.display !== 'none') checkData();
            });
        });

        observer.observe(document.getElementsByTagName('table')[0], { attributes : true, attributeFilter : ['style'] });
    }, 1000);

    function checkData() {
        console.log('Checking table - MAC');

		clearElements();

        loopThroughColumn("Szerokość", lokalizacja);
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

function lokalizacja(el) {
    if(+el.innerText === 0) {
        markError(el, 'Brak pozycji GPS');
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
    if(el.innerText === 'Wył.' && next(el).innerText === 'Wył') {
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

// <--  Helper functions... --!>

function loopThroughColumn(columnName, callback) {
    const index = headers.indexOf(columnName);

    for(let row of document.getElementsByTagName('tbody')[0].children) {
        callback(row.children[index]);
    };
}

function markError(el, msg) {
    el.style.backgroundColor = 'rgba(255, 105, 100, 0.3)';
    el.title = msg;
	coloredElements.push(el);
}

function markAlert(el, msg) {
    el.style.backgroundColor = 'rgba(242, 195, 41, 0.5)';
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

function next(el) {
    let i = 0;
    let node = el;

    while( (node = node.previousElementSibling) != null ) i++;

    return el.parentElement.nextElementSibling.children[i];
}