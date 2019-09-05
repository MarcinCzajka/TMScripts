// ==UserScript==
// @name         Wypełnianie protokołu montażowego
// @namespace    https://github.com/MarcinCzajka
// @version      3.13
// @description  try to take over the world!
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include */api/installation*
// @exclude */api/installation/main/index/*
// ==/UserScript==

(function() {
    'use strict';
	//2019-08-28

    const headerCaption = document.getElementById('bottom_header').children[1].children[0].innerText;
    if(headerCaption.includes("Protokół montażowy") && document.getElementById("take-trigger")) {


        const myTextbox = document.createElement("div");
        myTextbox.innerHTML = '<div style="width:100%"><input type="text" id="myTextbox" style="width:100%"><button id="newButton">Wypełnij protokół</button></div>';

        document.getElementById("header").appendChild(myTextbox);

        document.getElementById("newButton").addEventListener('click', fillProtocol);
		

        ///////////////////////////////////////////////////////////////////////////

        function fillProtocol() {
            $loader.show();

            setTimeout(() => {
                try {

                    const userJSON = JSON.parse(document.getElementById("myTextbox").value);

                    //Wybranie firmy
                    const firmy = document.getElementById("firma1_id");
                    for(let i = 0; i < firmy.length; i++) {
                        if(firmy[i].innerText === userJSON.firma) {
                            $('#firma1_id').select2('val', firmy[i].value).trigger('change');
                            break;
                        };
                    };
                    const grupyPojazdow = document.getElementById("grupa_pojazdow_id");

                    for(let i = 0; i < grupyPojazdow.length; i++) {
                        if(grupyPojazdow[i].innerText.toLowerCase() === 'wszystkie') {
                            $('#s2id_grupa_pojazdow_id').select2('val', grupyPojazdow[i].value).trigger('change');
                            break;
                        };
                    };

                    //Kategoria montażu i monter
                    if(userJSON.monter === "Monter klienta" || !userJSON.monter) {
                        $("#s2id_kategoria_id").select2('val', 2);
                    }
                    else {
                        $("#s2id_kategoria_id").select2('val', 1);
                    }

                    if(userJSON.type === "Montaż") {
                        $("#type_id").select2('val', 1).trigger('change');
                    } else if(userJSON.type === "Upgrade") {
                        $("#type_id").select2('val', 2).trigger('change');
                    } else if(userJSON.type.includes("Przekładka")) {
                        $("#type_id").select2('val', 3).trigger('change');
                    }

                    //Nr rejestracyjny
                    if(userJSON.rej) $("#nr_rejestracyjny").val(userJSON.rej);
                    if(userJSON.boczny) $("#nr_boczny_pojazdu").val(userJSON.boczny);

                    // Marka/model
                    const trucksArray = ['DAF', 'IVECO', 'MAN', 'MERCEDES', 'RENAULT', 'SCANIA', 'VOLVO']
                    if(trucksArray.indexOf(userJSON.marka) > -1) {
                        $("#s2id_vehicle_type_id").select2("val", 1);
                    }

                    const vehicleBrands = $("#marka_id")[0];
                    for(let i = 0; i < vehicleBrands.length; i++) {
                        if(vehicleBrands[i].innerText.toLowerCase() === userJSON.marka.toLowerCase()) {
                            $("#marka_id").select2('val', vehicleBrands[i].value).trigger("change");
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
                    //Skaut
                    if(userJSON.typRejestratora.substring(0, 2) === "SE") {
                        const blackboxBrands = $("#rodzaj_rejestratora_id")[0];
                        for(let i = 0; i < blackboxBrands.length; i++) {
                            if(blackboxBrands[i].innerText === "Setivo") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', blackboxBrands[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        //Baza odczytów
                        document.getElementById("database-config").style = "width: 260px; display: inline-block";

                        const databaseConfigs = document.getElementsByName("config_db_id")[0];

                        for(let i = 0; i < databaseConfigs.length; i++) {
                            if(databaseConfigs[i].innerText === "[A] gps.ze-it.pl") {
                                $("#s2id_autogen17").select2('val', databaseConfigs[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        //Typ rejestratora
                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let i = 0; i < blackboxType.length; i++) {
                            if(blackboxType[i].innerText === userJSON.typRejestratora) {
                                $("#s2id_typ_rejestratora_id").select2('val', blackboxType[i].value).trigger('change.select2');
                                break;
                            };
                        }
                    } else if(userJSON.typRejestratora === "Albatros" || (parseInt(userJSON.id) > 99999 && parseInt(userJSON.id) < 999999)) {
                        const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                        for(let i = 0; i < blackboxProducent.length; i++) {
                            if(blackboxProducent[i].innerText === "Albatros") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', blackboxProducent[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let i = 0; i < blackboxType.length; i++) {
                            if(blackboxType[i].innerText === "Albatros 8.5") {
                                $("#s2id_typ_rejestratora_id").select2('val', blackboxType[i].value).trigger('change.select2');
                                break;
                            };
                        };


                    } else if (userJSON.typRejestratora === "Teltonika") {
                        const blackboxProducent = $("#rodzaj_rejestratora_id")[0];

                        for(let i = 0; i < blackboxProducent.length; i++) {
                            if(blackboxProducent[i].innerText === "TELTONIKA") {
                                $("#s2id_rodzaj_rejestratora_id").select2('val', blackboxProducent[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        document.getElementById("database-config").style = "width: 260px; display: inline-block";

                        const database = document.getElementsByName("config_db_id")[0];

                        for(let i = 0; i < database.length; i++) {
                            if(database[i].innerText === "[A] gps.ze-it.pl") {
                                $("#s2id_autogen17").select2('val', database[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        const blackboxType = $("#typ_rejestratora_id")[0];

                        for(let i = 0; i < blackboxType.length; i++) {
                            if(blackboxType[i].innerText === "FMB120") {
                                $("#s2id_typ_rejestratora_id").select2('val', blackboxType[i].value).trigger('change.select2');
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
                        if(!document.getElementsByName('kabel_d8')[0].checked) {
                            $("#kabel_d8").click();
                        }
                        if(userJSON.modelTacho === "Siemens")
                            $("#kabel_d8_producent_id").select2('val', 1);
                        if(userJSON.modelTacho === "Stonerige")
                            $("#kabel_d8_producent_id").select2('val', 2);


                        const d8Connections = $("#kabel_d8_podlaczenie_id")[0];
                        for(let i = 0; i < d8Connections.length; i++) {
                            if(d8Connections[i].innerText === userJSON.d8) {
                                $("#s2id_kabel_d8_podlaczenie_id").select2('val', d8Connections[i].value).trigger('change.select2');
                                break;
                            };
                        };

                        if(!document.getElementsByName('kabel_d8_c')[0].checked) {
                            $("#kabel_d8_c").click();
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

                    const noweUrzadzenieId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
                    const urzadzenia = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

                    let rodzajPrzystawki = "Przystawka indukcyjna magistrali CAN";
                    //Jeżeli albatros to CanLogistic
                    if(userJSON.typRejestratora === "Albatros") rodzajPrzystawki = "Przystawka Canlogistic (Albatros)";

                    for(let i = 0; i < urzadzenia.length; i++) {
                        if(urzadzenia[i].innerText === rodzajPrzystawki || urzadzenia[i].innerText === "safeCAN - CanClick") {
                            $(`#${noweUrzadzenieId}`).select2('val', urzadzenia[i].value).trigger('change.select2');
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

                    //Urządzenia dodatkowe inne
                    if(userJSON.konfiguracja.toLowerCase().includes("rfid")) addUrzadzenieDodatkoweInne('RFID - czytnik zbliżeniowy');
                    if(userJSON.konfiguracja.toLowerCase().includes("immo")) addUrzadzenieDodatkoweInne('immobiliser');

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
                    for(let i = 0; i < monterzy.length; i++) {
                        if(monterzy[i].innerText === userJSON.monter) {
                            $("#s2id_wykonal").select2('val', monterzy[i].value).trigger("change");
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
		
		function addUrzadzenieDodatkoweDin(urzadzenie, din, stan, kolor) {
			document.getElementsByClassName("din plus fl-tipsy-bottom-right")[0].click();

            const noweUrzadzenieId = document.getElementsByClassName("dino-section header-title")[0].previousElementSibling.children[1].children[0].id;
			const urzadzenia = $(`#${noweUrzadzenieId}`)[0].nextSibling;

            for(let i = 0; i < urzadzenia.length; i++) {
                if(urzadzenia[i].innerText === urzadzenie) {
                    $(`#${noweUrzadzenieId}`).select2('val', urzadzenia[i].value).trigger('change.select2');
                    break;
                };
            };
			
			const newDinTr = $(`#${noweUrzadzenieId}`)[0].parentNode.nextSibling.nextSibling;
			
			//nr wejscia
			newDinTr.children[0].children[2].value = din;
			
			//stan
			$(`#${newDinTr.children[1].children[2].id}`).select2('val', (stan === 'Wysoki' ? 1 : 0));
			
			//kolor
				
				const dinKolory = $(`#${newDinTr.children[2].children[2].id}`)[0].nextSibling;

                for(let i = 0; i < dinKolory.length; i++) {
                    if(dinKolory[i].innerText === kolor) {
                        $(`#${newDinTr.children[2].children[2].id}`).select2('val', dinKolory[i].value).trigger('change.select2');
                        break;
                    };
                };

            const newCanTr = document.getElementsByClassName("active added din_tr");
            newCanTr[newCanTr.length - 1].classList.add("bad");
		}
		
		function addUrzadzenieDodatkoweInne(urzadzenie) {
			document.getElementsByClassName("dino plus fl-tipsy-bottom-right")[0].click();

            const noweUrzadzenieId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
            const urzadzenia = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

            for(let i = 0; i < urzadzenia.length; i++) {
                if(urzadzenia[i].innerText.toLowerCase() === urzadzenie) {
                    $(`#${noweUrzadzenieId}`).select2('val', urzadzenia[i].value).trigger('change.select2');
                    break;
                };
            };

            const newCanTr = document.getElementsByClassName("active added dino_tr");
            newCanTr[newCanTr.length - 1].classList.add("bad");
		}
		


        ////////////////////////////////////////////////////////////////////////////////////////////
		
		function click(element) {
			if(!$(element)[0].checked) $(element).click();
    }

    }
})();