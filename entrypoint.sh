#!/bin/bash

set -e

normalize() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z]//g'
}

function basic() {
  echo $MODE
  IFS=", "
  DATE=$(date +%A)
  NO_COMMITS=$(echo $NO_COMMITS | sed 's/\[//g' )
  NO_COMMITS=$(echo $newstr | sed 's/\]//g' )

  set -o noglob
  set -- $NO_COMMITS

  ndates=( $(printf '"%s"\n' $@) )
  inarray=$(echo ${ndates[@]} | grep -iwo ${DATE} | wc -w)
  if ! [ "$inarray" -eq 0 ] ; then
    echo "No commit."
  else
    # cd /app && npm install --production && npm start
    cd /app; npm install --production; npm start
  fi
}

function realistic() {
  echo $MODE
  SHUFFLE=$(shuf -i 0-1 -n1)
  if [ $SHUFFLE -eq 0 ]; then
    cd /app; npm install --production; npm start
  else
    echo "No commit."
  fi
}

function run() {
  MODE="$(normalize "$MODE")"
  if [[ $MODE == "realistic" ]]; then
    realistic "$@"
  elif [[ $MODE == "basic" ]]; then
    basic "$@"
  else
    echo "Please specify your preferred mode to run."
  fi
}

run "${@:-.}"
