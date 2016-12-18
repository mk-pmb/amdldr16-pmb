#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
BAKEPATH="$(readlink -m "$BASH_SOURCE"/..)"


function bake_cli_main () {
  cd "$BAKEPATH"/.. || return $?
  source "$BAKEPATH"/lib_kitchen_sink.sh --lib || return $?

  local -A CFG
  CFG[dist-dir]='dist'
  CFG[pkg-name]="$(nodejs -p 'require("./package.json").name')"
  [ -n "${CFG[pkg-name]}" ] || return 4$(
    echo 'E: unable to detect package name' >&2)

  cfg_detect_uglify || return $?

  rm -- "${CFG[dist-dir]:-.}"/*.js 2>/dev/null
  bake_receipe README.md || return $?
  return 0
}


function bake_receipe () {
  local SRC_FN="$1"
  local R_STEPS=()
  readarray -t R_STEPS < <(sed -rf "$BAKEPATH"/read-receipes.sed -- "$SRC_FN")
  local R_STEP=
  local DEST_FN=
  local SRC_SPEC=
  local INCL_FN=
  local BAKE_ADJUST_ONCE=()
  for R_STEP in "${R_STEPS[@]}"; do
    case "$R_STEP" in
      '' ) continue;;
      destfn:* )
        [ -n "$DEST_FN" ] && bake_report_finished_file "$DEST_FN"
        DEST_FN="${CFG[dist-dir]}/${R_STEP#*:}"
        echo "I: Gonna bake $DEST_FN"
        echo -n $'\xEF\xBB\xBF' >"$DEST_FN" || return $?
        continue;;    # ^-- UTF-8 BOM
      add:npm:* )
        SRC_SPEC="${R_STEP#*:}"
        R_STEP="${SRC_SPEC#*:}"
        INCL_FN="$(node_resolve "$R_STEP")"
        [ -n "$R_STEP" ] || return 3$(
          echo "E: failed to npm-resolve '$R_STEP'" >&2)
        bake_add_js "$INCL_FN" >>"$DEST_FN" || return $?
        continue;;
      add:dist/* )
        SRC_SPEC="${R_STEP#*:}"
        strip_bom "$SRC_SPEC.js" >>"$DEST_FN" || return $?
        continue;;
      add:build/* | \
      add:lib/* )
        SRC_SPEC="${R_STEP#*:}"
        bake_add_js "$SRC_SPEC.js" >>"$DEST_FN" || return $?
        continue;;
      add:qfx:chainloader.autostart )
        BAKE_ADJUST_ONCE+=( -e 's~\b[A-Za-z0-9]+\.autoInstall~true~g' )
        continue;;
    esac
    echo "E: unknown receipe step: '$R_STEP'"; return 8
  done
  [ -n "$DEST_FN" ] && bake_report_finished_file "$DEST_FN"
  return 0
}


function bake_report_finished_file () {
  local FN="$1"
  local HR_SIZE="$(du --apparent-size --human-readable -- "$FN")"
  local ENT_TAB=$'\t'
  HR_SIZE="${HR_SIZE%% *}"
  HR_SIZE="${HR_SIZE%%$ENT_TAB*}"
  local F_TYPE="$(file --brief -- "$FN")"
  echo "I: Finished $FN$ENT_TAB${HR_SIZE:-?size?}$ENT_TAB${F_TYPE:-?type?}"
}


function bake_add_js () {
  local SRC_FN="$1"
  [ -f "$SRC_FN" ] || return 4$(echo "E: $FUNCNAME: 404 $SRC_FN" >&2)
  echo
  if [ "$BAKE_ADDJS" == raw ]; then
    cat -- "$SRC_FN"
    return $?
  fi
  bake_should_minify "$SRC_FN"
  local MINIFY=$?
  case "$MINIFY" in
    0 ) MINIFY=bake_minify_js;;
    1 ) MINIFY=strip_bom;;
    * ) echo "E: failed to guess whether to minify $SRC_FN" >&2; return 4;;
  esac
  "$MINIFY" "$SRC_FN" | bake_adjust_minified_js
  maxrv "${PIPESTATUS[@]}"; return $?
}


function bake_should_minify () {
  local SRC_FN="$1"
  local SRC_HEAD="$(head --bytes=4K -- "$SRC_FN")"

  <<<"$SRC_HEAD" grep -qPe '[a-z]' || return 2$(
    echo "E: strange source: no lowercase letter in head of $SRC_FN" >&2)

  local MAX_LL="$(<<<"$SRC_HEAD" wc --max-line-length)"
  [ -n "$MAX_LL" ] || return 2
  [ "$MAX_LL" -gt 128 ] && return 1   # probably minified already

  # <<<"$SRC_HEAD" grep -qPe '/\*[je]s[lh]int ' && return 0
  # <<<"$SRC_HEAD" grep -qFe '/* -*- ' && return 0
  return 0
}


function bake_adjust_minified_js () {
  local FIRST_BLKCMT='^(/\*[^\r]+\*/\r|)'
  local AMD_MOD_SPEC="${SRC_SPEC:-E_NO_SRC_SPEC}"
  case "$AMD_MOD_SPEC" in
    /* ) ;;
    [a-z]* )
      # AMD_MOD_SPEC="${AMD_MOD_SPEC%.js}.js"
      AMD_MOD_SPEC="${CFG[pkg-name]}/$AMD_MOD_SPEC"
      ;;
  esac
  LANG=C sed -nre '
    s~^/\*+ *(version:)~/* '"${SRC_SPEC:-E_NO_SRC_SPEC}"' | \1~
    : copy_remainder
      $s~$~\n~
      p;n
    b copy_remainder
    ' | LANG=C sed -re '
    :read_all
    $!{N;b read_all}

    s~((^|\n)/\*)(\s|\*)*( @[A-Za-z0-9 ]*[A-Za-z0-9]|)(\s|\*)*~\1\4 ~g
    s~(\s|\*)*(\*/)\n~ \2\r~g
    s~'"$FIRST_BLKCMT"';*((define\(|\(|)function)\b~\1;\2~
    s~'"$FIRST_BLKCMT"';*(define\()(function)\b~\1;\2"'"$AMD_MOD_SPEC"'", \3~

    s~\n((/| *)\*)~\r\1~g
    s~([,;:{}()])\n~\1~g
    s~\n~ ~g

    s~^\s+~~
    s~\r~\n~g
    s~\s+\n~\n~g    # however, keep whitespace after \n: comment indentation
    s~\s*$~~
    ' | sed -re '' "${BAKE_ADJUST_ONCE[@]}"
  BAKE_ADJUST_ONCE=()
  maxrv "${PIPESTATUS[@]}"; return $?
}


function bake_minify_js () {
  cmdnl "${CFG[uglify-cmdnl]}" "$@"
}















[ "$1" == --lib ] && return 0; bake_cli_main "$@"; exit $?
