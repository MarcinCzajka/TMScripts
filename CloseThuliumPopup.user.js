// ==UserScript==
// @name         Close Thulium Popup
// @namespace    https://github.com/MarcinCzajka
// @version      0.3
// @description  Close annoying Thulium pop-up about phone not being connected
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/CloseThuliumPopup.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/CloseThuliumPopup.user.js
// @supportURL   https://github.com/MarcinCzajka/TMScripts/issues
// @match        *thulium.com/panel/softphone*
// @grant        none
// @include      *thulium.com/panel/softphone*
// @run-at document-start
// ==/UserScript==

(function() {window.close()})();