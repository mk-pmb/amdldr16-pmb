/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */
define(function () {
  'use strict';
  var EX = { id: 'pre-console' }, tag = document.getElementById(EX.id), orig;
  EX.origConsole = orig = {
    log: console.log,
  };
  if (!tag) {
    tag = document.createElement('pre');
    tag.id = EX.id;
    document.getElementsByTagName('body')[0].appendChild(tag);
  }
  if (!tag.innerHTML) {
    tag.innerHTML = '[log start: ' + (new Date()).toISOString() + ']';
  }
  function log(msg) {
    orig.log.apply(this, arguments);
    tag.appendChild(document.createTextNode('\n' + String(msg)));
  }
  console.log = EX.log = log;
  window.onerror = function (err) { log('E: ' + err); };
  return EX;
});
