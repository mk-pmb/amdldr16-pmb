#!/bin/sed -urf
# -*- coding: UTF-8, tab-width: 2 -*-

/^\s**\\?[*+]/!d
s~\a|\f~ ~g
s~\s~ ~g
s~«|»~"~g

s~ ([a-z]{1,8}[/:]|)`([A-Za-z0-9\/_.-]+)`~ \f:\1\2 ~g
s~ = \f~\a=\f~
s~\([^\a\f\n]*\)~~

s~^ *\* *\f:([^: ]+) *\a=\f:(\S+)~\ndestfn:\1\nadd:\2~
s~^ *\\?\+ *\f:(\S+)~add:\1~
s~ *\\?\+ \f:(\S+)~\nadd:\1~g

/^ *\*/d
s~\f~¦~g
s~\a~¡~g
s~\s+$~~
