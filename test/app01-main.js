/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var domlog = require('ldr./lib/dom.log'),
  plumbing = require('amdldr16-pmb/plumbing'),
  counter = require('cjs!./side-effect.js');

domlog('app-init: plumbing:', plumbing);

module.exports = {
  init: domlog.pfx('app-init:', counter(), 'args:'),
};
