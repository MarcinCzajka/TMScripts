// ==UserScript==
// @name         Eagle Alternative
// @namespace    https://github.com/MarcinCzajka
// @version      2.18.28
// @description  Overlay for Kalkun integration
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/EagleAlternative.user.js
// @author       MAC
// @match        http://*sms.fr*
// @include      http://*sms.fr*
// @match        http://*.pl/record/*
// @include      *.pl/record/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at document-end
// ==/UserScript==

(function() {
    'use strict';

    if(window.location.href.includes('.pl/record/')) {
        //Create link do Alternative eagle in Database
        let simNr = '';
        setTimeout(() => {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutationRecord) {
                    if(mutationRecord.target.classList.contains('modal-open')) createLink();
                });
            });

            observer.observe(document.querySelector('body'), { attributes : true, attributeFilter : ['class'] });
        }, 1000);

        function createLink() {
            if(document.getElementById('trackerInfo')) {
                const table = document.getElementsByClassName('modal-body')[0].querySelectorAll('tbody td');

                for(const td of table) {
                    if(td.innerText === 'SIM') {
                        const simTd = td.nextElementSibling;
                        simTd.style.position = 'relative';
                        simNr = simTd.innerText;

                        if(simNr) {
                            createLinkToEagle(simTd.parentElement);
                        }

                        return
                    }
                }
            }
        }

        function createLinkToEagle(el) {
            const td = document.createElement('td');
                td.style.position = 'relative';
                td.style.padding = '0';
            const btn = document.createElement('button');
                btn.classList.add('btn', 'btn-success', 'btn-sm');
                btn.style = 'position: absolute; right: 0; top: 0; height:100%;width:85px;';
                btn.innerText = 'Wyślij SMS';
                btn.onclick = openEagle;


            el.append(td);
            td.append(btn);
        }

        function openEagle() {
            const url = 'http://' + window.location.host.replace('gps', 'sms') + ':86//'
            const query = '#chat=true&number=' + simNr;
            window.open(url + query);
        }
    } else {
        if(window.location.href.includes('login')) {
            window.localStorage.setItem('hash', window.location.hash || window.location.search)
            return
        }

        let query = window.location.hash || window.location.search;

        if(!query) {
            query = window.localStorage.getItem('hash');
            window.localStorage.removeItem('hash');
            history.pushState(null, null, query);
        }

        addStylesheet();
        createNavigationInput();

        if(!query) return
        if(query.includes('chat=true')) {
            showAltEagle();
        }

        function showAltEagle(number = `+${query.slice(query.indexOf('number') + 7).replace('+', '')}`) {
            let fetchType = 'sentitems'; //inbox
            let modem = 0;

            if(document.getElementById('smsContainer')) {
                document.getElementById('nrInput').value = number;
                fetchSms();

                return
            }

            let interval = null;
            let flasher = null;

            const csrf = document.querySelector('input[name=csrf_test_name]').value;

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
            detectModem(number);

            container.appendChild(smsContainer);

            createInputPanel();

            container.appendChild( createTemplates() )

            createContainerShadow();

            fetchSms();

            window.onhashchange = function(e) {
                const hash = window.location.hash;
                const newNumber = hash.slice(hash.indexOf('number') + 7).replace('+', '');
                const currentNumber = $('#nrInput');

                if(newNumber !== currentNumber.val()) {
                    currentNumber.val(newNumber);
                }

                detectModem(newNumber)

                $('#smsContainer').empty();
                fetchSms();
            };

            function detectModem(number) {
                const nr = String(number).replace('+', '').slice(0,2);
                if(nr === '46') {
                    document.getElementById('tele2Btn').click();
                } else if(nr === '48') {
                    document.getElementById('tmobileBtn').click();
                }
            }

            function sendSms(number, message) {
                if(!number) {
                    console.log(`Nieprawidłowy numer: ${number}`);
                    return
                } else if(!message) {
                    console.log(`Nieprawidłowa wiadomość: ${message}`);
                    return
                } else if (!modem) {
                    console.log('Nie wybrano modemu (Tele2/Tmobile)');
                    return
                }

                const data = {
                    'csrf_test_name': csrf,
                    'sendoption': 'sendoption3',
                    'manualvalue': '+' + number.replace('+', ''),
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
                $('#smsCache').load(`${window.location.origin}//messages/conversation/folder/${fetchType}/${nr}/`, function() {

                    const smsElements = $('#smsCache .messaging .message_container.item');

                    if(!smsElements) return;

                    const smsFolder = document.getElementById('smsFolder');
                    smsFolder.textContent = '';

                    for(const sms of smsElements) {

                        const div = document.createElement('div');
                            div.classList.add('sms');

                        const timestamp = document.createElement('div');
                            timestamp.textContent = Array.from($(sms).find('.details')[0].children).find(el => el.textContent === 'Data:').nextSibling.textContent.trim().replaceAll('/', '-');
                            timestamp.classList.add('timestamp');
                        div.append(timestamp);

                        const smsContent = document.createElement('p');
                            smsContent.classList.add('smsContent');
                            smsContent.textContent = $(sms).find('div.info.clearfix')[0].nextSibling.textContent.trim();
                        div.append(smsContent);


                        if(sms.classList.contains('itemOut')) {
                            div.classList.add('message');

                            const deliveryStatus = Array.from($(sms).find('.details')[0].children).find(el => el.textContent === 'Status modemu:').nextSibling.textContent.trim();;
                            const status = Array.from($(sms).find('.details')[0].children).find(el => el.textContent === 'Kod statusu:').nextSibling.textContent.trim();;

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
                        const fetchedSmsLength = fetchedSms.length;
                        const isContainerEmpty = !$('#smsContainer').children().length;

                        for(let i = 1; i <= smsCountDifference; i++) {
                            const newSms = fetchedSms[fetchedSmsLength - i];

                            if(isContainerEmpty) {
                                smsContainer.prepend(newSms);
                            } else {
                                smsContainer.append(newSms);
                            }

                            if(newSms.classList.contains('message')) addResendBtn(newSms);
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
                        sendSms(numbers[i], message);
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
                            setBtnClass(togglePrivateBtn, toggleAllBtn);
                            fetchSms();
                        }
                    }

                const toggleAllBtn = document.createElement('button');
                    toggleAllBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
                    toggleAllBtn.innerText = 'Wszystkie';
                    toggleAllBtn.onclick = () => {
                        if(!toggleAllBtn.classList.contains('btn-primary')) {
                            fetchType = 'inbox';
                            setBtnClass(toggleAllBtn, togglePrivateBtn);
                            fetchSms();
                        }
                    }

                document.getElementById('container').appendChild(fetchTypeBtnGroup);
                document.getElementById('fetchTypeBtnGroup').appendChild(togglePrivateBtn);
                document.getElementById('fetchTypeBtnGroup').appendChild(toggleAllBtn);

                createOperatorBtnGroup(fetchTypeBtnGroup);
            }

            function createOperatorBtnGroup(parentElement) {
                const btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group');
                btnGroup.role = 'group';
                btnGroup.id = 'operatorBtnGroup';

                const tele2Btn = document.createElement('button');
                tele2Btn.classList.add('btn', 'btn-secondary', 'btn-sm');
                tele2Btn.innerText = 'Tele2';
                tele2Btn.id = 'tele2Btn';
                tele2Btn.onclick = () => {
                    modem = 1;
                    setBtnClass(tele2Btn, tmobileBtn);
                }

                const tmobileBtn = document.createElement('button');
                tmobileBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
                tmobileBtn.innerText = 'T-Mobile';
                tmobileBtn.id = 'tmobileBtn';
                tmobileBtn.onclick = () => {
                    modem = 2;
                    setBtnClass(tmobileBtn, tele2Btn);
                }


                btnGroup.append(tele2Btn, tmobileBtn);
                parentElement.appendChild(btnGroup);
            }

            function setBtnClass(primaryButton, secondaryButton) {
                primaryButton.classList.add('btn-primary');
                primaryButton.classList.remove('btn-secondary');
                secondaryButton.classList.add('btn-secondary');
                secondaryButton.classList.remove('btn-primary');
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

        function createTemplates() {

            if(!GM_getValue('templateData')) GM_setValue('templateData', {lastId: 0, templateGroups: []} )

            const templateContainer = document.createElement('div');
                templateContainer.id = 'templateContainer';

            const header = document.createElement('h5');

            const headerTitle = document.createElement('p');
                headerTitle.innerText = 'Templates';

            const newCategory = document.createElement('i');
                newCategory.classList.add('isb-text_document', 'newCategory');
                newCategory.title = 'Nowa kategoria';

            newCategory.addEventListener('click', (e) => {
                e.stopPropagation();

                const newMessageTemlateInputContainer = document.querySelector('#templateContainer .inputContainer.newMessageTemplate');
                if(newMessageTemlateInputContainer) newMessageTemlateInputContainer.remove();

                if(document.querySelector('.inputContainer')) return

                const inputContainer = document.createElement('div');
                    inputContainer.classList.add('inputContainer');

                const input = document.createElement('input');
                    input.placeholder = 'Nazwa nowej kategorii...';

                const acceptBtn = document.createElement('button');
                    acceptBtn.classList.add('btn', 'acceptBtn');
                    acceptBtn.innerText = 'Dodaj';

                inputContainer.append(input, acceptBtn);

                templateContainer.insertBefore(inputContainer, header.nextSibling);

                acceptBtn.addEventListener('click', onInput)
                $(input).keypress((e) => {
                    if(e.keyCode === 13 && !e.shiftKey) onInput();
                })

                function onInput() {
                    if(!input.value) return

                    const templateData = GM_getValue('templateData');

                    const newId = templateData.lastId + 1;
                    templateData.lastId = newId;

                    const newTemplate = {name: input.value, templates: [], id: newId};

                    templateData.templateGroups.push(newTemplate);

                    GM_setValue('templateData', templateData);

                    inputContainer.parentElement.removeChild(inputContainer);

                    appendTemplate(newTemplate, document.getElementById('templatesList'));

                    document.querySelector('body').removeEventListener('click', e => {closeOnClickOutsideOfElement(inputContainer)});
                }

                document.querySelector('body').addEventListener('click', e => {closeOnClickOutsideOfElement(inputContainer)});
                inputContainer.addEventListener('click', (e) => {e.stopPropagation()})

                input.focus();
            })

            header.append(headerTitle, newCategory);

            templateContainer.appendChild(header);

            const templates = generateTemplates(GM_getValue('templateData').templateGroups);
            templateContainer.appendChild(templates);

            return templateContainer
        }

        function appendTemplate(template, container) {
            const element = document.createElement('div');
                element.classList.add('templateWrapper');
                element.dataset.templateId = template.id;

            const header = document.createElement('header');
            const title = document.createElement('h4');
                title.textContent = template.name;

            const newMessage = document.createElement('i');
                newMessage.classList.add('icon-plus-sign');

            newMessage.addEventListener('click', (e) => {
                e.stopPropagation();

                const newMessageTemlateInputContainer = document.querySelector('#templateContainer .inputContainer.newMessageTemplate');
                if(newMessageTemlateInputContainer) newMessageTemlateInputContainer.remove();

                const temlateInputContainer = document.querySelector('#templateContainer .inputContainer');
                if(temlateInputContainer) temlateInputContainer.remove();

                const inputContainer = document.createElement('div');
                inputContainer.classList.add('inputContainer', 'newMessageTemplate');

                const input = document.createElement('input');
                input.placeholder = 'Nowa komenda SMS...';

                const acceptBtn = document.createElement('button');
                acceptBtn.classList.add('btn', 'acceptBtn');
                acceptBtn.innerText = 'Zapisz';

                acceptBtn.addEventListener('click', onInput);
                $(input).keypress((e) => {
                    if(e.keyCode === 13 && !e.shiftKey) onInput();
                })

                function onInput() {
                    if(!input.value) return

                    const templateId = template.id;
                    const templateData = GM_getValue('templateData');

                    for(const template of templateData.templateGroups) {
                        if(templateId === template.id) {
                            template.templates.push(input.value);
                            break
                        }
                    }

                    GM_setValue('templateData', templateData);

                    inputContainer.parentElement.removeChild(inputContainer);

                    const message = document.createElement('li');
                    message.classList.add('messageTemplate');
                    message.textContent = input.value;

                    message.addEventListener('click', () => {
                        document.getElementById('textarea').value = input.value;
                    });

                    element.children[1].append(message);

                    document.querySelector('body').removeEventListener('click', e => {closeOnClickOutsideOfElement(inputContainer)});
                }

                inputContainer.append(input, acceptBtn);

                document.querySelector('body').addEventListener('click', e => {closeOnClickOutsideOfElement(inputContainer)});
                inputContainer.addEventListener('click', (e) => {e.stopPropagation()})

                element.parentElement.insertBefore(inputContainer, element.nextSibling);
            })

            const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('icon-trash');
                deleteIcon.addEventListener('click', deleteTemplate);

            const editIcon = document.createElement('i');
                editIcon.classList.add('icon-cog');
                editIcon.addEventListener('click', editTemplate);

            header.append(title, newMessage, deleteIcon, editIcon);
            element.appendChild(header);

            const messageList = document.createElement('ul');
            element.appendChild(messageList);

            if(template.templates?.length) {
                for(const messageTemplate of template.templates) {
                    const message = document.createElement('li');
                    message.classList.add('messageTemplate');
                    message.textContent = messageTemplate;

                    message.addEventListener('click', () => {
                        document.getElementById('textarea').value = messageTemplate;
                    });

                    messageList.append(message);
                }
            }

            container.appendChild(element);
        }

        function deleteTemplate( e ) {
            if (!confirm('Czy na pewno chcesz usunąć grupę? Wszystkie szablony w grupie zostaną utracone.')) return

            const templateElement = e.target.parentElement.parentElement;
            const templateId = +templateElement.dataset.templateId;

            const templateData = GM_getValue('templateData');

            for(let i = 0; i < templateData.templateGroups.length; i ++) {
                if(templateData.templateGroups[i].id === templateId) {
                    templateData.templateGroups.splice(i, 1);
                    break
                }
            }

            GM_setValue('templateData', templateData)
            templateElement.remove();
        }

        function editTemplate(e) {
            const templateElement = e.target.parentElement.parentElement;
            const templateId = +templateElement.dataset.templateId;

            const templateData = GM_getValue('templateData');

            for(let i = 0; i < templateData.templateGroups.length; i ++) {
                if(templateData.templateGroups[i].id === templateId) {
                    console.log(templateData.templateGroups[i])
                    break
                }
            }

            GM_setValue('templateData', templateData)
        }

        function generateTemplates(data) {
            const container = document.createElement('div');
            container.id = 'templatesList';

            for(const template of data) {
                appendTemplate(template, container);
            }

            return container
        }

        function closeOnClickOutsideOfElement(element) {
            document.querySelector('body').removeEventListener('click', closeOnClickOutsideOfElement);
            if(element) element.remove();
        }

        function addStylesheet() {
            const stylesheet = document.createElement('style');
            stylesheet.type = "text/css";

            const switchSize = 11.5;
            const templateWidth = 300;
            const headerHeight = 40;

            stylesheet.textContent = `
                #navigationInput {
                    border: 0;
                    width: 168px;
                }
                #fetchTypeBtnGroup .btn {
                    width: 97px;
                }
                #operatorBtnGroup button:first-child {
                    margin-left: 5em;
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
                    font-size: .88em;
                    bottom: 0;
                    right: 8px;
                }
                .smsContent {
                    overflow-wrap: break-word;
                    font-weight: 600;
                    margin: 3px 55px 5px 10px;
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
                    position: relative;
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
                background: #989797;
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
                background: #e4c629;
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
                #templateContainer {
                    background-color: white;
                    position: absolute;
                    right: -${templateWidth + 50}px;
                    top: 0;
                    width: ${templateWidth}px;
                    height: 610px;
                    border: 1px solid #ccc;
                    border-top: 0;
                    overflow-x: hidden;
                    overflow-y: scroll;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                #templateContainer::-webkit-scrollbar {
                    display: none;
                }

                #templateContainer h5 {
                    text-align: center;
                    border-bottom: 1px solid #ccc;
                    margin: 0;
                    height: ${headerHeight}px;
                    line-height: ${headerHeight}px;
                }

                #templateContainer h5 p {
                    margin: 0;
                }

                #templateContainer h5 i {
                    position: absolute;
                    cursor: pointer;
                    padding: 5px;
                }

                #templateContainer h5 .newCategory {
                    top: 7px;
                    right: 11px;
                }

                #templateContainer .inputContainer {
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    float: none;
                }

                #templateContainer input {
                    margin:0;
                    padding: 2px;
                    flex: 70%;
                }

                #templateContainer .acceptBtn {
                    margin:0;
                }

                #templateContainer .templateWrapper header {
                    display: flex;
                }

                #templateContainer .templateWrapper ul {
                    list-style: none;
                }

                #templateContainer .templateWrapper ul li {
                    cursor: pointer;
                    line-height: 15px;
                    margin: 0 10px 6px 0;
                }

                #templateContainer .templateWrapper header h4 {
                    margin: 10px 5px 10px 10px;
                }

                #templateContainer .templateWrapper header i {
                    align-self: center;
                    cursor: pointer;
                    margin-left: 7px;
                }

                .templateWrapper .icon-cog {
                    display: none !important;
                }

            `;

            document.querySelector('head').appendChild(stylesheet);
        }
    }
})();