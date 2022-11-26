# hackrva-communications

This app creates a newsletter from the Meetup.com calendar.

Events are stored in the `./data/hackrva.sqlite` file.

## Usage

* edit the `newsletter.json` file to update the values month, welcomeImageURL, mindate, and maxdate
```json 
    "month": "December",
    "welcomeImageURL": "december.png",
    "mindate": "2022-12-01",
    "maxdate": "2022-12-31",
```
* ensure there is a file in `html/<monthname>.png` for the banner
* run: `./scripts/make-newsletter.sh <monthname>`
  * NOTE: the `monthname` is a double-check that you've updated the `newsletter.json` file

## Results

* The output HTML is in the `html/<monthname>.html` folder
* Upload both the html and png files to the HackRVA.org wiki "Media" area
* Create a Post which points to the `<monthname`>.html` URL in the "Media" area

## Design Notes

### Getting the Meetup Events
* `curl https://api.meetup.com/hackrva-meetup/events | jq > events.json`
* This command 
  * calls the Web Service routine from Meetup.com
  * formats it with `jq` (which is optional)
  * stores it in `events.json`
* Meetup will send a year's worth of events that have not occurred in the past

### Updating the database
* `./js/update-database.js events.json`
* This Command
  * reads the `events.json`
  * adds each record to the `data/hackrva.sqlite` flat-file database table
* NOTE: It will overrite existing records with the same Meetup-event-id.
* If you do this twice a month, all the old and new events will be stored
* Meaning that updating the newsletter will work, and you can regenerate old newsletters

### Extract the events from the local database
* `./js/extract-events.js  > monthly-json/$month.json`
* This Command
  * gets the `mindate` and `maxdate` from the `newsletter.json` file
  * queries the `Event` table from `data/hackrva.sqlite`
  * writes the event records to `monthly-json/$month.json` for the particular month

### Merge the month's events into an HTML file
* `./js/newsletter-merge.js monthly-json/$month.json > html/$month.html`
* This Command
  * combines the parts of the HTML template from the `template/` folder
  * replaces `{{fieldname}}` fields with values from each event in the `monthly-json/$month.json` file
  * writes the output to the `html/$month.html`

### Display the output in a browser for your inspection
* `open html/$month.html`
* This Command
  * is Mac-specific
  * You'll have to change it for other OSs
  * Or just double-click on the resulting `html/$month.html` file

## Folder Structure
* data/ - holds the `sqlite3` database
* html/*.html - the resultant monthly newsletters are stored here
* html/*.png - the monthly 'header' .png files go here, too
* js/ - javascript files
  * models/ - table definition for the tables. (Event.js)
* monthly-json/ - temporary storage for each month's events in JSON format
* scripts/ - bash shell scripts
* template/ - html fragments for the newsletter's HTML
  * NOTE: the files are joined in alphabetical order
  * NOTE: the `event-header.htm` and `event.htm` have `{{macro}}` fields that are expanded for each event


