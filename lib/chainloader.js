/*jslint indent: 2, maxlen: 80, browser: true */
/*globals define:true */
/* -*- tab-width: 2 -*- */

define(function (require) {
  'use strict';
  var EX = { cfg: {} }, isAry = Array.isArray,
    pkgName = 'amdldr16-pmb', pkgLogTag = pkgName + ' chain loader:',
    jq = require('jquery'), ld = require('lodash'), curl = require('curl'),
    asap = window.setImmediate,
    objUtil = require('./util.obj.js'),
    plmb = require(pkgName + '/plumbing');

  if (!asap) { asap = function (f) { setTimeout(f, 1); }; }
  function logHint(msg, detail) { console.log(pkgLogTag, 'H:', msg, detail); }

  function fail(why, details) {
    console.error(pkgLogTag, 'E:', why, details);
    throw new Error(why);
  }


  function tagTextMaybeJson(t) {
    t = (t && String((t || false).innerHTML || ''));
    return (t && /^\s*\[/.exec(t) && t);
  }


  function startChainloadedModule(modObj, funcPath, startArgs, modSrcSpec) {
    var func;
    switch (funcPath && typeof funcPath) {
    case 0:
    case '':
    case 'number':
      func = modObj[funcPath];
      break;
    case 'string':
      func = objUtil.dive(modObj, funcPath);
      break;
    case 'boolean':
      func = modObj;
      break;
    default:
      return;
    }
    try {
      func.apply(null, startArgs);
    } catch (startErr) {
      fail('cannot init "' + modSrcSpec + '"', startErr);
    }
  }


  function tryChainload(spec) {
    // logHint('tryChainload:', spec);
    var func = spec[1], args = spec.slice(2),
      failMsg = 'failed to chain-load ';
    spec = spec[0];
    if (!spec) { return; }
    if (typeof spec === 'string') {
      failMsg += '"' + spec + '"';
    } else {
      return fail(failMsg + '(not string):', spec);
    }
    function onModLoad(mod) {
      asap(function () { startChainloadedModule(mod, func, args, spec); });
    }
    function onModFail(err) { return fail(failMsg, err); }
    curl(spec).then(onModLoad, onModFail);
  }


  EX.install = function () {
    var cfg = EX.cfg, steps = (tagTextMaybeJson(plmb.injectTag)
      || tagTextMaybeJson(jq('#' + pkgName + '-config')[0]));
    if (!steps) { return logHint('no config'); }
    // logHint('config text:', steps);
    try {
      steps = JSON.parse(steps);
    } catch (stepsJsonErr) {
      return fail('cannot parse config', stepsJsonErr);
    }

    if (!isAry(steps)) { return fail('invalid config (not array):', steps); }
    ld.each(steps, function configStep(step) {
      if (!step) { return; }
      if (!isAry(step)) { step = [step]; }
      var action = String(step[0] || '');
      if (!action) { return; }
      if (action[0] === '#') { return; }
      if (action.indexOf('/') >= 0) { return tryChainload(step); }
      switch (action) {
      case 'wikifx':
        if (cfg[action]) { return ld.assign(cfg[action], step[1]); }
        cfg[action] = step[1];
        return;
      }
      return fail('unsupported config step type:', step);
    });


    if (cfg.wikifx) { EX.wikifxScan(cfg); }
  };


  EX.wikifxScan = function (cfg) {
    var fxc = cfg.wikifx, modTmpl = (fxc.mod || 'wikifx-'), func = fxc.func,
      tagName = (fxc.tag || ''), cls = (fxc.cls || 'wikifx'), allTags,
      clsRgx = new RegExp('(?:^|\\s)' + cls + '-([A-Za-z0-9_\\-]+)(?:\\s|$)'),
      addons = Object.create(null);
    allTags = jq(tagName + '.' + cls);
    if (!allTags.length) { return; }
    allTags.each(function (addonName, elem) {
      addonName = clsRgx.exec(String(elem.className || ''));
      if (!addonName) { return; }
      addonName = addonName[addonName.length - 1];
      if (addons[addonName]) { return addons[addonName].push(elem); }
      addons[addonName] = [elem];
    });
    if (typeof modTmpl === 'string') { modTmpl = [modTmpl, '']; }
    if (func === undefined) { func = 'wikifxInit'; }
    ld.each(addons, function (addonTags, addonName) {
      tryChainload([modTmpl.join(addonName), func, addonTags, addonName]);
    });
  };












  return EX;
});
