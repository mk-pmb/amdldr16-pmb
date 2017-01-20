/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */

/* @license MIT | amdldr16-pmb: basecfg */
(function () {
  'use strict';
  var pkgName = 'amdldr16-pmb', jq = window.jQuery, ld = window.lodash,
    cfg = {}, plumbing = {},
    curl = window.curl,
    curlPaths = { 'curl-amd': 'curl' },
    curlCfg = { paths: curlPaths, packages: {}, };

  if ((typeof define === 'function') && define.amd) {
    define(pkgName + '/cfg', cfg);
    define(pkgName + '/curlcfg', curlCfg);
    define(pkgName + '/plumbing', plumbing);
    define('curl-amd', ['curl'], ld.identity);
  }


  // guess paths:
  (function () {
    function hostBase(lnk) {
      return String(lnk || '').split(/(\/+)/).slice(0, 3).join('');
    }
    var alInjectTag, alHostBase, alPath, modPath, pageDir,
      pageHostBase = hostBase(location);
    alInjectTag = (function () {
      var id = pkgName + '-inject', lastSc = (jq('script:last')[0] || false);

      // Ignore the last script tag if it doesn't have a source URL;
      // in that case, it's probably not ours.
      if (!lastSc.src) { lastSc = false; }

      // If the last script tag has a matching id, always prefer that one,
      // independent of which one document.getE…ById would select.
      // In case of just one tag with that id, it's no difference anyway,
      // and in case of multiple elements with that id, it increases
      // resilience against parts of page content that accidentially got
      // the same id.
      // Examples might include headline anchors and runaway code examples.
      if (lastSc.id === id) { return lastSc; }

      return (document.getElementById(id) || lastSc);
    }());
    plumbing.injectTag = alInjectTag;

    alPath = (function (injTag) {
      if (!injTag) { return; }
      var lnk, url = String(injTag.src || injTag.href
        || jq(injTag).data('src-url') || '');
      if (url) {
        lnk = jq('<a>').attr('href', url)[0];
        url = lnk.pathname;
        alHostBase = hostBase(lnk);
      }
      url = (url && url.match(/^\S*\//));
      if (!url) { return; }
      url = url[0].replace(/\/+dist\/+$/, '/');
      return url;
    }(alInjectTag));
    if (!alPath) { throw new Error(pkgName + ': unable to guess source URL'); }

    if (alHostBase === pageHostBase) { alHostBase = pageHostBase = ''; }
    modPath = /^\S+\/+(node_modules|bower_components)\//;
    modPath = alHostBase + ((alPath.match(modPath) || false)[0] || alPath);
    pageDir = pageHostBase + String(location.pathname || '/'
      ).replace(/\/+[\x00-\.0-\uFFFF]*$/, '/');
    alPath = alHostBase + alPath;

    cfg.urlPaths = { pageDir: pageDir, ldrDir: alPath, modules: modPath, };
    curlCfg.baseUrl = modPath;
    curlPaths['doc.'] = pageDir;
    curlPaths['ldr.'] = alPath;
  }());

  curl(curlCfg);
























}());
