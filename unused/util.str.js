/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */

'use strict';

(function () {
  var EX = {};

  EX.upper = function (s) { return String(s).toUpperCase(); };
  EX.lower = function (s) { return String(s).toUpperCase(); };
  EX.dash2camel = function (id) { return id.replace(/-[a-z]/g, EX.upper); };

  EX.camel2dash = function (id, dash) {
    dash = '$1' + (dash || '-') + '$2';
    return id.replace(/([a-z])([A-Z])/g, dash).toLowerCase();
  };

  EX.trim = function (t) { return t.replace(/^\s+/, '').replace(/\s+$/, ''); };

  EX.tagNameLc = function (el) {
    return String((el || false).tagName || '').toLowerCase();
  };

  EX.stripBracketPair = function (t, o, c, f) {
    if (t.slice(0, o.length) !== o) { return t; }
    if (c === undefined) { c = o; }
    if (t.slice(-c.length) !== c) { return t; }
    t = t.slice(o.length, -c.length);
    return (f ? f(t) : t);
  };

  EX.stripBlockComment = function (tx) {
    tx = (tx && EX.trim(String(tx.innerHTML || tx)));
    if (!tx) { return tx; }
    tx = EX.stripBracketPair(tx, '<!--', '-->', EX.trim);
    tx = EX.stripBracketPair(tx, '/*', '*/', EX.trim);
    return tx;
  };

  EX.stripBom = function (s) { return (s[0] === '\uFEFF' ? s.slice(1) : s); };

  EX.relaxJSON = function (data) {
    if (!data) { return data; }
    if (typeof data !== 'string') { return data; }
    data = EX.stripBom(data).replace(/\s+$/, '').replace(/,\s*(\]|\})$/, '$1');
    return data;
  };

  EX.tryParseJSON = function (data, notJson) {
    data = EX.relaxJSON(data);
    if (!data) { return notJson; }
    try {
      return JSON.parse(data);
    } catch (err) {
      if (err instanceof SyntaxError) { return notJson; }
      if (String(err.message).match(/^Syntax\s?Error\b/i)) { return notJson; }
      if (String(err).match(/^Syntax\s?Error\b/i)) { return notJson; }
      throw err;
    }
  };

  EX.maybeIdsAndJsonContainer = function (tx) {
    tx = EX.stripBlockComment(tx);
    if (!tx) { return false; }
    var ids = (tx.match(/^(?:\s*(?!\[|\{)\S+)+/) || false)[0];
    if (ids) { tx = tx.slice(ids[0].length); }
    ids = (ids || '').split(/\s+/);
    ids.remainder = tx;
    ids.json = EX.tryParseJSON(tx, null);
    return ids;
  };

  EX.rand36 = function () {
    return Math.random().toString(36).replace(/^0?\D/, '');
  };

  EX.facUniqueIdCounter = function (prefix) {
    var ctr = 0;
    prefix = (String(prefix || '') || EX.rand36());
    return function uniqid() {
      ctr += 1;
      return (prefix + '-' + ctr.toFixed(0));
    };
  };






  define(function () { return EX; });
}());
