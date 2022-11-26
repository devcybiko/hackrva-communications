#!/usr/bin/env node

/** 
 * template for a main.js file
 **/

const glstools = require('glstools');
const gfiles = glstools.files;
const strftime = require('strftime') // not required in browsers
const config = require("./config.js");
const Models = require('./models/index.js');
let models;

async function updateDatabase$(events) {
    for (let event of events) {
        let currentEvent = {};
        currentEvent.eventId = event.id;
        currentEvent.eventName = event.name;
        currentEvent.eventDate = event.local_date;
        currentEvent.eventTime = event.local_time;
        currentEvent.eventIsOnline = event.is_online_event;
        currentEvent.eventURL = event.link;
        currentEvent.eventPrice = event.fee ? event.fee.amount : "free";
        currentEvent.eventDescription = event.description;
        currentEvent.json = {};
        let venue = event.venue;
        if (venue) {
            if (venue.id) delete venue.id;
            if (venue.lat) delete venue.lat;
            if (venue.lon) delete venue.lon;
            if (venue.repinned) delete venue.repinned;
            currentEvent.json = {venue};
        }
        let item = await models.Event.update$(currentEvent);
        if (item.error) {
            console.error("ERROR: ", item);
        }
    }
}
async function main$(_opts) {
    let newsletterConfig = gfiles.readJSON("newsletter.json");
    let now = new Date();
    models = await Models(config);
    if (!newsletterConfig.mindate) {
        newsletterConfig.mindate = strftime('%Y-%m-%d', now);
    }
    if (!newsletterConfig.maxdate) {
        newsletterConfig.maxdate = strftime('%Y-%m-%d', new Date(now.getTime() + 31 * 24 * 3600 * 1000));
    }
    let events = await models.Event.findByDateRange$(newsletterConfig.mindate, newsletterConfig.maxdate);
    console.log(JSON.stringify(events, null, 2));
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
