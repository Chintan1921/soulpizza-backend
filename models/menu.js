const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Menu = sequelize.define(
    "Menu",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            // autoIncrement: true,
        },
        pdf: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Menu;