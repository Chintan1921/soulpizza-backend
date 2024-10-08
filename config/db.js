const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("./config.json")[env];
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

const sequelize = new Sequelize(
  DB_NAME || config.database,
  DB_USER || config.username,
  DB_PASSWORD || config.password,
  {
    host: DB_HOST || config.host,
    port: DB_PORT || config.port,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true, // SSL mode is required
        rejectUnauthorized: false // This option is set to false to allow self-signed certificates
      }
    }
  }
);



module.exports = sequelize;
