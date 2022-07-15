#!/bin/sed -nurf
# -*- coding: UTF-8, tab-width: 2 -*-

\|^(\xEF\xBB\xBF)?/\*jslint indent: 2, maxlen: 80\b|b maybe_pmb

: copy
  p;n
b copy

: maybe_pmb
  p;n
  \|^\/\*|b maybe_pmb
  \|^\(+typeof (define) =+ .(function).\) \&+ \1\.amd \? \1 : \2 \(|!b copy
: maybe_pmb_umd_header
  N
  /\n\S/!b maybe_pmb_umd_header
  s~^.*\n\}\)(\(function \((|\/\*[^*\n]+\*\/)\) \{)$~define\1~
b copy
