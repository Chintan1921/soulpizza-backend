const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Material = sequelize.define(
    "Material",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        material: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        timestamps: true,
        paranoid: true,
    }
);

module.exports = Material;