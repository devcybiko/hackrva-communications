let config = {
    sequelize: {
        dialect: 'sqlite',
        storage: 'data/hackrva.sqlite',
        logging: false,
        force: false, // true === drops the table first
        query: { raw: true },
        freezeTableName: true
    }
}

module.exports = config;