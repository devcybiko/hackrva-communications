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
var strftime = require('strftime') // not required in browsers

async function main$(_opts) {
    let opts = _opts || gprocs.args("--maxdate=,--mindate=", "infile*");
    let events = gfiles.readJSON(opts.infile);
    let now = new Date();
    let today = strftime('%Y-%m-%d', now);
    if (!opts.mindate) {
        opts.mindate = strftime('%Y-%m-%d', now);
    }
    if (!opts.maxdate) {
        opts.maxdate = strftime('%Y-%m-%d', new Date(now.getTime() + 31 * 24 * 3600 * 1000));
    }
    let currentEvents = [];
    for (let event of events) {
        if (opts.mindate <= event.local_date && event.local_date <= opts.maxdate) {
            let currentEvent = {};
            currentEvent.id = event.id;
            currentEvent.name = event.name;
            currentEvent.date = event.local_date;
            currentEvent.time = event.local_time;
            currentEvent.is_online_event = event.is_online_event;
            currentEvent.link = event.link;
            currentEvent.price = event.fee ? event.fee.amount : "free";
            currentEvent.description = event.description;
            currentEvent.venue = event.venue;
            currentEvents.push(currentEvent);
        }
    }
    console.log(JSON.stringify(currentEvents, null, 2))
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
