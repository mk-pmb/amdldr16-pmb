/*jslint indent: 2, maxlen: 80, browser: true */
/* -*- tab-width: 2 -*- */
/*globals define:true */

/* @license MIT | amdldr16-pmb: basecfg */
(function () {
  'use strict';
  var jq = window.jQuery, ld = window.lodash, curl = window.curl,
    pkgName = 'amdldr16-pmb', alInjectTag, cfg = {}, plumbing = {},
    curlPaths = { 'curl-amd': 'curl' },
    curlCfg = { paths: curlPaths, packages: {} };

  if ((typeof define === 'function') && define.amd) {
    define(pkgName + '/cfg', cfg);
    define(pkgName + '/curlcfg', curlCfg);
    define(pkgName + '/plumbing', plumbing);
    define('curl-amd', ['curl'], ld.identity);
  }

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


  function arrstr(arry, idx) { return ((arry && arry[idx || 0]) || ''); }
  function parDir(p) { return String(p || '/').replace(parDir.rx, '/'); }
  parDir.rx = /\/+[\x00-\.0-\uFFFF]*\/*$/;


  // guess paths:
  (function () {
    function hostBase(lnk) {
      var parts = String(lnk || '').split(/(\/+)/);
      if (parts[0] === 'file:') { return parts.slice(0, 2).join(''); }
      return parts.slice(0, 3).join('');
    }
    var alHostBase, alPath, modPath,
      pageHostBase = hostBase(location);

    alPath = (function (injTag) {
      if (!injTag) { return; }
      var lnk, url = String(injTag.src || injTag.href
        || jq(injTag).data('src-url') || '');
      if (url) {
        lnk = jq('<a>').attr('href', url)[0];
        url = lnk.pathname;
        alHostBase = hostBase(lnk);
      }
      return (url &&
        arrstr(url.match(/^\S*\//)
          ).replace(/\/+dist\/+$/, '/'));
    }(alInjectTag));
    if (!alPath) { throw new Error(pkgName + ': unable to guess source URL'); }

    if (alHostBase === pageHostBase) { alHostBase = pageHostBase = ''; }
    modPath = arrstr(alPath.match(/^\S+\/+(node_modules|bower_components)\//));
    if (!modPath) {
      modPath = pkgName + '(/|-(js|node)/)';
      modPath = alPath.replace(new RegExp('(^|/)' + modPath + '$'), '$1');
    }

    (function () {
      var cbu = {};
      cfg.urlPaths = cbu;
      cbu.modules = curlCfg.baseUrl = alHostBase + modPath;

      function defUps(cpKey, ups, base, path) {
        var p = base + path;
        curlPaths[cpKey] = p;
        if (ups) { defUps(cpKey + '.', ups - 1, base, parDir(path)); }
        return p;
      }
      cbu.pageDir = defUps('doc.', 1, pageHostBase, parDir(location.pathname
        // Making sure that there's a file name even in case of a directory
        // index file being served:
        + '_'));
      cbu.ldrDir = defUps('ldr.', 1, alHostBase, alPath);
    }());
  }());


  // apply custom overrides:
  (function () {
    var prop = (alInjectTag && jq(alInjectTag).attr('debug-precfg')),
      ovr = (prop && window[prop]);
    if (!ovr) { return; }
    console.log(pkgName + ' custom override:', prop, ovr);
    if (typeof ovr === 'function') {
      ovr = ovr(curlCfg, { cfg: cfg, plumbing: plumbing });
    }
    if (ovr && (ovr !== curlCfg)) { Object.assign(curlCfg, ovr); }
  }());
  curl(curlCfg);
























}());
