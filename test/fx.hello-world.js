/*jslint indent: 2, maxlen: 80, node: true */
/* -*- tab-width: 2 -*- */
'use strict';

var jq = require('jquery'), ld = require('lodash'),
  words = [ 'Hello', 'World' ],
  colors = [ 'Tomato', 'Orange', 'Yellow', 'Lime', 'Cyan',
    'DodgerBlue', 'Violet' ],
  win = require('window-pmb');


function arrNext(arr, step, memoObj, memoKey) {
  if (!memoObj) { memoObj = arr; }
  if (!memoKey) { memoKey = 'current'; }
  var len = (+arr.length || 0), idx = memoObj[memoKey];
  if (len < 1) { return; }
  idx = (idx === +idx ? ((idx + (+step || 1)) % len) : 0);
  while (idx < 0) { idx += len; }
  memoObj[memoKey] = idx;
  return arr[idx];
}


function setNextColor(evt) {
  win.helloClicked = evt;
  var el = evt.target, step = (evt.shiftKey ? -1 : 1);
  el.style.backgroundColor = arrNext(colors, step);
}


module.exports = {
  wikifxInit: function (tags) {
    var num = 0;
    tags.forEach(function (tag) {
      num += 1;
      var word = arrNext(words);
      jq(tag).attr('num', num).text(word).val(word
        ).on('click', setNextColor);
    });
  },
};
