// ==UserScript==
// @name         Wypełnianie protokołu montażowego
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       MAC
// @match        http://*/api/installation*
// @grant        none
// @include */api/installation*
// @exclude */api/installation/main/index/*
// ==/UserScript==

(function() {
    'use strict';

    const headerString = document.getElementById('bottom_header').children[1].children[0].innerText;
    if(headerString.includes("Protokół montażowy") && document.getElementById("take-trigger")) {


        const newTextbox = document.createElement("div");
        newTextbox.innerHTML = '<div style="width:100%"><input type="text" id="newTextbox" style="width:100%"><button id="newButton">Wypełnij protokół</button></div>';

        document.getElementById("header").appendChild(newTextbox);

        document.getElementById("newButton").addEventListener('click', fillProtocol);

        ///////////////////////////////////////////////////////////////////////////

        function fillProtocol() {
            const textbox = JSON.parse(document.getElementById("newTextbox").value);

            //Kategoria montażu i monter
            if(textbox.monter === "Klienta" || !textbox.monter) {
                $("#s2id_kategoria_id").select2('val', 2);
            }
            else {
                $("#s2id_kategoria_id").select2('val', 1);
            }

            if(textbox.type === "Montaż") {
                $("#s2id_type_id").select2('val', 1);
            } else if(textbox.type === "Upgrade") {
                $("#s2id_type_id").select2('val', 2);
            }

            //Nr rejestracyjny
            if(textbox.rej) $("#nr_rejestracyjny").val(textbox.rej);
            if(textbox.boczny) $("#nr_boczny_pojazdu").val(textbox.boczny);

            // Marka/model
            $("#s2id_vehicle_type_id").select2("val", 1);

            const marka = $("#marka_id")[0];

            for(let i = 0; i < marka.length; i++) {
                if(marka[i].innerText.toLowerCase() === textbox.marka.toLowerCase()) {
                    $("#marka_id").select2('val', marka[i].value).trigger("change");
                    break;
                };
            };

            document.getElementsByName('model')[0].value = textbox.model;

            //Nr SIM
            document.getElementsByName('nr_karty_sim')[0].value = textbox.sim;

            //Podłączenia
            //Rejestrator
            if(!document.getElementsByName('rej')[0].checked) {
                document.getElementsByName('rej')[0].click();
            }


            //Typ rejestratora
            //Skaut
            if(textbox.typRejestratora.substring(0, 2) === "SE") {
                const rodzajeRejestratora = $("#rodzaj_rejestratora_id")[0];

                for(let i = 0; i < rodzajeRejestratora.length; i++) {
                    if(rodzajeRejestratora[i].innerText === "Setivo") {
                        $("#s2id_rodzaj_rejestratora_id").select2('val', rodzajeRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                };
                //Baza odczytów
                document.getElementById("database-config").style = "width: 260px; display: inline-block";

                const baza = document.getElementsByName("config_db_id")[0];

                for(let i = 0; i < baza.length; i++) {
                    if(baza[i].innerText === "[A] gps.ze-it.pl") {
                        $("#s2id_autogen17").select2('val', baza[i].value).trigger('change.select2');
                        break;
                    };
                };

                //Typ rejestratora
                const typRejestratora = $("#typ_rejestratora_id")[0];

                for(let i = 0; i < typRejestratora.length; i++) {
                    if(typRejestratora[i].innerText === textbox.typRejestratora) {
                        $("#s2id_typ_rejestratora_id").select2('val', typRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                }
            } else if(textbox.typRejestratora === "Albatros") {
                const rodzajeRejestratora = $("#rodzaj_rejestratora_id")[0];

                for(let i = 0; i < rodzajeRejestratora.length; i++) {
                    if(rodzajeRejestratora[i].innerText === "Albatros") {
                        $("#s2id_rodzaj_rejestratora_id").select2('val', rodzajeRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                };

                const typRejestratora = $("#typ_rejestratora_id")[0];

                for(let i = 0; i < typRejestratora.length; i++) {
                    if(typRejestratora[i].innerText === "Albatros 8.5") {
                        $("#s2id_typ_rejestratora_id").select2('val', typRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                };


            } else if (textbox.typRejestratora === "Teltonika") {
                const rodzajeRejestratora = $("#rodzaj_rejestratora_id")[0];

                for(let i = 0; i < rodzajeRejestratora.length; i++) {
                    if(rodzajeRejestratora[i].innerText === "TELTONIKA") {
                        $("#s2id_rodzaj_rejestratora_id").select2('val', rodzajeRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                };

                document.getElementById("database-config").style = "width: 260px; display: inline-block";

                const baza = document.getElementsByName("config_db_id")[0];

                for(let i = 0; i < baza.length; i++) {
                    if(baza[i].innerText === "[A] gps.ze-it.pl") {
                        $("#s2id_autogen17").select2('val', baza[i].value).trigger('change.select2');
                        break;
                    };
                };

                const typRejestratora = $("#typ_rejestratora_id")[0];

                for(let i = 0; i < typRejestratora.length; i++) {
                    if(typRejestratora[i].innerText === "FMB120") {
                        $("#s2id_typ_rejestratora_id").select2('val', typRejestratora[i].value).trigger('change.select2');
                        break;
                    };
                };
            };

            document.getElementsByName('dscr')[0].value = textbox.id;

            if(!document.getElementsByName('rej_c')[0].checked) {
                document.getElementsByName('rej_c')[0].click();
            }

            //CAN
            if(!document.getElementById('can').checked) {
                $("#can").click();
            }

            //D8
            if(textbox.d8) {
                if(!document.getElementsByName('kabel_d8')[0].checked) {
                    $("#kabel_d8").click();
                }
                if(textbox.modelTacho === "Siemens")
                    $("#kabel_d8_producent_id").select2('val', 1);
                if(textbox.modelTacho === "Stonerige")
                    $("#kabel_d8_producent_id").select2('val', 2);


                const rodzajeD8 = $("#kabel_d8_podlaczenie_id")[0];
                for(let i = 0; i < rodzajeD8.length; i++) {
                    if(rodzajeD8[i].innerText === textbox.d8) {
                        $("#s2id_kabel_d8_podlaczenie_id").select2('val', rodzajeD8[i].value).trigger('change.select2');
                        break;
                    };
                };

                if(!document.getElementsByName('kabel_d8_c')[0].checked) {
                    $("#kabel_d8_c").click();
                }

            }

            //TachoReader
            if(textbox.d8 === "Tachoreader") {
                if(!document.getElementsByName('tachoreader')[0].checked) {
                    $("#tachoreader").click();
                }

                if(textbox.modelTacho === "Siemens")
                    $("#s2id_tachoreader_model_id").select2('val', 1);
                if(textbox.modelTacho === "Stonerige")
                    $("#s2id_tachoreader_model_id").select2('val', 2);

                $("#tachoreader_status").val(2);

                document.getElementById("tachoreader_nr_firmware").value = textbox.wersjaTacho;
            }

            //Przystawka CAN

            document.getElementsByClassName("dino plus fl-tipsy-bottom-right")[0].click();

            const noweUrzadzenieId = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[0].id;
            const urzadzenia = document.getElementsByClassName("activities-section header-title")[0].previousElementSibling.children[2].children[1];

            let rodzajPrzystawki = "Przystawka indukcyjna magistrali CAN";

            /*if(textbox.marka.toLowerCase === "mercedes") {
                if(textbox.model.toLowerCase().contains("actros") || textbox.model.toLowerCase().contains("mp")) {
                    //rodzajPrzystawki = "Przystawka pasywna" ??
                };
            };*/

            for(let i = 0; i < urzadzenia.length; i++) {
                if(urzadzenia[i].innerText === rodzajPrzystawki || urzadzenia[i].innerText === "safeCAN - CanClick") {
                    $(`#${noweUrzadzenieId}`).select2('val', urzadzenia[i].value).trigger('change.select2');
                    break;
                };
            };

            const newCanTr = document.getElementsByClassName("odd active added dino_tr");

            newCanTr[newCanTr.length - 1].classList.add("bad");

            //Sondy an0
            if(textbox.an0numer) {
                document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

                const an0 = document.querySelectorAll("tr[data-number='1']")[0].children[2];
                an0.children[0].children[2].value = textbox.an0pojemnosc; //Pojemność
                an0.children[1].children[2].click(); //Zaklikanie Sonda
                an0.children[4].children[0].children[2].value = textbox.an0skalowanie; //Skalowanie
                an0.children[4].children[2].children[2].value = textbox.an0numer; //Numer sondy

                const rodzajSondyId = an0.children[4].children[1].children[2].id;
                $(`#${rodzajSondyId}`).select2('val', 1); //Sonda Perpetuum

                const numerWejsciaId = an0.children[6].children[0].children[2].id;
                $(`#${numerWejsciaId}`).select2('val', 0); //An0

                const lokalizacjaId = an0.children[6].children[1].children[2].id;
                $(`#${lokalizacjaId}`).select2('val', (textbox.prawyZbiornik === "An0" ? 0 : 2)); //Prawy/lewy tył

                an0.parentElement.children[3].children[0].click(); //Zaklikaj sonde

            }

            //Sondy an1
            if(textbox.an1numer) {
                document.getElementsByClassName("tanks plus fl-tipsy-bottom-right")[0].click()

                const an1 = document.querySelectorAll("tr[data-number='2']")[0].children[2];
                an1.children[0].children[2].value = textbox.an1pojemnosc; //Pojemność
                an1.children[1].children[2].click(); //Zaklikanie Sonda
                an1.children[4].children[0].children[2].value = textbox.an1skalowanie; //Skalowanie
                an1.children[4].children[2].children[2].value = textbox.an1numer; //Numer sondy

                const rodzajSondyId = an1.children[4].children[1].children[2].id;
                $(`#${rodzajSondyId}`).select2('val', 1); //Sonda Perpetuum

                const numerWejsciaId = an1.children[6].children[0].children[2].id;
                $(`#${numerWejsciaId}`).select2('val', 1); //An1

                const lokalizacjaId = an1.children[6].children[1].children[2].id;
                $(`#${lokalizacjaId}`).select2('val', (textbox.prawyZbiornik === "An1" ? 0 : 2)); //Prawy/lewy tył

                an1.parentElement.children[3].children[0].click(); //Zaklikaj sonde
            }

            //Informacje końcowe
            document.getElementsByName("miejsce_rejestratora")[0].value = textbox.gdzieRejestrator || ".";
            document.getElementsByName("stan_licznika")[0].value = textbox.przebieg || ".";

            //Monter
            const monterzy = $("#wykonal")[0];
            for(let i = 0; i < monterzy.length; i++) {
                if(monterzy[i].innerText === textbox.monter) {
                    $("#s2id_wykonal").select2('val', monterzy[i].value).trigger("change");
                    break;
                }
            }

            //Data i czas
            $("#kiedy2").val(textbox.date);
            $("#s2id_kiedy2hour").select2('val', textbox.godzina).trigger('change.select2');
            $("#s2id_kiedy2minute").select2('val', textbox.minuta).trigger('change.select2');


            //Uwagi
            $("#uwagi").val(`${textbox.czynnosci}${(textbox.czynnosci ? '\n\n' : '')}${textbox.konfiguracja}`);

        };


        ////////////////////////////////////////////////////////////////////////////////////////////

    }
})();