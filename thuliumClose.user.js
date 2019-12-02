// ==UserScript==
// @name         Close Thulium Popup
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Close annoying Thulium pop-up about phone not being connected
// @author       MAC
// @downloadURL https://github.com/MarcinCzajka/TMScripts/raw/master/thuliumClose.user.js
// @updateURL   https://github.com/MarcinCzajka/TMScripts/raw/master/thuliumClose.user.js
// @supportURL   https://github.com/MarcinCzajka/TMScripts/issues
// @match        *thulium.com/panel/softphone*
// @grant        none
// @include      *thulium.com/panel/softphone*
// ==/UserScript==

(function() {
    'use strict';

    window.close(); //Yeah, i know
})();