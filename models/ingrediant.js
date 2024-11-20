const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ingrediant = sequelize.define(
  "Ingrediant",
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: false,
    },
  },
  {
    tableName: "Ingrediants",
    timestamps: true,
    paranoid: true,
  }
);

class IngrediantWithGetters extends Ingrediant {
  get is_required() {
    return this.ProductIngrediants?.is_required ?? null;
  }
}

module.exports = IngrediantWithGetters;
