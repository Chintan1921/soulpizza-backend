const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

ProductCategory.addScope(
  "defaultScope",
  {
    order: [["id", "ASC"]],
  },
  { override: true }
);

module.exports = ProductCategory;
