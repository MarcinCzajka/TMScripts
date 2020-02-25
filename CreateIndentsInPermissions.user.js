// ==UserScript==
// @name         CreateIndentsInPermissions
// @namespace    https://github.com/MarcinCzajka
// @version      0.1
// @description  Create indents where there are none to make UI more readable
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/CreateIndentsInPermissions.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/CreateIndentsInPermissions.user.js
// @match        */api/admin/permission*
// @grant        none
// @include      */api/admin/permission*
// ==/UserScript==

(function() {

    for(const el of document.getElementsByClassName('td_1')) {
        if(el.children[0].children.length === 2) {
            if(el.previousElementSibling.children.length === 1) {
                el.previousElementSibling.children[0].style.marginLeft = el.children[0].children[0].style.width
            }
        }
    }

})();