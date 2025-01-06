const express = require("express");
require("dotenv").config();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const logger = require("morgan");

const api = require("./routes");
const db = require("./config/db");

var app = express();
app.use(logger("dev"));
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());
app.use("/api", api);
// Authenticating Sequelize instance
db.authenticate()
  .then(() => {
    db.sync()
      .then(() => {
        console.log("Connection has been established successfully.");
      })
      .catch((error) => {
        console.error("Unable to connect to the database:", error);
      });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = app;
