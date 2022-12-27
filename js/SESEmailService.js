const AWS = require("aws-sdk");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const _emailCommandTemplate = {
    Destination: {
        CcAddresses: [],
        ToAddresses: [],
    },
    Message: {
        Body: {
            Html: {
                Charset: "UTF-8",
                Data: "HTML_FORMAT_BODY",
            },
            Text: {
                Charset: "UTF-8",
                Data: "TEXT_FORMAT_BODY",
            },
        },
        Subject: {
            Charset: "UTF-8",
            Data: "EMAIL_SUBJECT",
        },
    },
    Source: "FROM ADDRESS",
    ReplyToAddresses: [],
};

class SESService {
    constructor(config) {
        this.config = config.ses;
        this.className = "SESService";
        this.debug = false;
    }
    async init$(context) {
        this._awsCredentials();
        return this;
    }
    log(...args) {
        console.log(...args);
    }
    _awsCredentials() {
        let awsCredentials = this.config.credentials;
        this.log("awsCredentials: ", awsCredentials);
        if (typeof awsCredentials === "string") AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: awsCredentials });
        else if (typeof awsCredentials === "object" && awsCredentials.profile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ credentials: awsCredentials });
        else throw "unknown credentials - supply a string or object {profile:'string'}";
        this.log("AWS.config.credentials", AWS.config.credentials);
        this.client = new SESClient(AWS.config);
    }
    async send$(fromAddress, toAddress, subject, htmlMessage, replyToAddress) {
        _emailCommandTemplate.Destination.ToAddresses = [toAddress];
        _emailCommandTemplate.Source = fromAddress;
        _emailCommandTemplate.ReplyToAddresses = [replyToAddress || this.config.replyToAddress || fromAddress];
        _emailCommandTemplate.Message.Body.Html.Data = htmlMessage;
        _emailCommandTemplate.Message.Subject.Data = subject;
        this.log(55, _emailCommandTemplate);

        const sendEmailCommand = new SendEmailCommand(_emailCommandTemplate);
        const result = await this.client.send(sendEmailCommand);
        return result;
    }
}

module.exports = SESService;