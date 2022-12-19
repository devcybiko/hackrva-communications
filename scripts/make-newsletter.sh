#!/bin/bash
set -e

month=$1;

if [[ "$month" == "" ]]; then
    echo
    echo "make-newsletter.sh <month-name>"
    echo
    exit 1
fi

set +e
grep -i $month newsletter.json > /dev/null
status=$?
set -e

if [[ "$status" != "0" ]]; then
    echo
    echo "Did you update newsletter.json?"
    echo
    exit 1
fi

curl https://api.meetup.com/hackrva-meetup/events | jq > events.json
./js/update-database.js events.json
./js/extract-events.js  > monthly-json/$month.json
./js/newsletter-merge.js monthly-json/$month.json > html/$month.html
./scripts/make-widget.sh
open html/$month.html