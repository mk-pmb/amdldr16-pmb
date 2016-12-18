/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */

(function () {
  'use strict';
  var jq = window.jQuery, ld = window.lodash, curl = window.curl;

  function tryInstall(mod) {
    if (typeof mod.install !== 'function') { return; }
    function installNow() { mod.install(window); }
    function installWhenDomReady() { jq().ready(installNow); }
    ld.defer(installWhenDomReady);
  }

  curl.win = function () {
    var args = Array.prototype.slice.call(arguments);
    return curl.apply(null, args).then(tryInstall, function (err) {
      console.error('failed to curl.win', args, err);
    });
  };

  curl.globalize = function (id, prop) {
    return curl(id).then(function (mod) { window[prop || id] = mod; },
      function (err) { console.error('failed to curl', id, err); });
  };











}());
