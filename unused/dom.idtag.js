/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

module.exports = (function setup() {
  var UT = {};

  UT.idTag = function (doc) {
    return function idTag(id, make, init) {
      var el = ((id && (id.tagName ? id : doc.getElementById(id))) || false);
      if ((!el) && make) {
        if (UT.isStr(make)) { make = { tagName: make }; }
        el = doc.createElement(make.tagName);
        el.id = id;
        if (make.before) {
          make.before.parentNode.insertBefore(el, make.before);
        } else if (make.parent === '+/body') {
          doc.getElementsByTagName('body')[0].appendChild(el);
        } else if (make.parent) {
          make.parent.appendChild(el);
        }
      }
      if (el && init) { el = init(el, el.style); }
      return el;
    };
  };









  return UT;
}());
