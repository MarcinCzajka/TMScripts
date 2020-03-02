// ==UserScript==
// @name         Eagle Alternative
// @namespace    https://github.com/MarcinCzajka
// @version      0.1.2
// @description  Overlay for Kalkun integration
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @author       MAC
// @match        http://*sms*
// @include      http://*sms*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    if(window.location.search.includes('chat=true')) {
        const query = window.location.search;

        let interval = null;

        const csrf = $('csrf_test_name').first().val();

        $('body').find('div').remove();

        const container = document.createElement('div');
            container.id = 'container';
            container.style = 'width: 750px; margin-left: calc(50% - 375px);';

        const smsContainer = document.createElement('div');
            smsContainer.classList.add('block');
            smsContainer.id = 'smsContainer';
            smsContainer.style.marginBottom = '10px';

        $('body').append(container);

        createNrInput();

        $('#container').append(smsContainer);

        //Make container scrollable
        $('#smsContainer').css('overflow-x', 'hidden');
        $('#smsContainer').css('overflow-y', 'auto');
        $('#smsContainer').css('height', '60vh');

        createInputPanel();

        fetchSms();

        function sendSms(number, message) {
            const nr = number.toString().replace('+', '');
            let modem = null;
            if(String(nr).slice(0,2) === '46') {
                modem = 1;
            } else if(String(nr).slice(0,2) === '48') {
                modem = 2;
            }

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
            });
        }

        function fetchSms() {
            const nr = `+${$('#nrInput').val().replace('+', '')}`;
            $('#smsContainer').load(`${window.location.origin}//messages/conversation/folder/sentitems/${nr}/`, function() {
                $('[type=hidden]').remove();
                $('.message_metadata').remove();
                $('.hidden').remove();
                $('.optionmenu').remove();
                $('.nicecheckbox').remove();
                $('.icon-folder-open').remove();
                $('.message_preview').parent().prev().remove();
                $('.message_preview').remove();
                $('.icon-arrow-up').parent().remove();
                $('.message_content').prev().remove();

                const smsCount = (smsContainer.children.length / 3) + 1;
                for(let i = 1; i < smsCount; i++){
                    const div = document.createElement('div');
                    div.classList.add('sms');

                    for(let x = 1; x <= 3; x++) {
                        if(x === 1) {
                            smsContainer.children[0].classList.add('timestamp');
                        } else if(x === 2) {
                            if(smsContainer.children[0].children.length === 2) {
                                div.classList.add('response');
                            } else {
                                div.classList.add('message');
                            }
                            smsContainer.children[0].classList.add('remove');
                        } else {
                            smsContainer.children[0].classList.add('smsContent');
                        }

                        div.appendChild(smsContainer.children[0]);
                    };
                    $('#smsContainer').append(div);

                    $('#refreshBtn').fadeTo(50, 0.5, function () { $(this).fadeTo(250, 1.0); });
                };

                $('.remove').remove();

                styleSms();

                scrollDown();

                updateDate();

            })
        }

        function listenForSms(ms) {
            fetchSms();

            if(interval) {
                clearInterval(interval);
                interval = null;
            }

            interval = setInterval(fetchSms, 3000);
            toggleRefreshBtnStyle(true);

            window.setTimeout(() => {
                clearInterval(interval);
                interval = null;

                toggleRefreshBtnStyle(false)
            }, ms)
        }

        function toggleRefreshBtnStyle(isRefreshing) {
            const refreshBtn = $('#refreshBtn');
            if(isRefreshing) {
                refreshBtn.text('Odświeżam...');
                refreshBtn.addClass('btn-warning');
                refreshBtn.removeClass('btn-success');
            } else {
                refreshBtn.text('Odśwież');
                refreshBtn.addClass('btn-success');
                refreshBtn.removeClass('btn-warning');
            }
        }

        function styleSms() {
            $('.sms').css('position', 'relative');
            $('.sms').css('padding-bottom', '10px');
            $('.sms').css('width', '340px');
            $('.sms').css('text-align', 'left');
            $('.sms').css('font', '400 .9em, sans-serif');
            $('.sms').css('border', '1px solid #97C6E3');
            $('.sms').css('border-radius', '10px');
            $('.sms').css('margin-bottom', '10px');

            $('.message').css('background-color', '#A8DDFD');
            $('.message').css('margin-left', 'calc(100% - 360px)');
            $('.response').css('background-color', '#f8E896');

            $('.timestamp').css('position', 'absolute');
            $('.timestamp').css('font-size', '.85em');
            $('.timestamp').css('font-weight', '300');
            $('.timestamp').css('bottom', '0');
            $('.timestamp').css('right', '8px');

            $('.smsContent').css('overflow-wrap', 'break-word');
            $('.smsContent').css('font-weight', '700');
        }

        function createNrInput() {
            const nrInput = document.createElement('input');
                nrInput.classList.add('block');
                nrInput.id = 'nrInput';
                nrInput.value = `+${query.slice(query.indexOf('number') + 7).replace('+', '')}`;

            document.getElementById('container').appendChild(nrInput);

            $('#nrInput').css('text-align', 'center');
            $('#nrInput').css('font-size', '1.6em');
            $('#nrInput').css('margin-bottom', '10px');
            $('#nrInput').css('width', '100%');
            $('#nrInput').css('padding-left', '0');
            $('#nrInput').css('padding-right', '0');

            $('#nrInput').on('focusout', fetchSms);
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

            const refreshBtn = document.createElement('button');
                refreshBtn.id = 'refreshBtn';
                refreshBtn.classList.add('btn');
                refreshBtn.classList.add('refresh_button');
                refreshBtn.classList.add('btn-success');
                refreshBtn.innerText = 'Odśwież';
                refreshBtn.style = 'width: 100px; margin-left: calc(100% - 220px);';
                refreshBtn.title = 'Odświeża co 3 sekundy przez minutę';

            const sendBtn = document.createElement('button');
                sendBtn.id = 'sendBtn';
                sendBtn.classList.add('btn');
                sendBtn.innerText = 'Wyślij'
                sendBtn.style = 'width: 100px; margin-left: 20px';

            const resultWindow = document.createElement('div');
                resultWindow.id = 'resultWindow';
                resultWindow.style = 'margin-top: 10px';

            $('#container').append(lastUpdateDate);
            $('#container').append(inputContainer);
            $('#inputContainer').append(textarea);
            $('#inputContainer').append(refreshBtn);
            $('#inputContainer').append(sendBtn);
            $('#inputContainer').append(resultWindow);

            $('#refreshBtn').on('click', () => {
                listenForSms(60000);
            });

            $('#sendBtn').on('click', () => {
                if($('#textarea').val() === '') return;

                sendSms($('#nrInput').val(), $('#textarea').val());
                $('#textarea').val('');

                listenForSms(60000);
            });
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

    }
})();