/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var domlog = require('ldr./lib/dom.log'),
  plumbing = require('ldr./plumbing');

domlog('app-init: plumbing:', plumbing);

module.exports = {
  init: domlog.pfx('app-init: args:'),
};
