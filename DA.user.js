// ==UserScript==
// @name         Presety - Dane Administracyjne
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  try to take over the world!
// @author       MAC
// @match        */api/vehicle/admin/save/*
// @grant        none
// @include      *api/vehicle/admin/save/*
// ==/UserScript==

(function() {
    'use strict';

//To jest skrypt z GH
    let fuelTanksCapacity = 0;

    const newBar = document.createElement("div");
    const ciezarowySondaButton = '<button id="ciezarowySonda">ciezarowy - Sonda</button>';
    const ciezarowyPlywakButton = '<button id="ciezarowyPlywak">ciezarowy - Plywak</button>';
    const osobowyPlywakButton = '<button id="osobowyPlywak">osobowy - Plywak</button>';
    const odklikajCan = '<button id="odklikajCan">Odklikaj CAN</button>';
    const serwisSondy = '<button id="serwisSondy">Serwis sondy</button>';

    newBar.innerHTML = `<div id="buttonDiv">${ciezarowySondaButton}${ciezarowyPlywakButton}  |  |  | ${osobowyPlywakButton}  |  |  |  ${odklikajCan}  |  |  | ${serwisSondy}</div>`;

    $(".break")[0].children[0].append(newBar);

    document.getElementById("ciezarowySonda").addEventListener('click', ciezarowySonda);
    document.getElementById("ciezarowyPlywak").addEventListener('click', ciezarowyPlywak);
    document.getElementById("osobowyPlywak").addEventListener('click', osobowyPlywak);
    document.getElementById("odklikajCan").addEventListener('click', odklikajCanFunc);
    document.getElementById("serwisSondy").addEventListener('click', serwisSondyFunc);

    function ciezarowySonda(e) {
        e.preventDefault();
        uniwersalne();
        ciezarowyUniwersalne();

        $("#s2id_pomiar_paliwa_id").select2('val', 2);
        click("#paliwo_z_sondy");

        $("#min_odchylenie").val(1.5);

        $("#prog_weryfikujacy_paliwa").val(percentOfFuelTank(3.5));
        $("#prog_wartosci_paliwa").val(percentOfFuelTank(3.5));
        $("#prog_weryfikujacy_paliwa_u").val(percentOfFuelTank(2));
        $("#prog_wartosci_paliwa_u").val(percentOfFuelTank(2));
    }

    function ciezarowyPlywak(e) {
        e.preventDefault();
        uniwersalne();
        ciezarowyUniwersalne();

        $("#s2id_pomiar_paliwa_id").select2('val', 3);
        unclick("#paliwo_z_sondy");

        $("#min_odchylenie").val(5);

        const percentOfFuel = percentOfFuelTank(5);
        $("#prog_weryfikujacy_paliwa").val((percentOfFuel > 50 ? 0 : percentOfFuel));
        $("#prog_wartosci_paliwa").val((percentOfFuel > 50 ? 0 : percentOfFuel));
        $("#prog_weryfikujacy_paliwa_u").val(0);
        $("#prog_wartosci_paliwa_u").val(0);
        console.log(fuelTanksCapacity)
    }

    function ciezarowyUniwersalne() {
        $("#min_napiecie_stacji").val(21);
        $("#s2id_poprawnosc_tacho_id").select2('val', 1);
        $("#s2id_paliwo_z_sondy_dyst").select2('val', 3);
        $("#s2id_paliwo_z_can_dyst").select2('val', 3);
        $("#wyjatek_brak_zasilania").val(21);
        click("#paliwo_z_can");
        click("#dystans_can_pokaz");
        click("#can_dystans");

        $("#max_obroty_silnika").val(2300);
        $("#max_obroty_silnika_przelicznik").val(1);

        click("#sposob_gener_zdarzen4");
    }

    function osobowyPlywak(e) {
        e.preventDefault();
        uniwersalne();
        osobowyUniwersalne();

        $("#s2id_pomiar_paliwa_id").select2('val', 3);
        unclick("#paliwo_z_sondy");

        $("#min_odchylenie").val(5);


        $("#prog_weryfikujacy_paliwa").val(percentOfFuelTank(10));
        $("#prog_wartosci_paliwa").val(percentOfFuelTank(10));
        $("#prog_weryfikujacy_paliwa_u").val(0);
        $("#prog_wartosci_paliwa_u").val(0);
        console.log(fuelTanksCapacity)
    }

    function osobowyUniwersalne() {
        $("#min_napiecie_stacji").val(12);
        $("#s2id_poprawnosc_tacho_id").select2('val', 1);
        $("#s2id_paliwo_z_sondy_dyst").select2('val', 3);
        $("#s2id_paliwo_z_can_dyst").select2('val', 3);
        click("#paliwo_z_can");
        $("#wyjatek_brak_zasilania").val(12);

        $("#max_obroty_silnika").val(5000);
        $("#max_obroty_silnika_przelicznik").val(1);

        click("#dystans_can_pokaz");
        click("#can_dystans");
    }

    function uniwersalne() {
        $("#wywlaszczenie_zdarzenia").val(1000);

        fuelTanksCapacity = 0;
        for(let i = 1; i <= 6; i++) {
            $("#zone_tank_" + i).val($("#pojemnosc_zbiornika_" + i).val());
            fuelTanksCapacity += +$("#pojemnosc_zbiornika_" + i).val();
        }

        $("#ilosc_punktow_drogi").val(5);
        $("#ilosc_punktow_drogi_u").val(5);
        $("#odchylenie_standardowe").val(1);
        $("#odchylenie_standardowe_u").val(1);
        $("#liczba_przedzialow").val(2);
        $("#liczba_przedzialow_u").val(2);

        click("#usuwaj_pkt_zerowe");
        $("#usuwaj_pkt_zerowe_do").val(1);
        $("#usuwaj2_pkt_zerowe_od").val(103);
        $("#usuwaj2_pkt_zerowe_do").val(109);
        click("#niewylaczony_zaplon");
        click("#bez_zaniku_zasilania");
        click("#bez_zaniku_zasilania_u");
        click("#bez_zdarzenia_jazda");

        click("#dystans_gps_pokaz");
        click("#dystans_gps_w_pojezdzie");

        click("#wlacz_paliwo");
        click("#gen_lokalizacje");
        click("#gen_dop_predkosci");
        click("#divide");
        $("#divide_days").val(90);

        if(window.location.host === "kj.framelogic.pl") {
            click("#wysylaj_dhl");
        }
    }

    function odklikajCanFunc(e) {
        e.preventDefault();

        $("#sposob_gener_zdarzen1").click();
        $("#rejestruj_obroty0").click();
        $("#tachometr_w_pojezdzie0").click();
        $("#gen_zdarzen_predkosc1").click();

        $("#s2id_poprawnosc_tacho_id").select2('val', 0);
        $("#s2id_paliwo_z_sondy_dyst").select2('val', 1);
        $("#s2id_paliwo_z_can_dyst").select2('val', 1);

        unclick("#paliwo_z_can");
        unclick("#dystans_can_pokaz");
        unclick("#can_dystans");
    }

    function serwisSondyFunc(e) {
        e.preventDefault();

        unclick("#paliwo_z_sondy");
        unclick("#divide");

        $("#min_odchylenie").val(100);

        $("#prog_weryfikujacy_paliwa").val(9999);
        $("#prog_wartosci_paliwa").val(9999);
        $("#prog_weryfikujacy_paliwa_u").val(9999);
        $("#prog_wartosci_paliwa_u").val(9999);
    }

    function click(element) {
        if(!$(element)[0].checked) $(element).click();
    }

    function unclick(element) {
        if($(element)[0].checked) $(element).click();
    }

    function percentOfFuelTank(percent) {
        return Math.floor(fuelTanksCapacity * (percent / 100));
    }

    
})();
