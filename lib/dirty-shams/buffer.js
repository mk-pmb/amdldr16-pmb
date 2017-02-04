/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  if (window.Buffer && window.Buffer.isBuffer) { return; }
  function BufferShim() { return; }
  window.Buffer = BufferShim;
  BufferShim.shimmed = true;
  BufferShim.from = function () { return new BufferShim(); };
  BufferShim.isBuffer = function (x) { return (x instanceof BufferShim); };
}());
