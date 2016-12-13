/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true, curl:true */

/* @license MIT | amdldr16-pmb: adjust names */
(function () {
  'use strict';

  function identity(x) { return x; }
  define('curl/plugin/cjs', ['curl/loader/cjsm11'], identity);

  (function (ld) {
    // anon func hides ld from the outer scope, as to not clutter
    // identity()'s closure with references to them.
    ld = window[ld].noConflict();
    window.lodash = ld;
    define('lodash', function () { return ld; });
  }('_'));

  (function (jq) { // again, anon func to not taint identity
    jq = window[jq].noConflict();
    window.jQuery = jq;
    // ^-- usually it's already there anyway.
  }('$'));




















}());
