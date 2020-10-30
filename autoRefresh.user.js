// ==UserScript==
// @name         GPS Refresher
// @namespace    https://github.com/MarcinCzajka
// @version      0.0.15
// @description  Auto refresh when new data is available
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/autoRefresh.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/autoRefresh.user.js
// @match        http://*.pl/record/*
// @grant        none
// @include      *.pl/record/*
// ==/UserScript==



(function() {
    const refreshInterval = 5000;

    let isRefreshing = null;
    let comparisonMethod = 'seq';

    window.onload = function () {
        document.querySelectorAll('button.btn.mr-sm-2.btn-sm').forEach(element => {
            element.addEventListener('click', clearNewFrames);
        })

        createRefreshButton();
        createAnimationNode();
    }

    async function getFrames() {
        let lastCompare;
        const emptyMessage = document.querySelector('.vuetable-empty-result');

        if(comparisonMethod === 'seq') {
            lastCompare = getValueByColName('seq', 0);

            if(lastCompare === '' && !emptyMessage) {
                comparisonMethod = 'date';
                lastCompare = new Date(getValueByColName('received_at', 0)).getTime();
            }
        } else {
            lastCompare = new Date(getValueByColName('received_at', 0)).getTime();
        }

        let dateTo = new Date();
        let dateFrom = new Date(new Date().setHours(0,0,0,0));

        dateFrom = dateFrom.toISOString();
        dateTo = dateTo.toISOString();

        const url = `${window.location.href.replace('record', 'api/v1/tracker')}/record?sort=received_at%7Cdesc&current_page=1&per_page=25&from__received_at=${dateFrom}&to__received_at=${dateTo}&imei=${document.querySelector('input[placeholder="IMEI urządzenia"]').value}`;
        const blob = await getData(url);

        const data = blob.data;
        if(!data) return false;

        //Dont proceed if table is refreshing using native refresh/reset button
        if(document.querySelector('table').style.display === 'none') return false;

        const tableHead = document.querySelector('thead').children[0].children;

        for(let i = data.length - 1; i >= 0; i--) {
            let newCompare;
            if(comparisonMethod === 'seq' && data[i]['seq']) {
                newCompare = data[i]['seq']
            } else {
                if(!lastCompare) lastCompare = new Date(document.querySelector('.flatpickr-input').value).getTime();
                newCompare = +(data[i]['received_at']['$date'].toString().slice(0, -3) + '000');
            }

            if(lastCompare < newCompare) {
                const newRow = document.createElement('tr');
                newRow.classList.add('showGently', 'customFrame');

                for(const col of tableHead) {
                    const title = col.children[0].title;

                    const cell = document.createElement('td');
                    const value = formatValue(title, data[i][title]);

                    cell.innerText = value;
                    cell.classList.add('text-nowrap');

                    newRow.appendChild(cell);
                }

                replaceLocationWithLink(newRow);
                appendToTable(newRow);

                if(emptyMessage) emptyMessage.remove();

                lastCompare = newCompare;
            }
        }

        if(window.checkData) window.checkData();

        return true
    };

    function appendToTable(el) {
        const tableBody = document.querySelector('tbody');
        tableBody.insertBefore(el, tableBody.firstChild);
    }

    function getData(url) {
        const bearerToken = document.cookie.split('accessToken=')[1];

        return new Promise((resolve, reject) => {
            fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: new Headers({
                    'Authorization': 'Bearer ' + bearerToken
                })
            })
                .then(res => res.json())
                .then(data => {
                     resolve(data)
            })
        })
    }

    function formatValue(title, val) {
        let result = val;

        if(typeof result === 'undefined') return ""

        switch(title) {
            case 'received_at':
            case 'created_at':
                result = new Date(result.$date)
                result.setTime(result.getTime() + 3600000)
                return result.toISOString().
                    replace(/T/, ' ').
                    replace(/\..+/, '')
            case 'latitude':
            case 'longitude':
                return parseFloat(result).toFixed(12)
            case 'altitude':
            case 'course':
                return parseFloat(result).toFixed(0)
            case 'ignition':
                return result ? 'Wł.' : 'Wył.'
            case 'power':
            case 'battery':
                return parseFloat(result).toFixed(2)
            case 'analog_input1':
            case 'analog_input2':
                return parseFloat(result).toFixed(2)
            case 'speed':
                return parseFloat(result).toFixed(0) + ' km/h'
            case 'mileage':
                return (+result / 1000).toFixed(2) + ' km'
            case 'analog_engine_speed':
                return result ? result + ' rpm': '0 rpm'
            case 'engine_temp':
                return result + ' °C'
            default:
                return result
        }
    }

    function getValueByColName(name, rowIndex = 0) {
        const tableIndex = getIndexOfTitle(name);

        if(document.getElementsByClassName('vuetable-empty-result').length) return false

        return document.querySelector('tbody').children[rowIndex].children[tableIndex].innerText
    }

    function replaceLocationWithLink(tableRow) {
        const latitudeIndex = getIndexOfTitle('latitude');
        const longitudeIndex = getIndexOfTitle('longitude');
        const latitude = tableRow.children[latitudeIndex].innerText;
        const longitude = tableRow.children[longitudeIndex].innerText;

        tableRow.children[latitudeIndex].innerHTML = `<a href="http://www.google.com/maps/place/${latitude},${longitude}" target="_blank">${parseFloat(latitude).toFixed(4)}</a>`;
        tableRow.children[longitudeIndex].innerHTML = `<a href="http://www.google.com/maps/place/${latitude},${longitude}" target="_blank">${parseFloat(longitude).toFixed(4)}</a>`;
    }

    function getIndexOfTitle(title) {
        const tableHead = document.querySelector('thead').children[0];

        for(let index = 0; index < tableHead.children.length; index++) {
            if(tableHead.children[index].children[0].title === title) return index
        }
    }

    function createAnimationNode() {
        const animation = document.createElement('style');
        animation.type = "text/css";
        animation.innerText = "@keyframes showGently {from {opacity: .4; background-color: #fdfd70} to {opacity: 1}} .showGently {animation: showGently; animation-duration: 1.2s} .noShadow {box-shadow: none !important} .hidden {display: none !important}";

        document.querySelector('head').append(animation);
    }

    function clearNewFrames() {
        const frames = document.getElementsByClassName('customFrame');

        while(frames[0]) {
            frames[0].parentNode.removeChild(frames[0]);
        }

        //Disable refreshing
        refreshClickEventHandler(null, true);
    }

    function createRefreshButton() {
        const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');

        const newBtn = document.createElement('button');
        newBtn.id = 'refreshButton';
        newBtn.type = 'button';
        newBtn.classList.add('btn', 'btn-sm', 'btn-info', 'noShadow');
        newBtn.innerText = 'Odświeżaj';
        newBtn.onclick = refreshClickEventHandler;

        const singleRefreshBtn = document.createElement('button');
        singleRefreshBtn.id = 'singleRefreshButton';
        singleRefreshBtn.type = 'button';
        singleRefreshBtn.classList.add('btn', 'btn-sm', 'btn-warning', 'noShadow');
        singleRefreshBtn.innerText = 'x1';
        singleRefreshBtn.onclick = singleScan;


        btnGroup.append(newBtn);
        btnGroup.append(singleRefreshBtn);

        if(document.getElementsByClassName('form-group mr-sm-2 mb-sm-2')[1]) {
            document.getElementsByClassName('form-group mr-sm-2 mb-sm-2')[1].append(btnGroup);
        } else {
            setTimeout(() => {document.getElementsByClassName('form-group mr-sm-2 mb-sm-2')[1].append(btnGroup)}, 1000)
        }
    }

    function refreshClickEventHandler(e, turnOff = false) {
        if(!isRefreshing && !turnOff) {
            isRefreshing = setInterval(getFrames, refreshInterval)

            setButtonStyle(true);

            getFrames();
        } else if(isRefreshing) {
            clearInterval(isRefreshing);
            isRefreshing = null;

            setButtonStyle(false);
        }
    }

    function setButtonStyle (positive) {
        const button = document.getElementById('refreshButton');
        const singleRefreshButton = document.getElementById('singleRefreshButton');

        if(positive) {
            button.classList.add('btn-warning');
            button.classList.remove('btn-info');
            button.innerText = 'Odświeżam...';

            singleRefreshButton.classList.add('hidden');
        } else {
            button.classList.add('btn-info');
            button.classList.remove('btn-warning');
            button.innerText = 'Odświeżaj';

            singleRefreshButton.classList.remove('hidden');
        }
    }

    async function singleScan() {
        const button = document.getElementById('singleRefreshButton');
        button.classList.add('btn-success');
        button.classList.remove('btn-warning');
        button.innerText = '. . .';

        await getFrames();

        button.classList.add('btn-warning');
        button.classList.remove('btn-success');
        button.innerText = 'x1';
    }

})();