#!/bin/bash

set -e

IFS=", "

DATE=$(date +%A)
newstr=$(echo $NO_COMMITS | sed 's/\[//g' )    # remove [
newstr2=$(echo $newstr | sed 's/\]//g' )     # remove ]

set -o noglob                                # disable glob
set -- $newstr2                              # split+glob with glob disabled.

ndates=( $(printf '"%s"\n' $@) )
inarray=$(echo ${ndates[@]} | grep -iwo ${DATE} | wc -w)

echo ${ndates[@]}

if ! [ "$inarray" -eq 0 ] ; then
   echo "Found"
else
   echo "Not Found"
fi
