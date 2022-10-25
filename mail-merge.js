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

let topTemplates = ["00a-head.htm", "00b-body.htm", "01-preheader.htm", "02-header.htm", "03-welcome.htm"];
let bottomTemplates = ["05-cta.htm", "06-social.htm", "07-footer.htm", "99-end.htm"];
let tocTemplate = "template/03a-toc.htm";
let eventeHeaderTemplate = "template/04a-event-header.htm";
let eventTemplate = "template/04b-event.htm";

let output = [];

function die(s) {
    console.error(s);
    process.exit(2);
}

function outputTemplates(lines, templates) {
    for (let template of templates) {
        let line = gfiles.read("./template/" + template);
        if (line == null) die(template);
        lines.push(line);
    }
}
function merge(lines, values) {
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        for (let key of Object.keys(values)) {
            let value = values[key];
            line = gstrings.replaceAll(line, "[{][{]" + key + "[}][}]", value);
        }
        lines[i] = line;
    }
    return lines;
}

function translateEvent(event, values) {
    pageInfo = {};
    pageInfo.eventId = event.id;
    pageInfo.month = values.month;
    pageInfo.blogURL = values.blogURL;
    pageInfo.eventTitle = event.name;
    pageInfo.eventDescription = cleanText(event.description);
    pageInfo.eventPrice = event.price;
    pageInfo.eventURL = event.link;
    let edate = new Date(event.date + "T" + event.time);
    pageInfo.eventDOW = strftime("%A", edate);
    pageInfo.eventDate = strftime('%B %e, %Y', edate);;
    pageInfo.eventTime = strftime('%l:%M %p', edate);
    if (event.is_online_event) pageInfo.eventLocation = "This is an ONLINE event";
    else if (event.venue) pageInfo.eventLocation = event.venue.name + "<br>" + event.venue.address_1 + "<br>" + event.venue.city + ", " + event.venue.state + " " + event.venue.zip;
    else pageInfo.eventLocation = "HackRVA";
    return pageInfo;
}

function cleanText(s) {
    s = gstrings.replaceAll(s, "\n", "<p>")
    return s;
}

function makeTOC(events) {
    let toc = "<ul>";
    for(let event of events) {
        let edate = new Date(event.date + "T" + event.time);
        let eventDate = strftime('%B %e, %Y', edate);;
        toc += "<li><a href='#" + event.id + "'>" + event.name + " (" + eventDate + ")</li>";
    }
    toc += "</ul>";
    return toc;
}

async function main$(_opts) {
    let opts = _opts || gprocs.args("", "infile*");
    let events = gfiles.readJSON(opts.infile);
    let values = gfiles.readJSON("./values.json");
    outputTemplates(output, topTemplates);
    let toc = gfiles.read(tocTemplate);
    let tocs = merge([toc], {toc: makeTOC(events)});
    output.push(tocs[0]);
    let lastDate = "";
    for(let event of events) {
        let eventValues = translateEvent(event, values);
        let date = event.date;
        if (date !== lastDate) {
            lastDate = date;
            let header = gfiles.read(eventeHeaderTemplate);
            let headers = merge([header], eventValues);
            output.push(headers[0]);
        }
        let template = gfiles.read(eventTemplate);
        let templates = merge([template], eventValues);
        output.push(templates[0]);
    }
    outputTemplates(output, bottomTemplates);
    merge(output, values);

    for(let line of output) {
        console.log(line);
    }
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
