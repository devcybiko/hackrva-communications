// const log = console.log;
function log() {};
const JsonDefaults = require('./jsonDefaults.js')
const Sequelize = require("sequelize");

let options = {
    freezeTableName: true,
    logging: false,
    timestamps: false,
    hooks: {
    }
};

class Model {
    constructor(sequelize, tableName, tableDef, jsonDefaults, timestamps=false) {
        log("modelClass:13", tableName, tableDef, jsonDefaults)
        this._tableName = tableName;
        this.tableDef = tableDef;
        // this.tableDef.active = Sequelize.TEXT;
        // if 'true' the value is required, if false, value is removed, else the value is used if not present
        this.jsonDefaults = jsonDefaults ? new JsonDefaults(jsonDefaults): null;
        options.timestamps=timestamps;
        this.table = sequelize.define(tableName, tableDef, options);
    }
    get tableName() {
        return this._tableName;
    }
    async sync$(options = {}) {
        await this.table.sync(options)
    }
    async purgeCreatedAt$(timeout=3600) {
        let now = new Date();
        let then = new Date(now.getTime() - timeout * 1000);
        let where = {
            createdAt: {
              [Sequelize.Op.lt]: then
            }
          };
        let result = await this.table.destroy({ where });
        log("Session:purgeCreatedAt$", result);
        return result;
    }
    async purgeUpdatedAt$(timeout=3600) {
        let now = new Date();
        let then = new Date(now.getTime() - timeout * 1000);
        let where = {
            createdAt: {
              [Sequelize.Op.lt]: then
            }
          };
        let result = await this.table.destroy({ where });
        return result;
    }
    async update$(row, where) {
        log(32, row, where)
        // row.json is expected to be 'dict' on input, and on output
        let errors = this.jsonDefaults ? this.jsonDefaults.isBadJson(row.json) : "";
        if (errors.length) return { error: errors.join("\n") };
        let newRow = Object.assign({}, row);
        if (this.jsonDefaults) newRow.json = JSON.stringify(newRow.json);
        let [item, created] = await this.table.findOrCreate({ where, defaults: newRow });
        if (created) {
            item = item.dataValues;
        } else {
            newRow.id = item.id;
            await this.table.update(newRow, { where });
            item = newRow;
        }
        if (this.jsonDefaults) item.json = JSON.parse(item.json);
        return item;
    }
    async delete$(where) {
        let items = await this.table.destroy({ where });
        return items;
    }
    async findOne$(where) {
        // row.json is expected to be an object on input, and on output
        let row = await this.table.findOne({ where });
        if (row && this.jsonDefaults) row.json = JSON.parse(row.json);
        return row;
    }
    async findAll$(where = {}, order = []) {
        let items = await this.table.findAll({ where , order });
        if (this.jsonDefaults) {
            for (let item of items) {
                item.json = JSON.parse(item.json);
            }
        }
        return items;
    }
}

module.exports = Model;
