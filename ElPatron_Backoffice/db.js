const DbConfig = require('./config').db;
const { Sequelize } = require('sequelize');
const logger = require('debug')('SERVER:sequelize');
const appointmentModel = require('./models/citaModel')


/**
 * DB connection setup
 */
const sequelize = new Sequelize(DbConfig.name, DbConfig.user,DbConfig.password, {
    host: DbConfig.host,
    port: DbConfig.port,
    dialect: DbConfig.dialect,
    define: {
        timestamps: false
    },
    logging: msg => logger(msg)
});


const Cita = appointmentModel(sequelize,Sequelize)


/**
 * Uncomment this in order to generate table
 */
sequelize.sync().then(logger('DB is synced'));

module.exports = {Cita};