/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

module.exports = {
  wikifxInit: function (tags) {
    tags.forEach(function (tag) { tag.innerHTML = 'Hello world!'; });
  },
};
