const { Sequelize } = require("sequelize");
const env = process.env.NODE_ENV || "development";
// const config = require("./config")[env];
const { DB_HOST, DB_PORT, DB_NAME, DB_USER } = process.env;
const DB_PASSWORD = process.env.DB_PASSWORD || "";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true, // SSL mode is required
      rejectUnauthorized: false, // This option is set to false to allow self-signed certificates
    },
  },
});

module.exports = sequelize;
