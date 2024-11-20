const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");
const Ingrediant = require("./ingrediant");

const ProductIngrediant = sequelize.define(
  "ProductIngrediant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    ingrediant_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Ingrediant,
        key: "id",
      },
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        include: ["is_required"],
      },
    },
  }
);

ProductIngrediant.belongsTo(Ingrediant, { foreignKey: "ingrediant_id" });
ProductIngrediant.belongsTo(Product, { foreignKey: "product_id" });

module.exports = ProductIngrediant;
