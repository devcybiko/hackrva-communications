#!/usr/bin/env node

/** 
 * template for a main.js file
 **/

const glstools = require('glstools');
const gprocs = glstools.procs;
const gstrings = glstools.strings;
const gfiles = glstools.files;
const strftime = require('strftime') // not required in browsers

let tocTemplate = "template/widget.htm";

let output = [];

function die(s) {
    console.error(s);
    process.exit(2);
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

function makeTOC(events) {
    let toc = "";
    let now = new Date();
    for(let event of events) {
        let edate = new Date(event.eventDate + "T" + event.eventTime);
        let month = strftime("%m", edate).trim();
        let day = strftime("%d", edate).trim();
        let hour = strftime("%l", edate).trim();
        let mins = strftime('%M', edate).trim();
        let ampm = strftime("%P", edate).trim();
        let eventName = event.eventName.replaceAll(/[:].*/g, "");
        let eventDate;
        if (mins == '000') eventDate = `${month}/${day} ${hour}${ampm}`;
        else eventDate = `${month}/${day} ${hour}${mins}${ampm}`;
        if (now.getTime() > edate.getTime()) {
            toc += `${eventDate}: <b>${eventName}</b><br>`;
        } else {
            toc += `${eventDate}: <a target=meetup href='${event.eventURL}'>${eventName}</a><br>`;
        }
    }
    toc = toc.replaceAll("HackRVA", "");
    toc = toc.replaceAll("Monthly", "");
    toc = toc.replaceAll("!", "");
    toc = toc.replaceAll(/[(].*[)]/g, "");
    return toc;
}

async function main$(_opts) {
    let opts = _opts || gprocs.args("", "infile*");
    let events = gfiles.readJSON(opts.infile);
    let toc = gfiles.read(tocTemplate);
    let tocs = merge([toc], {toc: makeTOC(events)});
    output.push(tocs[0]);

    for(let line of output) {
        console.log(line);
    }
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
