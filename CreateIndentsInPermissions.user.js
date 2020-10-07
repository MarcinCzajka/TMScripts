// ==UserScript==
// @name         CreateIndentsInPermissions
// @namespace    https://github.com/MarcinCzajka
// @version      1.0
// @description  Create indents where there are none to make UI more readable
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/CreateIndentsInPermissions.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/CreateIndentsInPermissions.user.js
// @match        */api/admin/permission*
// @grant        none
// @include      */api/admin/permission*
// ==/UserScript==

(function() {

    const stylesheet = document.createElement('style');
        stylesheet.type = "text/css";

        stylesheet.textContent = `
            tr[indent_level="1"] div.toggle {
                margin-left: 30px;
            }
            tr[indent_level="2"] div.toggle {
                margin-left: 60px;
            }
            tr[indent_level="3"] div.toggle {
                margin-left: 90px;
            }
            tr[indent_level="4"] div.toggle {
                margin-left: 120px;
            }
        `;

        document.querySelector('head').appendChild(stylesheet);

})();