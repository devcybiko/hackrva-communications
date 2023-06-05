#!/usr/bin/env node

/** 
 * template for a main.js file
 **/

const glstools = require('glstools');
const gprocs = glstools.procs;
const gstrings = glstools.strings;
const gfiles = glstools.files;
const strftime = require('strftime') // not required in browsers
const fetch = require('node-fetch');

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
    pageInfo.eventId = event.eventId;
    pageInfo.month = values.month;
    pageInfo.blogURL = values.blogURL;
    pageInfo.eventTitle = event.eventName;
    pageInfo.eventDescription = cleanText(event.eventDescription);
    pageInfo.eventPrice = event.eventPrice;
    pageInfo.eventURL = event.eventURL;
    let edate = new Date(event.eventDate + "T" + event.eventTime);
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

async function makeTOC(events) {
    let toc = "<ul>";
    for(let event of events) {
        let goodURL = await checkURL(event.eventURL);
        if (!goodURL) continue;
        let edate = new Date(event.eventDate + "T" + event.eventTime);
        let eventDate = strftime('%B %e, %Y', edate);;
        toc += "<li><a href='#" + event.eventId + "'>" + event.eventName + " (" + eventDate + ")</li>";
    }
    toc += "</ul>";
    return toc;
}

async function checkURL(url) {
    console.error("Checking...", url);
    let settings = { method: "Get" };
    let response = await fetch(url, settings);
    return response.status === 200;
}

async function main$(_opts) {
    let opts = _opts || gprocs.args("", "infile*");
    let events = gfiles.readJSON(opts.infile);
    let newsletterConfig = gfiles.readJSON("./newsletter.json");
    outputTemplates(output, topTemplates);
    let toc = gfiles.read(tocTemplate);
    let tocs = merge([toc], {toc: await makeTOC(events)});
    output.push(tocs[0]);
    let lastDate = "";
    for(let event of events) {
        let eventValues = translateEvent(event, newsletterConfig);
        let date = event.eventDate;
        let goodURL = await checkURL(eventValues.eventURL)
        if (!goodURL) continue;
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
    merge(output, newsletterConfig);

    for(let line of output) {
        console.log(line);
    }

    console.error(`
    *** WORDPRESS BLOG POST***
    
    Direct Link: <a href="{URL}">${newsletterConfig.month} Newsletter</a>

    <iframe src="{URL}" title="HackRVA ${newsletterConfig.month} Newsletter" width="100%" height="1000px"></iframe>`)
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
