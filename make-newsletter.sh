#!/bin/bash
set -e

mindate=$1
maxdate=$2
month=$3

if [[ "$month" == "" ]]; then
    echo
    echo "make-newsletter.sh <mindate> <maxdate> <month-name>"
    echo
    exit 1
fi

set +e
grep -i $month values.json > /dev/null
status=$?
set -e

if [[ "$status" != "0" ]]; then
    echo
    echo "Did you update values.json?"
    echo
    exit 1
fi

curl https://api.meetup.com/hackrva-meetup/events | jq > events.json
extract-events.js --mindate=$mindate --maxdate=$maxdate events.json > $month.json
mail-merge.js $month.json > $month.html
aws-put devcybiko $month.html hackrva/$month.html
aws-put devcybiko $month.png hackrva/$month.png
echo "http://devcybiko.net/hackrva/$month.html"