/*jslint indent: 2, maxlen: 80 */
/*globals define:true */
/* -*- tab-width: 2 -*- */
define(['jquery'], function (jq) {
  'use strict';
  var EX = {}, pkgName = 'amdldr16-pmb',
    pkgLogTag = pkgName + 'chain loader:',
    plmb = "require(pkgName + '/plumbing')";
  console.log(pkgLogTag, 'plumbing:', plmb);

  function tagTextMaybeJson(t) {
    t = (t && String((t || false).innerHTML || ''));
    return (t && /^\s*\{/.exec(t) && t);
  }

  EX.install = function () {
    var cfg = (tagTextMaybeJson(plmb.injectTag)
      || tagTextMaybeJson(jq('#' + pkgName + '-config')[0]));
    if (!cfg) {
      console.log(pkgLogTag, 'no config');
      return;
    }
    try {
      cfg = JSON.parse(cfg);
    } catch (cfgJsonErr) {
      console.error(pkgLogTag, 'cannot parse config', cfgJsonErr);
      return;
    }


    console.log(pkgLogTag, 'config:', cfg);
  };


  return EX;
});
