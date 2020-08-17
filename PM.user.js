// ==UserScript==
// @name         Wypełnianie protokołu montażowego
// @namespace    https://github.com/MarcinCzajka
// @version      4.36.3
// @description  Automatyczne wypełnianie protokołów
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/PM.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/PM.user.js
// @match        http://*/api/installation*
// @grant        none
// @include      */api/installation*
// @exclude      */api/installation/main/index/*
// ==/UserScript==

(function() {
    'use strict';

    const headerCaption = document.getElementById('bottom_header').children[1].children[0].innerText;
    if(headerCaption.includes("Protokół montażowy") && document.getElementById("take-trigger")) {

        const myTextbox = document.createElement("div");
        myTextbox.innerHTML = `
            <div style="width:100%">
                <input
                    type="text"
                    id="myTextbox"
                    style="width:100%"
                >
                <button
                    style="border:1px solid #28bea9;cursor:pointer;"
                    id="newButton"
                    onmouseover="this.style.opacity=0.8"
                    onmouseout="this.style.opacity=1">
                    Wypełnij protokół
                </button>
            </div>`;

        document.getElementById("header").appendChild(myTextbox);
        document.getElementById("newButton").addEventListener('click', fillProtocol);

        myTextbox.addEventListener('input', fixExcelMultilineCopy);

        function fixExcelMultilineCopy(e) {
            const inputJson = e.target.value;
            if(inputJson.substring(0,1) === '"') {
                const fixedJson = inputJson.replace(/""/g, '"').slice(1, -1);
                e.target.value = fixedJson;
            }
        }

        ///////////////////////////////////////////////////////////////////////////

        function fillProtocol() {
            $loader.show();

            setTimeout(() => {
                try {
                    const userJSON = JSON.parse(document.getElementById("myTextbox").value);
                    const firma = userJSON.firma;
                    const firmaWProtokole = $('#firma1_id').select2('data').text;

                    //Wybranie firmy
					if(firmaWProtokole === "" || firmaWProtokole === "-- Wybierz --") {
						const companies = document.getElementById("firma1_id");
						let companyValue = '';

						for(let company of companies) {
							if (company.innerText === firma) {
								companyValue = company.value;
								break;
							};
						};

						if (companyValue) {
							$('#firma1_id').select2('val', companyValue).trigger('change');
						} else {
							alert(`Nie znaleziono firmy ${firma}`);
						};
					} else {
                        if(firmaWProtokole !== firma) alert(`Firma w protokole "${firmaWProtokole}" różni się od podanej firmy: "${firma}"`)
                    }

                    //Wait for vehicle groups to fetch and then pick one up
                    window.setTimeout(() => {
                        const vehicleGroups = document.getElementById("grupa_pojazdow_id");
                        const vehicleGroupNames = userJSON.grupa || ['wszystkie', 'alle', 'todos vehiculos', 'auto', 'all_trucks'];
                        for(let group of vehicleGroups) {
                            if(typeof vehicleGroupNames === 'string') {
                                if (group.innerText.toLowerCase() === vehicleGroupNames.toLowerCase()) {
                                    $('#grupa_pojazdow_id').select2('val', group.value).trigger('change');
                                    break;
                                }
                            } else {
                                if (vehicleGroupNames.indexOf(group.innerText.toLowerCase()) > -1) {
                                    $('#grupa_pojazdow_id').select2('val', group.value).trigger('change');
                                    break;
                                }
                            }
                        }
                    },0)

                    //Kategoria montażu
                    if(userJSON.monter === "Monter klienta" || !userJSON.monter) {
                        $("#s2id_kategoria_id").select2('val', 2); //Montaż bezpłatny
                    }
                    else {
                        $("#s2id_kategoria_id").select2('val', 1); //Montaż płatny
                    };

                    if(userJSON.type === "Montaż") {
						isInvoiceActiveOnAnotherVehicle(userJSON.id);
                        $("#type_id").select2('val', 1).trigger('change');
                    } else if(userJSON.type === "Upgrade") {
                        $("#type_id").select2('val', 2).trigger('change');

                        const observer = new MutationObserver(function(mutations) {
                            for(let regNumber of document.getElementById('reg_number_select').children){
                                if(regNumber.innerText === userJSON.rej) {
                                    $('#reg_number_select').select2('val', regNumber.value).trigger('change')
                                    break
                                }
                            }

                            this.disconnect();
                        }).observe(document.getElementById('reg_number_select'), { childList : true });

                    } else if(userJSON.type.includes("Przekładka")) {
                        $("#type_id").select2('val', 3).trigger('change');

                        const rejPrzekladka = userJSON.type.replace('Przekładka z ', '').toLowerCase();

                        const pojazdyArch = $('#old_reg_number')[0];
						let valueOfVehicle = '';

                        for(let arch of pojazdyArch) {
							if (arch.innerText.toLowerCase().indexOf(rejPrzekladka) > -1) {
								valueOfVehicle = arch.value;
								break;
							};
						};

						if(valueOfVehicle) {
							$('#old_reg_number').select2('val', valueOfVehicle).trigger('change');
						} else {
							alert(`Nie znaleziono pojazdu ${userJSON.type.replace('Przekładka z ', '')} na liście pojazdów do przekładki.`);
						};
                    };

                    //Nr rejestracyjny
                    if(userJSON.rej) $("#nr_rejestracyjny").val(userJSON.rej);
                    if( $("#nr_boczny_pojazdu").val() === '.') $("#nr_boczny_pojazdu").val('');
                    if(userJSON.boczny) $("#nr_boczny_pojazdu").val(userJSON.boczny);

                    // Rodzaj/Marka/model

                    let vehicleType = 1;
                    switch(userJSON.rodzaj) {
                        case 'Osobowy':
                            vehicleType = 2;
                            break;
                        case 'Maszyna':
                            vehicleType = 3;
                            break;
                        case 'Naczepa':
                            vehicleType = 4;
                    }

                    $("#vehicle_type_id").select2("val", vehicleType).trigger('change');

                    const typeSelector = vehicleType === 4 ? '#trailer_brand_id' : "#marka_id";
                    const vehicleBrands = $(typeSelector)[0];
                    for(let brand of vehicleBrands) {
                        if (brand.innerText.toLowerCase() === userJSON.marka.toLowerCase()) {
                            $(typeSelector).select2('val', brand.value).trigger("change");
                            break;
                        };
                    };

                    document.getElementsByName('model')[0].value = userJSON.model;

                    //Nr SIM
                    document.getElementsByName('nr_karty_sim')[0].value = userJSON.sim;

                    //Zaklikaj Rejestrator

                    if(userJSON.id) {
                        click('[name=rej]')

                        //Typ rejestratora
                        if(userJSON.id.substring(0,1).toLowerCase() === 'h' && !userJSON.typRejestratora) userJSON.typRejestratora = "SE5";
                        //Skaut
                        if(userJSON.typRejestratora.substring(0, 2) === "SE") {
                            const blackboxBrands = $("#rodzaj_rejestratora_id")[0];
                            for(let brand of blackboxBrands) {
                                if (brand.innerText === "Setivo") {
                                    $("#rodzaj_rejestratora_id").select2('val', brand.value).trigger('change');
                                    break;
                                };
                            };

                            //Baza odczytów
                            document.getElementById("database-config").style = "width: 260px; display: inline-block";

                            const databaseConfigs = document.getElementsByName("config_db_id")[0];

                            for(let config of databaseConfigs) {
                                if (config.innerText === "[A] gps.ze-it.pl") {
                                    $('#database-config').find('.select2-container').select2('val', config.value).trigger('change');
                                    break;
                                };
                            };

                            //Typ rejestratora
                            const blackboxType = $("#typ_rejestratora_id")[0];

                            for(let type of blackboxType) {
                                if (type.innerText === userJSON.typRejestratora) {
                                    $("#typ_rejestratora_id").select2('val', type.value).trigger('change');
                                    break;
                                };
                            }
                        } else if(userJSON.typRejestratora === "Albatros" || (parseInt(userJSON.id) > 99999 && parseInt(userJSON.id) < 999999)) {
                            const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                            for(let producent of blackboxProducent) {
                                if (producent.innerText === "Albatros") {
                                    $("#rodzaj_rejestratora_id").select2('val', producent.value).trigger('change');
                                    break;
                                };
                            };

                            const blackboxType = $("#typ_rejestratora_id")[0];

                            for(let type of blackboxType) {
                                if (type.innerText === "Albatros 8.5") {
                                    $("#typ_rejestratora_id").select2('val', type.value).trigger('change');
                                    break;
                                };
                            };


                        } else if (userJSON.typRejestratora.substring(0,2).toLowerCase === "fm" || parseInt(userJSON.id) > 999999) {
                            const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                            for(let producent of blackboxProducent) {
                                if (producent.innerText === "TELTONIKA") {
                                    $("#rodzaj_rejestratora_id").select2('val', producent.value).trigger('change');
                                    break;
                                };
                            };

                            document.getElementById("database-config").style = "width: 260px; display: inline-block";

                            const databaseConfigs = document.getElementsByName("config_db_id")[0];

                            for (let config of databaseConfigs) {
                                if (config.innerText === "[A] gps.ze-it.pl") {
                                    $('#database-config').find('.select2-container').select2('val', config.value).trigger('change');
                                    break;
                                };
                            };

                            const blackboxType = $("#typ_rejestratora_id")[0];

                            for(let type of blackboxType) {
                                if (type.innerText === userJSON.typRejestratora) {
                                    $("#typ_rejestratora_id").select2('val', type.value).trigger('change');
                                    break;
                                };
                            };
                        };

                        //Id rejestratora
                        $('[name=dscr]').first().val(userJSON.id);
                        click('[name=rej_c]');
                    }

                    //CAN
                    const canConfig = userJSON.canConfig;
                    if(canConfig !== '') {
                        click("#can");

                        if(canConfig.canPredkosc.toLowerCase().includes("tak")) {
                            click("#spn84_c")
                            click("#spn1611_c")
                        }
                        if(canConfig.canObroty.toLowerCase().includes("tak")) click("#spn190_c")
                        if(canConfig.canDystans.toLowerCase().includes("tak")) click("#spn917_c")
                        if(canConfig.canPaliwo.toLowerCase().includes("tak")) click("#spn96_c")
                        if(canConfig.canZuzycie.toLowerCase().includes("tak")) click("#spn250_c")
                        if(canConfig.canStatusy.toLowerCase().includes("tak")) {
                            click("#spanstatus_c")
                            click("#tagid_c")
                        }

                        if(canConfig.canWebasto.toLowerCase().includes("tak")) click("#webasto_can_c")

                        //Przystawka CAN
                        let rodzajPrzystawki = (userJSON.typRejestratora === "Albatros" ? "Przystawka Canlogistic (Albatros)" : "Przystawka indukcyjna magistrali CAN");
                        addUrzadzenieDodatkoweInne(rodzajPrzystawki);
                    }

                    //D8
                    if(userJSON.d8) {
						if(userJSON.d8 === "TMR") {
							click("#tmr");
							$("#tmr_status").val(userJSON.tmrResponse);

							if(userJSON.modelTacho === "Siemens") {
								$("#tmr_model_id").select2('val', 1);
							} else if(userJSON.modelTacho === "Stonerige") {
								$("#tmr_model_id").select2('val', 2);
							}

							$("#tmr_nr_firmware").val(userJSON.wersjaTacho);
						} else {
							if(!document.getElementsByName('kabel_d8')[0].checked) {
								$("#kabel_d8").click();
							}
							if(userJSON.modelTacho === "Siemens")
								$("#kabel_d8_producent_id").select2('val', 1);
							if(userJSON.modelTacho === "Stonerige")
								$("#kabel_d8_producent_id").select2('val', 2);


                            const d8Connections = $("#kabel_d8_podlaczenie_id")[0];
                            let d8ToSelect = userJSON.d8;
                            if(userJSON.typRejestratora.substring(0,2).toLowerCase === "fm" || parseInt(userJSON.id) > 999999) d8ToSelect = 'FMB640'

							for(let connection of d8Connections) {
								if (connection.innerText === d8ToSelect) {
									$("#kabel_d8_podlaczenie_id").select2('val', connection.value).trigger('change');
									break;
								};
							};

                            click('#kabel_d8_c');
						}
                    }

                    //TachoReader
                    if(userJSON.d8 === "Tachoreader") {
                        //FMB640
                        if(userJSON.typRejestratora.substring(0,2).toLowerCase === "fm" || parseInt(userJSON.id) > 999999) {
                            click('#fmb640');
                            $("#fmb640_model_id").select2('val', (userJSON.modelTacho === "Siemens" ? 1 : 2)).trigger('change');
                            $("#fmb640_status").val('111');
                            $('#fmb640_nr_firmware').val(userJSON.wersjaTacho);

                            unClick('#tachoreader');
                        } else {
                            click('#tachoreader');
                            $("#s2id_tachoreader_model_id").select2('val', (userJSON.modelTacho === "Siemens" ? 1 : 2)).trigger('change');
                            $("#tachoreader_status").val(2);
                            $('#tachoreader_nr_firmware').val(userJSON.wersjaTacho);

                            unClick('#fmb640');
                        }
                    } else {
                        unClick('#tachoreader');
                        unClick('#fmb640');
                    }

                    //Urządzenia dodatkowe Din 1-5
                    if(userJSON.konfiguracja.toLowerCase().includes("webasto")) {
                        let webastoString = userJSON.konfiguracja.substr(userJSON.konfiguracja.indexOf('webasto')).toLowerCase();
                        const separator = webastoString.indexOf(',') === -1 ? undefined : webastoString.indexOf(',');
                        webastoString = webastoString.slice(0, separator);

                        if(webastoString.includes("can")) {
                            click("#webasto_can_c")
                        } else {
                            let webastoDin = 2;
                            for (let i = 0; i < webastoString.length; i++) {
                                if(parseInt(webastoString.charAt(i))) {
                                    webastoDin = parseInt(webastoString.charAt(i));
                                    break;
                                };
                            };

                            addUrzadzenieDodatkoweDin('Webasto', webastoDin, 'Wysoki', 'Granatowy');
                        };
                    };

					if(userJSON.konfiguracja.toLowerCase().includes("pompa")) {
                        let pompaString = userJSON.konfiguracja.substr(userJSON.konfiguracja.indexOf('pompa')).toLowerCase();
                        const separator = pompaString.indexOf(',') === -1 ? undefined : pompaString.indexOf(',');
                        pompaString = pompaString.slice(0, separator);

						let pompaDin = 5;
						for (let i = 0; i < pompaString.length; i++) {
							if(parseInt(pompaString.charAt(i))) {
								pompaDin = parseInt(pompaString.charAt(i));
								break;
							};
						};

						addUrzadzenieDodatkoweDin('Pompa', pompaDin, 'Wysoki', 'Beżowy');
                    };

                    //Urządzenia dodatkowe inne
                    if(userJSON.konfiguracja.toLowerCase().includes("rfid")) addUrzadzenieDodatkoweInne('RFID - czytnik zbliżeniowy');
                    if(userJSON.konfiguracja.toLowerCase().includes("immo")) addUrzadzenieDodatkoweInne('immobiliser');
					if(userJSON.konfiguracja.toLowerCase().includes("t8c")) addUrzadzenieDodatkoweInne('T8C - terminal mobilny');
                    if(userJSON.konfiguracja.toLowerCase().includes("tf03")) addUrzadzenieDodatkoweInne('TF03 - przystawka do paliwa');

                    if(userJSON.konfiguracja.toLowerCase().includes("tomtom")) {
                        let tomtomString = userJSON.konfiguracja.substr(userJSON.konfiguracja.indexOf('tomtom')).toLowerCase();
                        const separator = tomtomString.indexOf(',') === -1 ? undefined : tomtomString.indexOf(',');
                        tomtomString = parseInt(tomtomString.slice(tomtomString.indexOf(' '), separator));

                        addUrzadzenieDodatkoweInne('TOM-TOM');
                        if(tomtomString) document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[4].children[0].value = tomtomString;
                    }

                    //Termometry
                    if(userJSON.termometer1) {
                        $("#uwagi").val(getUwagi() + `Termometr_1: ${userJSON.termometer1}`);
                        addUrzadzenieDodatkoweInne('Termometr 1')
                    }
                    if(userJSON.termometer2) {
                        $("#uwagi").val(getUwagi() + `Termometr_2: ${userJSON.termometer2}`);
                        addUrzadzenieDodatkoweInne('Termometr 2')
                    }

                    //Sondy an0
                    if(userJSON.an0numer) {

                        if(!$('tr[data-number=1]')[0]) document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

                        const an0 = document.querySelectorAll("tr[data-number='1']")[0].children[2];
                        an0.children[0].children[2].value = userJSON.an0pojemnosc; //Pojemność
                        an0.children[1].children[2].click(); //Zaklikanie Sonda
                        an0.children[4].children[0].children[2].value = userJSON.an0skalowanie; //Skalowanie
                        an0.children[4].children[2].children[2].value = userJSON.an0numer; //Numer sondy

                        const rodzajSondyId = an0.children[4].children[1].children[2].id;
                        $(`#${rodzajSondyId}`).select2('val', 1); //Sonda Perpetuum

                        const numerWejsciaId = an0.children[6].children[0].children[2].id;
                        $(`#${numerWejsciaId}`).select2('val', 0); //An0

                        const lokalizacjaId = an0.children[6].children[1].children[2].id;
                        $(`#${lokalizacjaId}`).select2('val', (userJSON.prawyZbiornik === "An0" ? 0 : 2)); //Prawy/lewy tył

                        an0.parentElement.children[3].children[0].click(); //Zaklikaj sonde

                    }

                    //Sondy an1
                    if(userJSON.an1numer) {
                        if(!$('tr[data-number=2]')[0]) document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

                        const an1 = document.querySelectorAll("tr[data-number='2']")[0].children[2];
                        an1.children[0].children[2].value = userJSON.an1pojemnosc; //Pojemność
                        an1.children[1].children[2].click(); //Zaklikanie Sonda
                        an1.children[4].children[0].children[2].value = userJSON.an1skalowanie; //Skalowanie
                        an1.children[4].children[2].children[2].value = userJSON.an1numer; //Numer sondy

                        const rodzajSondyId = an1.children[4].children[1].children[2].id;
                        $(`#${rodzajSondyId}`).select2('val', 1); //Sonda Perpetuum

                        const numerWejsciaId = an1.children[6].children[0].children[2].id;
                        $(`#${numerWejsciaId}`).select2('val', 1); //An1

                        const lokalizacjaId = an1.children[6].children[1].children[2].id;
                        $(`#${lokalizacjaId}`).select2('val', (userJSON.prawyZbiornik === "An1" ? 0 : 2)); //Prawy/lewy tył

                        an1.parentElement.children[3].children[0].click(); //Zaklikaj sonde
                    }

                    //Zaklikaj pojemność CAN
                    if(!userJSON.an0numer && !userJSON.an1numer) $('[name=spn96_amount]').val(+userJSON.an0pojemnosc + +userJSON.an1pojemnosc);

                    //Informacje końcowe
                    $('[name=miejsce_rejestratora]').val(userJSON.gdzieRejestrator || ".");
                    $('[name=stan_licznika]').val(userJSON.przebieg || ".");

                    //Monter
                    const monterzy = $("#wykonal")[0];
                    for(let monter of monterzy) {
                        if (monter.innerText === userJSON.monter) {
                            $("#wykonal").select2('val', monter.value).trigger("change");
                            break;
                        }
                    }

                    //Data i czas
                    $("#kiedy2").val(userJSON.date);
                    $("#kiedy2hour").select2('val', userJSON.godzina).trigger('change');
                    $("#kiedy2minute").select2('val', userJSON.minuta).trigger('change');

                    //Uwagi
                    $("#uwagi").val(`${getUwagi()}${userJSON.czynnosci}${(userJSON.czynnosci ? '\n\n' : '')}${userJSON.konfiguracja}`.trim());

                } catch (error) {
                    alert(error.message);
                    console.log(error);
                } finally {
                    $loader.hide();
                }
            }, 0);
        };

		function addUrzadzenieDodatkoweDin(urzadzenie, din, stan, color) {
			//Sprawdź czy nie ma takiego urządzenia
			let deviceExists = false;
			let newDeviceId = "";
			const addedDevices = document.getElementsByClassName('din_tr');
			for(let addedDevice of addedDevices) {
				if(addedDevice.children[1].children[0].children[0].children[0].innerText.toLowerCase() === urzadzenie.toLowerCase()) {
					deviceExists = true;
					newDeviceId = addedDevice.children[1].children[0].id;
					break;
				}
			}

			if(!deviceExists) {
				document.getElementsByClassName("din plus fl-tipsy-bottom-right")[0].click();

				newDeviceId = document.getElementsByClassName("dino-section header-title")[0].previousElementSibling.children[1].children[0].id;
				const devices = $(`#${newDeviceId}`)[0].nextSibling;

				for(let device of devices) {
					if (device.innerText === urzadzenie) {
						$(`#${newDeviceId}`).next().select2('val', device.value).trigger('change');
						break;
					};
				};
				const newCanTr = document.getElementsByClassName("active added din_tr");
				newCanTr[newCanTr.length - 1].classList.add("bad");
			};

				const newDinTr = $(`#${newDeviceId}`)[0].parentNode.nextSibling.nextSibling;

			//nr wejscia
			newDinTr.children[0].children[2].value = din;

			//stan
			$(`#${newDinTr.children[1].children[2].id}`).select2('val', (stan === 'Wysoki' ? 1 : 0));

			//kolor

				const dinColors = $(`#${newDinTr.children[2].children[2].id}`)[0].nextSibling;

                for (let itemColor of dinColors) {
                    if (itemColor.innerText === color) {
                        $(`#${newDinTr.children[2].children[2].id}`).select2('val', itemColor.value).trigger('change');
                        break;
                    };
                };
		};

		function addUrzadzenieDodatkoweInne(urzadzenie) {
			//Sprawdź czy nie ma już takiego urządzenia w protokole
			const addedDevices = document.getElementsByClassName('active dino_tr');
			for(let device of addedDevices) {
				if(device.children[2].children[0].children[0].children[0].innerText.toLowerCase() === urzadzenie.toLowerCase()) {
					return;
				}
			}

			//Jak nie ma to doklikaj
			document.getElementsByClassName("dino plus fl-tipsy-bottom-right")[0].click();

            const newDeviceId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
            const devices = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

            let deviceWasFound = false;
            for(let device of devices) {
                if (device.innerText.toLowerCase() === urzadzenie.toLowerCase()) {
                    $(`#${newDeviceId}`).next().select2('val', device.value).trigger('change');
                    deviceWasFound = true;
                    break;
                };
            };

            if(!deviceWasFound) {
                $('.odd.active.added.dino_tr').first().remove();
                return
            }

            const newCanTr = document.getElementsByClassName("active added dino_tr");
            newCanTr[newCanTr.length - 1].classList.add("bad");
		}

		async function isInvoiceActiveOnAnotherVehicle(id) {
            const baseUrl = `/api/invoice/vehicle?current_page=1&current_limit=10&form_action=search&form_search=${id}&form_filter=filter_enabled%3D1%26firma1_id%3D%26company_user_vehicle_groups%3D%26status_sim%3D1%26mapa_typ%3D0%26table_calendar_input%3D%26table_calendar_input2%3D%26table_calendar_input3%3D%26table_calendar_input4%3D%26table_calendar_input5%3D%26table_calendar_input6%3D&mod-sidemenu-val=`
            await fetch(baseUrl)
				.then(res => {
					res.text()
						.then(res => {
						let editedResponse = res.slice(res.indexOf('<tbody>'), res.indexOf('</tbody>') + 8 );

						if(editedResponse.includes(`<td class="datatable_dscr  " style="width:100px; text-align:left;" value="">


																														${id}
			</td>`)) {
							alert('Rejestrator może posiadać aktywny MFV. Sprawdź, czy to na pewno nowy montaż.');
						};
					});
				});
        };

        function getUwagi() {
            const uwagi = $("#uwagi").val();

            return uwagi.length ? `${uwagi}\n\n` : ""
        }

        ////////////////////////////////////////////////////////////////////////////////////////////

		function click(element) {
			if(!$(element)[0].checked) $(element).click();
        }

        function unClick(element) {
			if($(element)[0].checked) $(element).click();
        }

    }
})();