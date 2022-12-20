#!/bin/bash
set -e

curl https://api.meetup.com/hackrva-meetup/events | jq > events.json
./js/update-database.js events.json
./js/extract-events.js --autodate  > monthly-json/email.json
./js/email-merge.js monthly-json/email.json > html/email.html
open html/email.html