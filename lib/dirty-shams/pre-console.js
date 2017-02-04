/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */
(function (dfn) {
  'use strict';

  function byid(id) { return document.getElementById(id); }

  var EX = { id: 'pre-console' }, tag = byid(EX.id), cons = window.console,
    orig = (cons ? Object.assign({}, cons) : false);
  EX.origConsole = orig;
  if (!cons) { cons = window.console = {}; }
  if (!tag) {
    tag = document.createElement('pre');
    tag.id = EX.id;
    document.getElementsByTagName('body')[0].appendChild(tag);
  }

  function date2str(d) {
    return ((d.toISOString && d.toISOString())
      || String(d));
  }

  if (!tag.innerHTML) {
    tag.innerHTML = '[log start: ' + date2str(new Date()) + ']';
  }

  function makeAppender(channel, level) {
    if (!level) { level = channel.substr(0, 1).toUpperCase(); }
    var origFunc = orig[channel], ourFunc;
    ourFunc = function (msg) {
      if (origFunc) { origFunc.apply(this, arguments); }
      var argi = 1, x;
      msg = String(msg);
      for (0; argi < arguments.length; argi += 1) {
        x = arguments[argi];
        if (x && (typeof x === 'object')) {
          try {
            x = JSON.stringify(x, null, 2).replace(/\n\s*/g, ' ');
          } catch (ignore) {}
        }
        msg += ' ' + String(x);
      }
      msg = '\n' + level + ': ' + msg.replace(/\n/g, '¶\n  »');
      if (!orig) { tag.appendChild(document.createElement('br')); }
      tag.appendChild(document.createTextNode(msg));
    };
    cons[channel] = EX[channel] = ourFunc;
  }
  makeAppender('log', 'I');
  makeAppender('warn');
  makeAppender('error');

  function mightBeError(x) {
    return (x && (typeof x === 'object')
      && String(x).match(/^\w*Error($|: )/)
      && x);
  }

  window.onerror = function (msg, url) {
    var details = Array.prototype.slice.call(arguments, 2),
      errObj = mightBeError(details.slice(-1)[0]);
    if (errObj) { details.pop(); }
    EX.error(url.split(/\/|\\/).slice(-1)[0] + ': ' + msg +
      '\n@ ' + details.concat(url).join(' | '));
    return false;
  };

  (function (l) {
    if (!l) { return; }
    setTimeout(function () { l.parentNode.removeChild(l); }, 10);
  }(byid(EX.id + '-loading-hint')));
  if (dfn) { return dfn(EX); }
}((typeof define === 'function') && define.amd && define));
