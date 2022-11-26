/**
 * This "driver" module will iterate across all the .js files, looking for files
 * that begin with an upper case letter. That will be instanciated as a 'new' class
 * and added to the 'sequelize' object and returned.
 * 
 * Adding a new table to the system is a matter of adding a new .js file
 * with the table name (Table.js) that extends the 'Model' class as 'required' in
 * 'modelClass.js'.
 */

const { Sequelize } = require("sequelize");
const glstools = require("glstools");
const gfiles = glstools.files;

// const log = console.log
const log = function() {}

async function readAllModels(config) {
    let sequelize = new Sequelize(config.sequelize);
    await sequelize.authenticate();
    let exports = {sequelize};
    for (let file of gfiles.readDir(__dirname)) {
        log("models:index:23", file);
        // if (!file) continue;
        if (!file.endsWith(".js") || file[0].toLowerCase() === file[0]) continue; // must start with uppercase
        log("models:index:26", file);
        // if (file === "index.js") continue;
        let modelFname = __dirname + "/" + file;
        log("models:index:29", modelFname);
        const tableClass = require(modelFname);
        log("models:index:31", tableClass);
        const tableModel = new tableClass(sequelize);
        log("models:index:33", tableModel);
        await tableModel.sync$();
        log("models:index:35", tableModel.tableName);
        exports[tableModel.tableName] = tableModel;
        log("models:index:37", tableModel);
    }
    await sequelize.sync();
    sequelize.debugFunction = function (fn = console.log) { this.options.logging = fn };
    return exports;
}

module.exports = readAllModels