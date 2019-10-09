// ==UserScript==
// @name         Wypełnianie protokołu montażowego
// @namespace    https://github.com/MarcinCzajka
// @version      4.14
// @description  try to take over the world!
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include */api/installation*
// @exclude */api/installation/main/index/*
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

        ///////////////////////////////////////////////////////////////////////////

        function fillProtocol() {
            $loader.show();
			
			const alertDiv = document.createElement('h1');
				alertDiv.innerText = "";
				alertDiv.id = "alertDiv";
				alertDiv.style = 'position:fixed;top:55%;z-index:100002;width:100%;text-align:center;';
			document.getElementById('loader').appendChild(alertDiv);

            setTimeout(() => {
                try {

                    const userJSON = JSON.parse(document.getElementById("myTextbox").value);

                    //Wybranie firmy
                    const companies = document.getElementById("firma1_id");
                    for(let company of companies) {
                        if (company.innerText === (userJSON.firma === "KIM JOHANSEN KJ" ? "KIM" : userJSON.firma)) {
                            $('#firma1_id').select2('val', company.value).trigger('change');
                            break;
                        };
                    };
 
                    const vehicleGroups = document.getElementById("grupa_pojazdow_id");
                    const vehicleGroupNames = ['wszystkie', 'alle', 'kim', 'todos vehiculos'];
                    for(let group of vehicleGroups) {
                        if (vehicleGroupNames.indexOf(group.innerText.toLowerCase())) {
                            $('#s2id_grupa_pojazdow_id').select2('val', group.value).trigger('change');
                            break;
                        };
                    };

                    //Kategoria montażu i monter
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
                    } else if(userJSON.type.includes("Przekładka")) {
						alertDiv.innerText = "Szukam pojazdu z którego jest przekładka. Może to chwilę potrwać.";
						
                        $("#type_id").select2('val', 3).trigger('change');

                        const rejPrzekladka = userJSON.type.replace('Przekładka z ', '').toLowerCase();

                        const pojazdyArch = $('#old_reg_number')[0];

                        for(let arch of pojazdyArch) {
							if (arch.innerText.toLowerCase().indexOf(rejPrzekladka) > -1) {
								$('#old_reg_number').select2('val', arch.value).trigger('change');
								break;
							};
						};
						
						alertDiv.innerText = "";
						document.getElementById('alertDiv').innerText = "fallback text";
                    };

                    //Nr rejestracyjny
                    if(userJSON.rej) $("#nr_rejestracyjny").val(userJSON.rej);
                    if(userJSON.boczny) $("#nr_boczny_pojazdu").val(userJSON.boczny);

                    // Marka/model
                    const trucksArray = ['DAF', 'IVECO', 'MAN', 'MERCEDES', 'RENAULT', 'SCANIA', 'VOLVO']
                    if(trucksArray.indexOf(userJSON.marka) > -1) {
                        $("#s2id_vehicle_type_id").select2("val", 1);
                    }

                    const vehicleBrands = $("#marka_id")[0];
                    for(let brand of vehicleBrands) {
                        if (brand.innerText.toLowerCase() === userJSON.marka.toLowerCase()) {
                            $("#marka_id").select2('val', brand.value).trigger("change");
                            break;
                        };
                    };

                    document.getElementsByName('model')[0].value = userJSON.model;

                    //Nr SIM
                    document.getElementsByName('nr_karty_sim')[0].value = userJSON.sim;

                    //Podłączenia
                    //Rejestrator
                    if(!document.getElementsByName('rej')[0].checked) {
                        document.getElementsByName('rej')[0].click();
                    }


                    //Typ rejestratora
					if(userJSON.id.substring(0,1).toLowerCase() === 'h' && !userJSON.typRejestratora) userJSON.typRejestratora = "SE5";
                    //Skaut
                    if(userJSON.typRejestratora.substring(0, 2) === "SE") {
                        const blackboxBrands = $("#rodzaj_rejestratora_id")[0];
                        for(let brand of blackboxBrands) {
                            if (brand.innerText === "Setivo") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', brand.value).trigger('change.select2');
                                break;
                            };
                        };

                        //Baza odczytów
                        document.getElementById("database-config").style = "width: 260px; display: inline-block";

                        const databaseConfigs = document.getElementsByName("config_db_id")[0];

                        for(let config of databaseConfigs) {
                            if (config.innerText === "[A] gps.ze-it.pl") {
                                $("#s2id_autogen17").select2('val', config.value).trigger('change.select2');
                                break;
                            };
                        };

                        //Typ rejestratora
                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let type of blackboxType) {
                            if (type.innerText === userJSON.typRejestratora) {
                                $("#s2id_typ_rejestratora_id").select2('val', type.value).trigger('change.select2');
                                break;
                            };
                        }
                    } else if(userJSON.typRejestratora === "Albatros" || (parseInt(userJSON.id) > 99999 && parseInt(userJSON.id) < 999999)) {
                        const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                        for(let producent of blackboxProducent) {
                            if (producent.innerText === "Albatros") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', producent.value).trigger('change.select2');
                                break;
                            };
                        };

                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let type of blackboxType) {
                            if (type.innerText === "Albatros 8.5") {
                                $("#s2id_typ_rejestratora_id").select2('val', type.value).trigger('change.select2');
                                break;
                            };
                        };


                    } else if (userJSON.typRejestratora === "Teltonika" || parseInt(userJSON.id) > 999999) {
                        const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                        for(let producent of blackboxProducent) {
                            if (producent.innerText === "TELTONIKA") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', producent.value).trigger('change.select2');
                                break;
                            };
                        };

                        document.getElementById("database-config").style = "width: 260px; display: inline-block";

                        const databaseConfigs = document.getElementsByName("config_db_id")[0];

                        for (let config of databaseConfigs) {
                            if (config.innerText === "[A] gps.ze-it.pl") {
                                $("#s2id_autogen17").select2('val', config.value).trigger('change.select2');
                                break;
                            };
                        };

                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let type of blackboxType) {
                            if (type.innerText === "FMB120") {
                                $("#s2id_typ_rejestratora_id").select2('val', type.value).trigger('change.select2');
                                break;
                            };
                        };
                    };

                    //Id rejestratora
                    document.getElementsByName('dscr')[0].value = userJSON.id;

                    if(!document.getElementsByName('rej_c')[0].checked) {
                        document.getElementsByName('rej_c')[0].click();
                    }

                    //CAN
                    const canConfig = userJSON.canConfig;
                    click("#can");
                    if(canConfig) {
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
							for(let connection of d8Connections) {
								if (connection.innerText === userJSON.d8) {
									$("#s2id_kabel_d8_podlaczenie_id").select2('val', connection.value).trigger('change.select2');
									break;
								};
							};

							if(!document.getElementsByName('kabel_d8_c')[0].checked) {
								$("#kabel_d8_c").click();
							}
						}
                    }

                    //TachoReader
                    if(userJSON.d8 === "Tachoreader") {
                        if(!document.getElementsByName('tachoreader')[0].checked) {
                            $("#tachoreader").click();
                        }

                        if(userJSON.modelTacho === "Siemens")
                            $("#s2id_tachoreader_model_id").select2('val', 1);
                        if(userJSON.modelTacho === "Stonerige")
                            $("#s2id_tachoreader_model_id").select2('val', 2);

                        $("#tachoreader_status").val(2);

                        document.getElementById("tachoreader_nr_firmware").value = userJSON.wersjaTacho;
                    }

                    //Przystawka CAN
                    document.getElementsByClassName("dino plus fl-tipsy-bottom-right")[0].click();

                    const newDeviceId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
                    const devices = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

                    let rodzajPrzystawki = "Przystawka indukcyjna magistrali CAN";
                    //Jeżeli albatros to CanLogistic
                    if(userJSON.typRejestratora === "Albatros") rodzajPrzystawki = "Przystawka Canlogistic (Albatros)";

                    for(let device of devices) {
                        if (device.innerText === rodzajPrzystawki || device.innerText === "safeCAN - CanClick") {
                            $(`#${newDeviceId}`).select2('val', device.value).trigger('change.select2');
                            break;
                        };
                    };

                    const newCanTr = document.getElementsByClassName("active added dino_tr");

                    newCanTr[newCanTr.length - 1].classList.add("bad");

                    //Urządzenia dodatkowe Din 1-5
                    if(userJSON.konfiguracja.toLowerCase().includes("webasto")) {
                        let webastoString = userJSON.konfiguracja.substr(userJSON.konfiguracja.indexOf('webasto')).toLowerCase();
                        webastoString = webastoString.substr(0, webastoString.indexOf(','));

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
                        pompaString = pompaString.substr(0, pompaString.indexOf(','));

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
					if(userJSON.konfiguracja.toLowerCase().includes("tomtom")) addUrzadzenieDodatkoweInne('TOM-TOM');
					
                    //Sondy an0
                    if(userJSON.an0numer) {
                        document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

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
                        document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

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

                    //Informacje końcowe
                    document.getElementsByName("miejsce_rejestratora")[0].value = userJSON.gdzieRejestrator || ".";
                    document.getElementsByName("stan_licznika")[0].value = userJSON.przebieg || ".";

                    //Monter
                    const monterzy = $("#wykonal")[0];
                    for(let monter of monterzy) {
                        if (monter.innerText === userJSON.monter) {
                            $("#s2id_wykonal").select2('val', monter.value).trigger("change");
                            break;
                        }
                    }

                    //Data i czas
                    $("#kiedy2").val(userJSON.date);
                    $("#s2id_kiedy2hour").select2('val', userJSON.godzina).trigger('change.select2');
                    $("#s2id_kiedy2minute").select2('val', userJSON.minuta).trigger('change.select2');


                    //Uwagi
                    $("#uwagi").val(`${userJSON.czynnosci}${(userJSON.czynnosci ? '\n\n' : '')}${userJSON.konfiguracja}`);

                } catch (error) {
                    alert(error.message);
                    console.log(error);
                } finally {
                    $loader.hide();
                }
            }, 0);
        };
		
		function addUrzadzenieDodatkoweDin(urzadzenie, din, stan, color) {
			document.getElementsByClassName("din plus fl-tipsy-bottom-right")[0].click();

            const newDeviceId = document.getElementsByClassName("dino-section header-title")[0].previousElementSibling.children[1].children[0].id;
			const devices = $(`#${newDeviceId}`)[0].nextSibling;

            for(let device of devices) {
                if (device.innerText === urzadzenie) {
                    $(`#${newDeviceId}`).next().select2('val', device.value).trigger('change');
                    break;
                };
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
                        $(`#${newDinTr.children[2].children[2].id}`).select2('val', itemColor.value).trigger('change.select2');
                        break;
                    };
                };

            const newCanTr = document.getElementsByClassName("active added din_tr");
            newCanTr[newCanTr.length - 1].classList.add("bad");
		}
		
		function addUrzadzenieDodatkoweInne(urzadzenie) {
			document.getElementsByClassName("dino plus fl-tipsy-bottom-right")[0].click();

            const newDeviceId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
            const devices = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

            for(let device of devices) {
                if (device.innerText.toLowerCase() === urzadzenie.toLowerCase()) {
                    $(`#${newDeviceId}`).next().select2('val', device.value).trigger('change');
                    break;
                };
            };

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
		


        ////////////////////////////////////////////////////////////////////////////////////////////
		
		function click(element) {
			if(!$(element)[0].checked) $(element).click();
    }

    }
})();