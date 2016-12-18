
Workarounds
===========

jQuery v2.1.1
-------------

  * AMD factory re-registering: If jQuery is loaded after curl, curl cannot
    load AMD modules that require `jquery`, reporting
    `Error: Multiple anonymous defines encountered`.
    The message suggests the factory that jQuery registers as AMD module
    `jquery` might try to re-register itself.
    * __Fix:__ Load jQuery before curl so it cannot register with curl's
      `define()`, then register a custom factory in `adjust-names.js`.


