const Sequelize = require("sequelize");
const Model = require("./modelClass.js");

// const log = console.log;
function log() {};

let tableName = "Event";
let tableDef = {
    eventId: Sequelize.TEXT,
    eventName: Sequelize.TEXT,
    eventDescription: Sequelize.TEXT,
    eventPrice: Sequelize.TEXT,
    eventURL: Sequelize.TEXT,
    eventDate: Sequelize.TEXT,
    eventTime: Sequelize.TEXT,
    eventIsOnline: Sequelize.TEXT,
    json: Sequelize.TEXT
};
let jsonDefaults = {
    venue: {
        "name": "HackRVA Makerspace",
        "address_1": "1600E Roseneath Rd",
        "city": "Richmond",
        "country": "us",
        "localized_country_name": "USA",
        "zip": "23230",
        "state": "VA"
    }
};

class Event extends Model {
    constructor(sequelize) {
        super(sequelize, tableName, tableDef, jsonDefaults);
    }
    async update$(row) {
        // create if eventId is new
        // update if eventId already exists
        let where = { eventId: row.eventId }
        delete where.json;
        let item = await super.update$(row, where);
        return item;
    }
    async findByDateRange$(mindate, maxdate) {
        return await this.findAll$({
            eventDate: {
                [Sequelize.Op.gte]: mindate,
                [Sequelize.Op.lte]: maxdate,
            }
        }, ['eventDate', 'eventTime']);
    }
}

module.exports = Event;
