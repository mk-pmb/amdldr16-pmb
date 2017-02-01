/*jslint indent: 2, maxlen: 80 */
/* -*- tab-width: 2 -*- */
/*global define: true */
(function () {
  'use strict';
  var EX = {};


  EX.deepStrictEqual = function (a, b) {
    if (a === b) { return true; }
    a = JSON.stringify(a);
    b = JSON.stringify(b);
    if (a === b) { return true; }
    throw new Error(a + ' !== ' + b);
  };


  define(EX);
}());
