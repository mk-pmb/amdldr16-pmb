#!/bin/sed -nurf
# -*- coding: UTF-8, tab-width: 2 -*-

s~^/\*+ *(version:)~/* '"${SRC_SPEC:-E_NO_SRC_SPEC}"' | \1~
: copy_remainder
  $s~$~\n~
  p;n
b copy_remainder
