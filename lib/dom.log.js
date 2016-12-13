/*jslint indent: 2, maxlen: 80, browser: true */
/*global define:true */
/* -*- tab-width: 2 -*- */

(function setup() {
  'use strict';

  function log() {
    var args = Array.prototype.slice.call(arguments), msg;
    msg = args.map(log.describe).join(' ');
    log.dest.appendChild(document.createTextNode(msg + '\n'));
    return log;
  }
  log.tagId = 'test-log-output';
  log.dest = (document.getElementById(log.tagId)
    || document.createElement('pre'));
  log.dest.id = log.tagId;

  var body = document.getElementsByTagName('body')[0];

  if (!log.dest.parentNode) { body.appendChild(log.dest); }

  log.pfx = function () {
    function prefixedLog() {
      var msg = Array.prototype.slice.call(arguments);
      log.apply(null, prefixedLog.pfx.concat(msg));
    }
    prefixedLog.pfx = Array.prototype.slice.call(arguments);
    return prefixedLog;
  };

  log.ellip = function ellip(x, head, tail) {
    head = (+head || 128);
    tail = (+tail || head);
    var snip = (x.length - head - tail);
    if (snip < 1) { return x; }
    return x.slice(0, head).concat(' …[+' + snip + ']… ', x.slice(-tail));
  };

  log.undefSymbol = '\u26F6';
  log.smallFwithHook = 'ƒ';

  log.describe = function describe(x) {
    switch (x && typeof x) {
    case undefined:
      return log.undefSymbol;
    case 'function':
      x = Function.prototype.toString.call(x);
      break;
    case 'object':
      x = (JSON.stringify(x, describe.jsonHelper, 2) || ('keys: ' +
          JSON.stringify(Object.keys(x), describe.jsonHelper, 2)));
      // x = x.replace(/\n\s*/g, ' ');
      break;
    }
    x = log.ellip(String(x));
    x = x.replace(/\t/g, '\u21B9 ');
    x = x.replace(/\n/g, '\n    ¶');
    return x;
  };

  log.describe.jsonHelper = function (key, val) {
    var signature = '«»';
    if (key.ignore) { return; }
    if (val === undefined) { return signature + log.undefSymbol; }
    switch (typeof val) {
    case 'number':
      if (!Number.isFinite(val)) { return signature + String(val); }
      return val;
    case 'function':
      return signature + log.smallFwithHook + ' ' + (val.name || 'anon');
    }
    return val;
  };


  if ((typeof define === 'function') && define.amd) {
    define(function () { return log; });
  } else {
    if (window.log === undefined) { window.log = log; }
  }


  window.onerror = function () {
    var args = Array.prototype.slice.call(arguments);
    log('E:', args);
  };








  return log;
}());
