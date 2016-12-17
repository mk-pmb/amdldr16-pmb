/*jslint indent: 2, maxlen: 80 */
/*globals define:true */
/* -*- tab-width: 2 -*- */

define(function (require) {
  'use strict';
  var UT = {};

  UT.arrLast = function (arr, n) { return arr[arr.length - (n || 1)]; };

  UT.copyNewProps = function (dest, src) {
    if (!UT.isObj(src)) { return dest; }
    var prop;
    for (prop in src) {
      if (Object.prototype.hasOwnProperty.call(src, prop)) {
        if (dest[prop] === undefined) { dest[prop] = src[prop]; }
      }
    }
    return dest;
  };

  UT.splitDivePath = function (path) {
    if (Array.isArray(path)) { return path; }
    path = String(path);
    if ((!path) || /^[A-Za-z0-9_]/.test(path)) { return [path]; }
    return path.split(new RegExp('\\' + path[0], ''));
  };

  UT.dive = function (obj, path) {
    if (!obj) { return; }
    function deeper(step) { obj = (obj || false)[step]; }
    UT.splitDivePath(path).forEach(deeper);
    return obj;
  };









  return UT;
});
