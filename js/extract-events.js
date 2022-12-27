#!/usr/bin/env node

/** 
 * template for a main.js file
 **/

const glstools = require('glstools');
const gfiles = glstools.files;
const gprocs = glstools.procs;
const strftime = require('strftime') // not required in browsers
const config = require("./config.js");
const Models = require('./models/index.js');
let models;

async function main$(_opts) {
    let opts = _opts || gprocs.args("--autodate", "");
    let newsletterConfig = gfiles.readJSON("newsletter.json");
    let now = new Date();
    models = await Models(config);
    if ((!newsletterConfig.mindate) || opts.autodate) {
        let month = now.getMonth()+1;
        let day = now.getDate();
        let year = now.getFullYear();
        let then = new Date(`${year}-${month}-01`);
        then = new Date(then.getTime() + 5 * 3600 * 1000); // adjust for EST
        newsletterConfig.mindate = strftime('%Y-%m-%d', then);
    }
    if ((!newsletterConfig.maxdate) || opts.autodate) {
        let month = now.getMonth()+1;
        let day = now.getDate();
        let year = now.getFullYear();
        let then = new Date(`${year}-${month}-31`)
        if (day > 18) then = new Date(then.getTime() + 14 * 24 * 3600 * 1000)
        then = new Date(then.getTime() + 5 * 3600 * 1000); // adjust for EST
        newsletterConfig.maxdate = strftime('%Y-%m-%d', then);
    }
    console.error(newsletterConfig)
    let events = await models.Event.findByDateRange$(newsletterConfig.mindate, newsletterConfig.maxdate);
    console.log(JSON.stringify(events, null, 2));
}

module.exports = { main$ }

if (module.id === ".") {
    return main$();
}
