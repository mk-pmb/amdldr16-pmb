
<!--#echo json="package.json" key="name" underline="=" -->
amdldr16-pmb
============
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Bundle my favorite web-app stepping stones: CujoJS curl + jQuery v2 + lodash
v4 + a chainloader for custom scripts.
<!--/#echo -->

[Live Demo](https://mk-pmb.github.io/amdldr16-pmb/doc/demo.html?chainloader):
Click the buttons to change their color. Shift key + click = reverse.

Documentation PRs welcome. :-)


dist/
-----

  * `3p-base.js` (3rd-party libs) = npm:`jquery/dist/jquery.min`
    \+ npm:`lodash/lodash.min`
    \+ npm:`curl-amd/dist/curl-kitchen-sink/curl`
    * jQuery before curl! ([workaround](doc/workarounds.md) for v2.1.1)

  * `3p-tame.js` = dist/`3p-base` + build/`adjust-names`
    * remove `window._` and `window.$` because they're ugly.
    * jQuery will be at `window.jQuery` (upper-case Q)
      and AMD module `jquery` (lower-case q).
    * lodash will be at `window.lodash` and AMD module `lodash`.
    * curl will be at `window.curl` and AMD module `curl`.
    * curl's CommonJS loader is aliased to prefix `cjs!` + module name.

  * `3p-cfg.js` = dist/`3p-tame` + build/`cfg.base`
    * AMD-define()s the global window object as `window-pmb`.

  * `al.js` = dist/`3p-cfg`
    \+ lib/`util.obj`
    \+ qfx:`chainloader.autostart` + lib/`chainloader`



build/
------

  * `bake.sh`: (re-)generate the `dist/` files according to above receipes.


Known issues
------------

  * Guessing the script tag URL by DOM structure requires the script tag
    to load synchronously, and even then might break in edge cases.
    For best reliability, set `id="amdldr16-pmb-inject"` for the script
    tag that shall determine path, make sure that this id is unique,
    and provide its `src` URL absolute within the host (so the number of
    leading slashes is one).







<!--#toc stop="scan" -->


License
-------
<!--#echo json="package.json" key=".license" -->
MIT
<!--/#echo -->
