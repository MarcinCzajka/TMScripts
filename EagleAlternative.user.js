// ==UserScript==
// @name         Eagle Alternative
// @namespace    https://github.com/MarcinCzajka
// @version      1.14.20
// @description  Overlay for Kalkun integration
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @author       MAC
// @match        http://*sms.fr*
// @include      http://*sms.fr*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const query = window.location.hash || window.location.search;

    addStylesheet();
    createNavigationInput();

    if(query.includes('chat=true')) {
        showAltEagle();
    }

    function showAltEagle(number = `+${query.slice(query.indexOf('number') + 7).replace('+', '')}`) {
        let fetchType = 'sentitems'; //inbox

        if(document.getElementById('smsContainer')) {
            document.getElementById('nrInput').value = number;
            fetchSms();

            return
        }

        let interval = null;
        let flasher = null;

        const csrf = $('csrf_test_name').first().val();

        $('.workplace').remove();

        const container = document.createElement('div');
            container.id = 'container';

        const smsContainer = document.createElement('div');
            smsContainer.classList.add('block');
            smsContainer.id = 'smsContainer';

        $('body').append(container);

        createCacheElement();

        createNrInput(number);

        createFetchTypeBtnGroup();

        $('#container').append(smsContainer);

        createInputPanel();
        createContainerShadow();

        fetchSms();

        window.onhashchange = function(e) {
            const hash = window.location.hash;
            const newNumber = hash.slice(hash.indexOf('number') + 7).replace('+', '');
            const currentNumber = $('#nrInput');

            if(newNumber !== currentNumber.val()) {
                currentNumber.val(newNumber);
            }

            $('#smsContainer').empty();
            fetchSms();
        };

        function sendSms(number, message, callback) {
            if(!number) {
                console.log(`Nieprawidłowy numer: ${number}`);
                return
            } else if(!message) {
                console.log(`Nieprawidłowa wiadomość: ${message}`);
                return
            }

            const nr = number.toString().replace('+', '');
            let modem = null;
            if(String(nr).slice(0,2) === '46') {
                modem = 1;
            } else if(String(nr).slice(0,2) === '48') {
                modem = 2;
            }

            if(!modem) return

            const data = {
                'csrf_test_name': csrf,
                'sendoption': 'sendoption3',
                'manualvalue': '+' + nr,
                'senddateoption': 'option1',
                'hour': '00',
                'minute': '00',
                'delayhour': '00',
                'delayminute': '00',
                'modem_selection': modem,
                'validity': '-1',
                'sms_loop': '1',
                'smstype': 'normal',
                'message': message
            }

            $.post(`${window.location.origin}/messages/compose_process`, data, (res) => {
                document.getElementById('resultWindow').innerHTML = res;

                if(callback) callback();
            });
        }

        function fetchSms() {
            const nr = `+${$('#nrInput').val().replace('+', '')}`;
            $('#smsCache').load(`${window.location.origin}//messages/conversation/folder/${fetchType}/${nr}/`, function() {

                const smsCount = $('#smsCache .optionmenu').length;

                if(!smsCount) return;

                $('#smsCache #contact_container').remove();

                const smsFolder = document.getElementById('smsFolder');
                smsFolder.textContent = '';

                for(let i = smsCount; i > 0; i--) {
                    const div = document.createElement('div');
                        div.classList.add('sms');

                    const displace = (i - 1) * 12;

                    const timestamp = $('#smsCache').children().eq(4 + displace).children()[0];
                        timestamp.classList.add('timestamp')
                        div.append(timestamp);

                    const smsContent = $('#smsCache .message_content')[i - 1];
                        smsContent.classList.add('smsContent');
                        div.append(smsContent);

                    if($('#smsCache').children().eq(5 + displace).children().eq(1).children().first().hasClass('icon-arrow-up')) {
                        div.classList.add('message');

                        const errorElement = $('#smsCache .detail_area').eq(i - 1).find('tbody')[0];

                        const deliveryStatus = errorElement.children[3].children[2].innerText;
                        const status = errorElement.children[4].children[2].innerText;

                        if(deliveryStatus !== 'DeliveryOK' && status !== '-1') {
                            div.classList.add('error');

                            $(div).append(`<div class='smsError'><p>Status modemu: ${deliveryStatus}</p><p>Kod statusu: ${status}</p></div>`);
                        }
                    } else {
                        div.classList.add('response');
                    }

                    smsFolder.append(div);
                }

                const smsCountDifference = smsFolder.children.length - $('#smsContainer').children().length;

                if(smsCountDifference) {

                    const smsContainer = $('#smsContainer');
                    const fetchedSms = document.querySelectorAll('#smsFolder .sms');
                    const isContainerEmpty = !$('#smsContainer').children().length;
                    for(let i = 0; i < smsCountDifference; i++) {
                        if(isContainerEmpty) {
                            smsContainer.prepend(fetchedSms[i])
                        } else {
                            smsContainer.append(fetchedSms[i])
                        }

                        if(fetchedSms[i].classList.contains('message')) addResendBtn(fetchedSms[i]);
                    }

                    scrollDown();

                    if(document.querySelectorAll('#smsFolder .sms.response').length - document.querySelectorAll('#smsContainer .sms.response').length) {
                        let bool = true;
                        flasher = setInterval(() => {
                            if(!document.hidden) {
                                document.title = 'SMSEagle';
                                clearInterval(flasher);
                                flasher = null;
                                bool = false;
                                return;
                            }

                            if(bool) {
                                document.title = 'Nowy SMS!';
                                bool = !bool;
                            } else {
                                document.title = 'SMSEagle';
                                bool = !bool;
                            }
                        }, 400)
                    }
                }

                $('#containerShadow').fadeTo(50, 0.5, function () { $(this).fadeTo(250, 0); });

                updateDate();
            })
        }

        function listenForSms(shouldRefresh) {
            if(!!shouldRefresh) {

                if(interval) {
                    clearInterval(interval);
                    interval = null;
                }

                document.title = 'SMSEagle - Odświeżanie';
                interval = setInterval(fetchSms, 3000);

            } else if(interval) {
                clearInterval(interval);
                interval = null;

                document.title = 'SMSEagle';
            }
        }

        function addResendBtn(element) {
            if(!element) return
            const resendBtn = createResendBtn();
            element.appendChild(resendBtn);

            resendBtn.addEventListener('click', e => {
                if(!confirm('Czy na pewno chcesz wysłać tą wiadomość ponownie?')) return
                $('#textarea').val(getSmsContent(e.target))

                handleSend(e);
            })

            const editBtn = createEditBtn();
            element.appendChild(editBtn);

            editBtn.addEventListener('click', e => {
                $('#textarea').val(getSmsContent(e.target));
                document.getElementById('textarea').focus();
            })
        }

        function getSmsContent(element) {
            const container = element.parentElement.children;

            for(const child of container) {
                if(child.classList.contains('smsContent')) {
                    return child.textContent;
                }
            }
        }

        function createResendBtn() {
            const result = document.createElement('span')
            result.classList.add('isw-mail')
            result.title = 'Wyślij jeszcze raz';

            return result
        }

        function createEditBtn() {
            const result = document.createElement('span')
            result.classList.add('isw-edit')
            result.title = 'Edytuj wiadomość';

            return result
        }

        function createCacheElement() {
            if(!document.getElementById('smsCache')) {
                const cache = document.createElement('div');
                cache.id = 'smsCache';
                cache.style.display = 'none';
                document.getElementById('container').appendChild(cache);
            }

            if(!document.getElementById('smsFolder')) {
                const smsFolder = document.createElement('div');
                smsFolder.id = 'smsFolder';
                smsFolder.style.display = 'none';
                document.getElementById('container').appendChild(smsFolder);
            }
        }

        function createNrInput(number) {
            const nrInput = document.createElement('input');
                nrInput.classList.add('block');
                nrInput.id = 'nrInput';
                nrInput.value = +number;

            document.getElementById('container').appendChild(nrInput);

            $('#nrInput').on('focusout', function({target}) {
                window.location.hash = `chat=true&number=${target.value}`;
            });
        }

        function createInputPanel() {
            const inputContainer = document.createElement('div');
                inputContainer.id = 'inputContainer';

            const textarea = document.createElement('textarea');
                textarea.id = 'textarea';
                textarea.rows = 4;
                textarea.style = 'width: 100%; padding: 0; resize: none;'

            const lastUpdateDate = document.createElement('p');
                lastUpdateDate.id = 'lastUpdateDate';
                lastUpdateDate.style = 'width:100%; text-align: center;';

            const refreshBtn = document.createElement('div');
                refreshBtn.id = 'refreshBtn';
                refreshBtn.classList.add('switch');
                refreshBtn.title = 'Odświeżaj co 3 sekundy';
                refreshBtn.innerHTML = `
                  <label>Odświeżanie</label>
                  <input id="radioOff" type="radio" checked="checked" name="refreshSwitch">
                  <input id="radioOn" type="radio" name="refreshSwitch">
                  <span class="toggle-outside">
                      <span class="toggle-inside"></span>
                  </span>`;


            const sendBtn = document.createElement('button');
                sendBtn.id = 'sendBtn';
                sendBtn.classList.add('btn');
                sendBtn.innerText = 'Wyślij'
                sendBtn.style = 'width: 100px';

            const resultWindow = document.createElement('div');
                resultWindow.id = 'resultWindow';
                resultWindow.style = 'margin-top: 10px';

            $('#container').append(lastUpdateDate);
            $('#container').append(inputContainer);
            $('#inputContainer').append(textarea);
            $('#inputContainer').append(refreshBtn);
            $('#inputContainer').append(sendBtn);
            $('#inputContainer').append(resultWindow);

            $('#textarea').on('keypress', (e) => {
                if(e.charCode === 13 && !e.shiftKey) {
                    handleSend(e);
                }
            });

            $('#radioOn').on('input', () => {listenForSms(true)});
            $('#radioOff').on('input', () => {listenForSms(false)});

            $('#sendBtn').on('click', handleSend);

        }

        function handleSend(e) {
            e.preventDefault();

            const message = $('#textarea').val();
            const number = $('#nrInput').val().replaceAll(' ', '');

            if(message === '') return;

            if(number.includes(',')) {
                const numbers = number.split(',');

                for(let i = 0; i < numbers.length; i++) {
                    sendSms(numbers[i], message, () => {console.log(`Wysłano wiadomość do ${numbers[i]}`)});
                }
            } else {
                sendSms(number, message);
                document.getElementById('radioOn').click();
            }

            $('#textarea').val('');
        }

        function scrollDown() {
            const element = document.getElementById('smsContainer');
            element.scrollTop = element.scrollHeight;
        }

        function updateDate() {
            const date = new Date();
            const hours = date.getHours().toString();
            const minutes = date.getMinutes().toString();
            const seconds = date.getSeconds().toString();

            const formattedDate = hours + ":" + (minutes.length === 1 ? '0' + minutes : minutes) + ":" + (seconds.length === 1 ? '0' + seconds : seconds);
            $('#lastUpdateDate').text('Last update: ' + formattedDate);
        }

        function createContainerShadow() {
         const boxShadow = document.createElement('div');
            boxShadow.id = 'containerShadow';

            $('body').append(boxShadow);
        }

        function createFetchTypeBtnGroup() {
            const fetchTypeBtnGroup = document.createElement('div');
                fetchTypeBtnGroup.classList.add('btn-group');
                fetchTypeBtnGroup.role = 'group';
                fetchTypeBtnGroup.id = 'fetchTypeBtnGroup';

            const togglePrivateBtn = document.createElement('button');
                togglePrivateBtn.classList.add('btn', 'btn-primary', 'btn-sm');
                togglePrivateBtn.innerText = 'Tylko moje'
                togglePrivateBtn.onclick = () => {
                    if(!togglePrivateBtn.classList.contains('btn-primary')) {
                        fetchType = 'sentitems';
                        swapBtnClass();
                        fetchSms();
                    }
                }

            const toggleAllBtn = document.createElement('button');
                toggleAllBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
                toggleAllBtn.innerText = 'Wszystkie';
                toggleAllBtn.onclick = () => {
                    if(!toggleAllBtn.classList.contains('btn-primary')) {
                        fetchType = 'inbox';
                        swapBtnClass();
                        fetchSms();
                    }
                }

            document.getElementById('container').appendChild(fetchTypeBtnGroup);
            document.getElementById('fetchTypeBtnGroup').appendChild(togglePrivateBtn);
            document.getElementById('fetchTypeBtnGroup').appendChild(toggleAllBtn);

            function swapBtnClass() {
                if(!togglePrivateBtn.classList.contains('btn-primary')) {
                    togglePrivateBtn.classList.add('btn-primary');
                    togglePrivateBtn.classList.remove('btn-secondary');
                    toggleAllBtn.classList.add('btn-secondary');
                    toggleAllBtn.classList.remove('btn-primary');
                } else {
                    toggleAllBtn.classList.add('btn-primary');
                    toggleAllBtn.classList.remove('btn-secondary');
                    togglePrivateBtn.classList.add('btn-secondary');
                    togglePrivateBtn.classList.remove('btn-primary');
                }
            }
        }

    }

    function createNavigationInput() {
        const navigationInput = document.createElement('li');
        navigationInput.innerHTML = `<a>
                <span class="isw-chat"></span>
                <span class="text inputHolder">
                    <input id="navigationInput" placeholder="Wprowadź numer">
                </span>
            </a>`;

        document.querySelector('ul.navigation').append(navigationInput);
        document.getElementById('navigationInput').addEventListener('focusout', onNavigationInput);

        function onNavigationInput({target}) {
            const number = target.value;
            if(number === '') return

            showAltEagle(+number);
            window.location.hash = `chat=true&number=${number}`;
        }

        $('#navigationInput').on('keypress', (e) => {
            if(e.charCode === 13 && !e.shiftKey) {
                onNavigationInput(e);
            }
        });
    }

    function addStylesheet() {
        const stylesheet = document.createElement('style');
        stylesheet.type = "text/css";

        const switchSize = 11.5;

        stylesheet.textContent = `
            #navigationInput {
                border: 0;
                width: 168px;
            }
            .inputHolder {
                padding: 8px 4px 8px 0 !important;
                width: 170px !important;
            }
            .sms .isw-mail {
                cursor: pointer;
                position: absolute;
                right: 5px;
                top: 5px;
            }
            .sms .isw-edit {
                cursor: pointer;
                position: absolute;
                right: 30px;
                top: 5px;
            }
            .sms {
                position: relative;
                padding-bottom: 10px;
                width: 340px;
                text-align: left;
                font: 400 .9em, sans-serif;
                border: 1px solid #97C6E3;
                border-radius: 10px;
                margin-bottom: 10px;
                min-height: 32px;
            }
            .message {
                background-color: #A8DDFD;
                margin-left: calc(100% - 360px);
            }
            .response {
                background-color: #F8E896;
            }
            .timestamp {
                position: absolute;
                font-size: .85em;
                font-weight: 300;
                bottom: 0;
                right: 8px;
            }
            .smsContent {
                overflow-wrap: break-word;
                font-weight: 700;
                margin-right: 55px;
            }
            .message.error {
                background-color: #F95;
            }
            .smsError {
                text-align: center;
            }
            .smsError p {
                margin: 0;
            }
            #container {
                width: 750px;
                margin-left: calc(50% - 375px);
            }
            #smsContainer {
                overflow: hidden auto;
                height: 55vh;
                margin-bottom: 10px;
            }
            #nrInput {
                text-align: center;
                font-size: 1.6em;
                margin-bottom: 5px;
                width: 100%;
                padding-left: 0;
                padding-right: 0;
            }
            #containerShadow {
                width: 100%;
                opacity: 0;
                top: 0px;
                z-index: -100;
                height: 100%;
                position: absolute;
                box-shadow: rgb(255, 191, 0) 0px 0px 120px 10px inset;
            }
            #fetchTypeBtnGroup {
                width:100%;
                text-align: center;
                margin-bottom: 2px;
            }
.switch {
  display: inline-block;
  position: relative;
  width: 190px;
  height: ${2.5 * switchSize}px;
  font-size: 0;
  margin-left: 60%;
}
.switch input {
  position: absolute;
  top: 0;
  z-index: 2;
  opacity: 0;
  cursor: pointer;
}
.switch input:checked {
  z-index: 1;
}
.switch label {
  color: #444;
  opacity: 0.7;
  transition: opacity 0.25s ease;
  cursor: pointer;  cursor: default;
  font-size: ${1.5 * switchSize}px;
  line-height: ${3 * switchSize}px;
  display: inline-block;
  width: ${6 * switchSize}px;
  height: 100%;
  margin: 0;
  text-align: center;
}
.switch .toggle-outside {
  height: 100%;
  border-radius: ${2 * switchSize}px;
  padding: ${0.25 * switchSize}px;
  overflow: hidden;
  transition: 0.25s ease all;
}
.switch .toggle-inside {
  border-radius: ${5 * switchSize}px;
  background: #4a4a4a;
  position: absolute;
  transition: 0.25s ease all;
}
.switch input {
  height: ${3 * switchSize}px;
  width: ${6 * switchSize}px;
  left: ${9 * switchSize}px;
  margin: 0;
}
.switch .toggle-outside {
  background: #fff;
  position: absolute;
  width: ${5.5 * switchSize}px;
  left: ${9 * switchSize}px;
}
.switch .toggle-inside {
  height: ${2.5 * switchSize}px;
  width: ${2.5 * switchSize}px;
}
.switch input:checked ~ .toggle-outside .toggle-inside {
  left: ${0.25 * switchSize}px;
}
.switch input ~ input:checked ~ .toggle-outside .toggle-inside {
  left: ${3.25 * switchSize}px;
  background: #e8a11f;
}
.switch input:checked + label:hover ~ .toggle-outside .toggle-inside {
  height: ${2.5 * switchSize}px;
  width: ${2.5 * switchSize}px;
}
.switch input:hover ~ .toggle-outside .toggle-inside {
  width: ${3.5 * switchSize}px;
}
.switch input:hover ~ input:checked ~ .toggle-outside .toggle-inside {
  left: ${2.25 * switchSize}px;
}
        `;

        document.querySelector('head').appendChild(stylesheet);
    }
})();