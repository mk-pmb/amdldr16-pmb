/*jslint indent: 2, maxlen: 80, node: true */
/*globals define:true */
/* -*- tab-width: 2 -*- */

/* @license MIT | amdldr16-pmb: chainloader */
module.exports = (function setup() {
  'use strict';
  if (setup.ld) { return setup.ld; }
  var EX = { cfg: {} }, isAry = Array.isArray,
    pkgName = 'amdldr16-pmb', pkgLogTag = pkgName + ' chain loader:',
    objUtil = require('./util.obj'),  // no .js b/c pre-defined in bake
    ld = require('lodash'), isStr = ld.isString, idty = ld.identity,
    jq = require('jquery'), curl = require('curl-amd');

  function logHint(msg, detail) { console.log(pkgLogTag, 'H:', msg, detail); }
  function slashIn(s) { return (s.indexOf('/') >= 0); }
  function ifUndef(x, d) { return (x === undefined ? d : x); }

  function fail(why, details) {
    console.error(pkgLogTag, 'E:', why, details);
    throw new Error(why);
  }


  function plumber() {
    try { return require(pkgName + '/plumbing'); } catch (ignore) {}
    return false;
  }


  function tagTextMaybeJson(t) {
    t = (t && String((t || false).innerHTML || ''));
    if (!t) { return; }
    var brak = t.match(/^\s*(?:\/(\*|\/)\s*|)\[/);
    if (!brak) { return; }
    t = t.slice(brak[0].length - 1);
    if (brak[1] === '*') {
      brak = t.lastIndexOf(']');
      if (brak >= 0) { t = t.slice(0, brak + 1); }
    }
    return t;
  }


  function startChainloadedModule(modObj, funcPath, startArgs, modSrcSpec) {
    var func;
    if (funcPath === null) { return; }
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
      if (typeof func !== 'function') {
        throw new TypeError('object path did not resolve to a function');
      }
      func.apply(null, startArgs);
    } catch (startErr) {
      fail('cannot init "' + modSrcSpec + '"', startErr);
    }
  }


  function tryChainload(spec) {
    logHint('tryChainload:', spec);
    var func = spec[1], args = spec.slice(2),
      failMsg = 'failed to chain-load ';
    spec = spec[0];
    if (!spec) { return; }
    if (isStr(spec)) {
      spec = spec.replace(/^(\w+!|)(?:\.\/|(\.{2,}\/))/, '$1doc./$2');
      failMsg += '"' + spec + '"';
    } else {
      return fail(failMsg + '(not string):', spec);
    }
    function onModLoad(mod) {
      ld.defer(startChainloadedModule, mod, func, args, spec);
    }
    function onModFail(err) { return fail(failMsg, err); }
    curl(spec).then(onModLoad, onModFail);
  }


  EX.install = function (steps) {
    var cfg = EX.cfg;
    steps = (steps
      || tagTextMaybeJson(plumber().injectTag)
      || tagTextMaybeJson(jq('#' + pkgName + '-config')[0])
      || false);
    if (!steps) { return logHint('no config'); }
    // logHint('config text:', steps);

    if (isStr(steps)) {
      try {
        steps = JSON.parse(steps);
      } catch (stepsJsonErr) {
        return fail('cannot parse config text: ' + String(stepsJsonErr), steps);
      }
    }

    if (!isAry(steps)) { return fail('invalid config (not array):', steps); }
    ld.each(steps, function (step) {
      if (!step) { return; }
      if (!isAry(step)) { step = [step]; }
      var action = String(step[0] || '');
      if (!action) { return; }
      if (action[0] === '#') { return; }
      if (slashIn(action)) { return tryChainload(step); }
      switch (action) {
      case 'wikifx':
        if (cfg[action]) { return ld.assign(cfg[action], step[1]); }
        cfg[action] = step[1];
        return;
      case 'alias':
        return step.slice(1).forEach(EX.defineAlias);
      }
      return fail('unsupported config step type:', step);
    });


    if (cfg.wikifx) { jq().ready(function () { EX.wikifxScan(cfg); }); }
  };


  EX.wikifxScan = function (cfg) {
    var fxc = cfg.wikifx, tagName = (fxc.tag || ''), allTags,
      cls = String(fxc.cls || 'wikifx'),
      clsRgx = new RegExp('(?:^|\\s)' + cls + '-([A-Za-z0-9_\\-]+)(?:\\s|$)'),
      modTmpl = (fxc.mod || (cls + '-')),
      func = ifUndef(fxc.func, 'wikifxInit'),
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
    if (isStr(modTmpl)) { modTmpl = [modTmpl, '']; }
    ld.each(addons, function (addonTags, addonName) {
      tryChainload([modTmpl.join(addonName), func, addonTags, addonName]);
    });
  };


  function dfnCurlPkgAlias(target, alias) {
    if (!target) { return; }
    if (typeof target === 'object') {
      return define(alias, ld.constant(target));
    }
    return define(alias, [target], idty);
  }

  EX.defineAlias = function (spec) {
    var alType = (spec && typeof spec);
    if (alType === 'string') {
      spec = spec.split(/\s+/);
      if (spec.length === 2) { return dfnCurlPkgAlias(spec[1], spec[0]); }
    }
    if (alType === 'object') { return ld.each(spec, dfnCurlPkgAlias); }
    throw new Error('defineAlias: unsupported definition');
  };








  setup.ld = EX;
  if (EX.autoInstall) { jq().ready(function () { ld.defer(EX.install); }); }
  return EX;
}());
