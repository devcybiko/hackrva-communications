const SESEmailService = require("./SESEmailService.js")
const glstools = require('glstools');
const gprocs = glstools.procs;
const gstrings = glstools.strings;
const gfiles = glstools.files;
const strftime = require('strftime') // not required in browsers

async function main$() {
    let opts = gprocs.args("--to=greg@agilewriters.com,--meetup", "infile*");
    let newsletterConfig = gfiles.readJSON("newsletter.json");
    let html = gfiles.read(opts.infile);
    if (!html) gprocs.die("Missing file: " + opts.infile);
    if (opts.meetup) {
        opts.to = newsletterConfig.meetupEmail;
    }
    let email = new SESEmailService(newsletterConfig);
    await email.init$();
    await email.send$(newsletterConfig.ses.replyToAddress, opts.to, "HackRVA Newsletter", html, newsletterConfig.email);
}

main$();