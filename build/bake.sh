#!/bin/bash
# -*- coding: utf-8, tab-width: 2 -*-
BAKEPATH="$(readlink -m "$BASH_SOURCE"/..)"


function bake_cli_main () {
  local BAKE_FUNC="$1"; shift
  cd "$BAKEPATH"/.. || return $?
  source "$BAKEPATH"/lib_kitchen_sink.sh --lib || return $?

  local -A CFG
  CFG[dist-dir]='dist'
  CFG[pkg-name]="$(nodejs -p 'require("./package.json").name')"
  [ -n "${CFG[pkg-name]}" ] || return 4$(
    echo 'E: unable to detect package name' >&2)

  cfg_detect_uglify || return $?

  case "$BAKE_FUNC" in
    readme | '' )
      rm -- "${CFG[dist-dir]:-.}"/*.js 2>/dev/null
      bake_receipe README.md || return $?
      return $?;;
  esac

  bake_"$BAKE_FUNC" "$@"
  return $?
}


function bake_sed () {
  local SED_OPT="$1"; shift
  local SED_SCRIPT="$1"; shift
  local SED_RV=
  if [ "${SED_BFN:0:1}" != $'\n' ]; then
    SED_SCRIPT="$(cat -- "$BAKEPATH/$SED_SCRIPT.sed")"
    [ -n "$SED_SCRIPT" ] || return 4
  fi

  local SLOT_NAMES=()
  readarray -t SLOT_NAMES < <(<<<"$SED_SCRIPT" grep -oPe '<\^[^<>]+>' | sort -u)
  local SLOT=
  for SLOT in "${SLOT_NAMES[@]}"; do
    SLOT="${SLOT#<\^}"
    SLOT="${SLOT%>}"
    SED_SCRIPT="${SED_SCRIPT//<\^$SLOT>/${SED_SLOTS[$SLOT]}}"
  done

  LANG=C sed -"${SED_OPT#-}"rf <(echo "$SED_SCRIPT") "$@"
  SED_RV=$?
  [ "$SED_RV" == 0 ] && return 0
  <<<"$SED_SCRIPT" nl -ba >&2
  echo "W: $FUNCNAME rv=$SED_RV @ ln ${BASH_LINENO[*]}" >&2
  return "$SED_RV"
}


function bake_receipe () {
  local SRC_FN="$1"
  local R_STEPS=()
  readarray -t R_STEPS < <(bake_sed - read-receipes -- "$SRC_FN")
  bake_steps "${R_STEPS[@]}"
  return $?
}


function bake_steps () {
  local R_STEP=
  local DEST_FN=
  local SRC_SPEC=
  local INCL_FN=
  local BAKE_ADJUST_ONCE=()
  for R_STEP in "$@"; do
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

  "$MINIFY" "$SRC_FN"
  return $?
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


function bake_minify_js () {
  local SRC_FN="$1"; shift

  local MOD_SPEC="$SRC_SPEC"
  case "$MOD_SPEC" in
    '' ) MOD_SPEC="E_NO_SRC_SPEC";;
    /* ) ;;
    npm:* ) MOD_SPEC="${MOD_SPEC#*:}";;
    [a-z]* ) MOD_SPEC="${CFG[pkg-name]}/$MOD_SPEC";;
  esac
  local -A SED_SLOTS
  SED_SLOTS['blkcmt#1']='^(/\*[^\r]+\*/\r|)'
  SED_SLOTS['modspec']="$MOD_SPEC"

  local BAO=( "${BAKE_ADJUST_ONCE[@]}" )
  BAKE_ADJUST_ONCE=()

  bake_sed -n minify.strip-umd-head-pmb -- "$SRC_FN" \
    | cmdnl "${CFG[uglify-cmdnl]}" 2> >(LANG=C sed -urf <(echo '
      /^INFO: Collapsing [A-Za-z]+ /d
      /^INFO: Dropping declaration of variable /d
      /^INFO: Dropping duplicated definition of variable /d
      /^INFO: Dropping unused function /d
      p') >&2) \
    | bake_sed -n minify.adj-src-spec \
    | bake_sed -  minify.adj-wrapfuncs \
    | LANG=C sed -re '' "${BAO[@]}"
  maxrv "${PIPESTATUS[@]}"; return $?
}















[ "$1" == --lib ] && return 0; bake_cli_main "$@"; exit $?
