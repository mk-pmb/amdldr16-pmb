/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */

/* @license MIT | amdldr16-pmb: adjust names */
(function () {
  'use strict';
  function makeMemoFunc(x) { return function () { return x; }; }

  (function () {
    var jq = '$', ld = '_';
    jq = window[jq].noConflict();

    window.jQuery = jq;
    // ^-- usually it's already there anyway.
    define('jquery', makeMemoFunc(jq));

    ld = window[ld].noConflict();
    window.lodash = ld;
    define('lodash', makeMemoFunc(ld));

    define('curl/plugin/cjs', ['curl/loader/cjsm11'], ld.identity);
    define('window-pmb', window);
  }());



















}());
