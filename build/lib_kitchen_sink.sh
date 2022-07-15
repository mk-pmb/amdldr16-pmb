#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-


function node_resolve () {
  nodejs -p 'require.resolve(process.argv[1])' "$1"
}


function maxrv () {
  local MAX=0
  local NUM=
  for NUM in "$@"; do
    [ "$NUM" -gt "$MAX" ] && MAX="$NUM"
  done
  return "$MAX"
}


function strip_bom () {
  LANG=C sed -re '1s~^\xEF\xBB\xBF\n?~~' -- "$@"; return $?
}


function cmdnl () {
  local CMD=( "$1" ); shift
  [ -n "$CMD" ] || return 2$(echo "E: no command given" >&2)
  readarray -t CMD <<<"${CMD[0]}"
  "${CMD[@]}" "$@"
  return $?
}


function cfg_detect_uglify () {
  local UGLIFY=( "$(node_resolve uglify-js/bin/uglifyjs)" )
  [ -x "${UGLIFY[0]}" ] || return 3$(echo "E: unable to find uglify" >&2)
  UGLIFY+=(
    # --support-ie8
    --mangle
    --compress
    # --lint
    --verbose
    --comments      # preserve @license comments
    -- )
  CFG[uglify-cmdnl]="$(printf '%s\n' "${UGLIFY[@]}")"
}















return 0
