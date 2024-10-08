const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Address = require("./address");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

User.hasMany(Address, { foreignKey: "user_id" });
module.exports = User;
