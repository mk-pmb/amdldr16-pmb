#!/bin/sed -urf
# -*- coding: UTF-8, tab-width: 2 -*-

:read_all
$!{N;b read_all}

s~((^|\n)/\*)(\s|\*)*( @[A-Za-z0-9 ]*[A-Za-z0-9]|)(\s|\*)*~\1\4 ~g
s~(\s|\*)*(\*/)\n~ \2\r~g
s~<^blkcmt#1>;*((define\(|\(|)function)\b~\1;\2~
s~<^blkcmt#1>;*(define\()(function)\b~\1;\2"<^modspec>", \3~
s~<^blkcmt#1>;*(define\()(function)\b~\1;\2"<^modspec>", \3~
\~<^blkcmt#1>module\.exports\s*=~{
  # always add an outer function, in order to protect the outer
  # namespace from leaking function expression names in MSIE.
  s~(^|\r)(module\.exports)~\1;define("<^modspec>",\a\
    function(require,exports,module){\2~
  s~\a\n +~~g
  s~\s*$~});&~
}

s~\n((/| *)\*)~\r\1~g
s~([,;:{}()])\n~\1~g
s~\n~ ~g

s~^\s+~~
s~\r~\n~g
s~\s+\n~\n~g    # however, keep whitespace after \n: comment indentation
s~\s*$~~
