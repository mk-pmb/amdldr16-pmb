/*jslint indent: 2, maxlen: 80 */
/*globals define:true */
/* -*- tab-width: 2 -*- */
define(function (require) {
  'use strict';
  var EX = { cfg: {} }, isAry = Array.isArray,
    pkgName = 'amdldr16-pmb', pkgLogTag = pkgName + ' chain loader:',
    jq = require('jquery'), ld = require('lodash'), curl = require('curl'),
    plmb = require(pkgName + '/plumbing');

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
    var func = modObj;
    return;
  }


  function tryChainload(spec) {
    logHint('tryChainload:', spec);
    var func = spec[1], args = spec.slice(2),
      failMsg = 'failed to chain-load ';
    spec = spec[0];
    if (!spec) { return; }
    if (typeof spec === 'string') {
      failMsg += '"' + spec + '"';
    } else {
      return fail(failMsg + '(not string):', spec);
    }
    function onModLoad(mod) { startChainloadedModule(mod, func, args, spec); }
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
      if (step === null) { return; }
      switch (step && typeof step) {
      case undefined:
        step = String(step);
        break;
      case 'string':
        if (step[0] === '#') { return; }
        return curl.win(step);
      case 'object':
        if (isAry(step)) { return tryChainload(step); }
        ld.assign(cfg, step);
        return;
      }
      return fail('unsupported config step type:', step);
    });


    if (cfg.wikifx) { EX.wikifx(cfg); }
  };
















  return EX;
});
