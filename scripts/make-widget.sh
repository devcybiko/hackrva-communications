#!/bin/bash
set -e

curl https://api.meetup.com/hackrva-meetup/events | jq > events.json
./js/update-database.js events.json
./js/extract-events.js --autodate  > monthly-json/widget.json
./js/widget-merge.js monthly-json/widget.json > html/widget.html
aws-put devcybiko html/widget.html hackrva/widget.html
