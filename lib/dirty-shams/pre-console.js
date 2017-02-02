/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */
(function (dfn) {
  'use strict';
  var EX = { id: 'pre-console' }, tag = document.getElementById(EX.id), orig;
  EX.origConsole = orig = Object.assign({}, console);
  orig.log('pre-console: prepare…');
  if (!tag) {
    tag = document.createElement('pre');
    tag.id = EX.id;
    document.getElementsByTagName('body')[0].appendChild(tag);
  }
  if (!tag.innerHTML) {
    tag.innerHTML = '[log start: ' + (new Date()).toISOString() + ']';
  }

  function makeAppender(channel, level) {
    if (!level) { level = channel[0].toUpperCase(); }
    var origFunc = orig[channel], ourFunc = function (msg) {
      origFunc.apply(this, arguments);
      msg = '\n' + level + ': ' + String(msg).replace(/\n/g, '¶\n  »');
      tag.appendChild(document.createTextNode(msg));
    };
    console[channel] = EX[channel] = ourFunc;
  }
  makeAppender('log', 'I');
  makeAppender('warn');
  makeAppender('error');

  window.onerror = EX.error;
  orig.log('pre-console: installed.');
  if (dfn) { return dfn(EX); }
}((typeof define === 'function') && define.amd && define));
