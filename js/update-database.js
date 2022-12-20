#!/usr/bin/env node

/** 
 * template for a main.js file
 **/

const glstools = require('glstools');
const gprocs = glstools.procs;
const gstrings = glstools.strings;
const gfiles = glstools.files;
const fs = require("fs");
const path = require("path");
const strftime = require('strftime') // not required in browsers
const config = require("./config.js");
const Models = require('./models/index.js');
let models;

function deleteKeys(obj, keys) {
    let result = Object.assign({}, obj || {});
    for(let key of keys) {
        if (key in result) delete result[key];
    }
    return result;
}
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
        currentEvent.json = {venue: deleteKeys(event.venue, ["id", "lat", "lon", "repinned"])};
        let item = await models.Event.update$(currentEvent);
        if (item.error) {
            console.error("ERROR: ", item, currentEvent);
        }
    }
}
async function main$(_opts) {
    let opts = _opts || gprocs.args("", "infile*");
    let events = gfiles.readJSON(opts.infile);
    let now = new Date();
    models = await Models(config);

    if (!opts.mindate) {
        /// is this needed now?
        opts.mindate = strftime('%Y-%m-%d', now);
    }
    if (!opts.maxdate) {
        /// is this needed now?
        opts.maxdate = strftime('%Y-%m-%d', new Date(now.getTime() + 31 * 24 * 3600 * 1000));
    }
    await updateDatabase$(events);
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
