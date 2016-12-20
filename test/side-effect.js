/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var domlog = require('ldr./lib/dom.log');

function counter() {
  var n = (+counter.n || 0);
  counter.n = n + 1;
  return n;
}
domlog('side-effect:', { beep: counter() });

module.exports = counter;
