/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true, curl:true */

/* @license MIT | amdldr16-pmb: basecfg */
(function () {
  'use strict';

  var pkgName = 'amdldr16-pmb', jq = window.jQuery, cfg = {},
    curlPaths = {}, curlCfg = { paths: curlPaths, packages: {}, },
    plumbing = {};
  define(pkgName + '/cfg', function () { return cfg; });
  define(pkgName + '/curlcfg', function () { return curlCfg; });
  define(pkgName + '/plumbing', function () { return plumbing; });


  // guess paths:
  (function () {
    var alInjectTag, alPath, modPath, pageDir;
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
      var url = String(injTag.src || injTag.href
        || jq(injTag).data('src-url') || '');
      url = (url && jq('<a>').attr('href', url)[0].pathname);
      url = (url && url.match(/^\S*\//));
      if (!url) { return; }
      url = url[0].replace(/\/+dist\/+$/, '/');
      return url;
    }(alInjectTag));
    if (!alPath) { throw new Error(pkgName + ': unable to guess source URL'); }

    modPath = ((alPath.match(/^\S+\/+(node_modules|bower_components)\//)
      || false)[0] || alPath);
    pageDir = String(location.pathname || '/'
      ).replace(/\/+[\x00-\.0-\uFFFF]+\/*$/, '/');

    cfg.urlPaths = { pageDir: pageDir, ldrDir: alPath, modules: modPath, };
    curlCfg.baseUrl = modPath;
    curlPaths['doc.'] = pageDir;
    curlPaths['ldr.'] = alPath;
  }());

  curl(curlCfg);
























}());
