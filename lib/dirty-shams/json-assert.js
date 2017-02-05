/*jslint indent: 2, maxlen: 80 */
/* -*- tab-width: 2 -*- */
/*global define: true */
define(function () {
  'use strict';
  var EX;

  function failIf(err) {
    if (!err) { return false; }
    if (typeof err !== 'object') { err = new Error(String(err)); }
    throw err;
  }

  EX = function (ok) { return (ok ? true : failIf('not ok: ' + String(ok))); };
  EX.ok = EX;
  EX.ifError = failIf;


  EX.quot = function (x) {
    function lowUniChr(c) { return '\\u00' + encodeURIComponent(c).slice(1); }
    return ('"' + String(x).replace(/([\x00-\x1F"'\\%])/g, lowUniChr) + '"');
  };

  EX.oneLineJSONify = function (x) {
    return JSON.stringify(x, null, 2).replace(/\n\s*/g, ' ');
  };

  EX.shallowStringify = function shs(x) {
    if (x === null) { return String(x); }
    var t = typeof x;
    if (t === 'string') { return EX.quot(x); }
    if (t === 'object') {
      t = Object.prototype.toString.call(x).slice(8, -1);
      if (t === 'Array') {
        if (x.length === 0) { return '[]'; }
        // Don't use Array#map from es5-shim: In MSIE 6,
        // Object.prototype.hasOwnProperty.call([ undefined ], '0') === false
        // https://github.com/es-shims/es5-shim/issues/190
        return ('[ ' + EX.quot(x.join('\x00')).replace(/\\u0{4}/g,
          '", "') + ' ]');
      }
      return ('{ ' + t + ': ' + EX.quot(String(x)) + ' }');
    }
    return String(x);
  };

  (function () {
    function w(x) { console.warn('W: json-assert: using ' + x + w.y); }
    w.y = ' to compare values.';
    EX.stfy = EX.oneLineJSONify;
    try {
      EX.stfy({ foo: 'bar' });
      return w('JSON');
    } catch (ignore) {}
    EX.stfy = EX.shallowStringify;
    return w('shallowStringify');
  }());


  EX.strictEqual = function (a, b) {
    if (a === b) { return true; }
    throw new Error(String(a) + ' !== ' + String(b));
  };


  EX.deepStrictEqual = function (a, b) {
    if (a === b) { return true; }
    a = EX.stfy(a);
    b = EX.stfy(b);
    return EX.strictEqual(a, b);
  };

  return EX;
});
