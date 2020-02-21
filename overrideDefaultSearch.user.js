// ==UserScript==
// @name         Override default search
// @namespace    https://github.com/MarcinCzajka
// @version      0.1.2
// @description  Override default search to allow special signs
// @author       MAC
// @downloadURL  https://github.com/MarcinCzajka/TMScripts/raw/master/overrideDefaultSearch.user.js
// @updateURL    https://github.com/MarcinCzajka/TMScripts/raw/master/overrideDefaultSearch.user.js
// @match        http://*/api/installation*
// @grant        none
// @include */api/*
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(() => {
        const menu = document.getElementById('main-menu');
        console.log(menu, $._data(document, 'events').keydown.length)
        if(menu && $._data(document, 'events').keydown.length === 1) {

            $(document).unbind('keydown');

            //Used .keypress() instead of .keydown() because it shows correct keycode
            $(document).keypress(function(e) {

                var searchingList = $('ul#menu > li > ul:visible');
                var searching = searcher.searchText;

                var level = $('ul[data-hover="1"]:visible:last').attr('data-depth');
                if (level == 2) {
                    searching = searcher.searchText2;
                    searchingList = $('ul#menu > li ul:visible > li > ul:visible');
                }

                var keyCode = e.which ? e.which : e.keyCode;

                if (keyCode === 27 || (keyCode === 8 && searching.length > 0)) {

                    searching = searching.substring(0, searching.length - 1);
                    updateSearcher(searching, level);

                } else {
                    //Using keypress allowed me to shorten this if and reduce number of explicit declaration of keycodes
                    var char = String.fromCharCode(keyCode).toLowerCase();

                    searching += char;
                    updateSearcher(searching, level);
                }

                var searchLength = searching.length;

                if (searchingList.find('li input[name=menu_search]').length == 0) {

                    if (searchLength > 0) {

                        $.each(searchingList.children('li'), function() {

                            var $this = $(this);
                            var text = $('> a > span', this).text();

                            if (text.toLowerCase().indexOf(searching) !== -1) {

                                $this.show();
                                var search = text.substr(0, text.toLowerCase().indexOf(searching)) + '<em class="search-term">' + text.substr(text.toLowerCase().indexOf(searching), searchLength) + '</em>' + text.substr(text.toLowerCase().indexOf(searching) + searchLength);
                                $('> a > span', this).html(search);

                            } else {
                                $this.hide();
                            }

                        });

                    } else {

                        $('> li', searchingList).show();
                        $('.search-term', searchingList).contents().unwrap();

                    }

                }
            });
        }
    }, 50)

})();