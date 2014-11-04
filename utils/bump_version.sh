#!/bin/bash
VER="$1"

if [[ "x${VER}" = "x" ]]
then
    echo "Usage: $0 <version number>"
    echo " e.g. $0 0.1.0"
    exit 1
fi

function inplace_sed {
    # Note: we don't use sed -i -e ... because it isn't supported by FreeBSD
    # sed on OS X.
    local command="$1"; shift
    local suffix=".inplace.bak"
    sed -i"${suffix}" -e "${command}" "$@"
    for filename in "$@"; do
        rm "${filename}${suffix}"
    done
}

SHORT_VER=`echo "${VER}" | sed -e "s/\.[^.]*$//"`

package_sed="s/\([\"']version[\"'][ ]*:[ ]*[\"']\)\(.*\)\([\"'].*\)/\1${VER}\3/"

inplace_sed "${package_sed}" package.json
inplace_sed "s/^\(release[ ]*=[ ]*[\"']\)\(.*\)\([\"'].*\)/\1${VER}\3/" docs/conf.py
inplace_sed "s/^\(version[ ]*=[ ]*[\"']\)\(.*\)\([\"'].*\)/\1${SHORT_VER}\3/" docs/conf.py

git add package.json docs/conf.py
