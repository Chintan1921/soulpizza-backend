const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");
const Store = require("./store");

const ComboDeal = sequelize.define(
  "ComboDeal",
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
      allowNull: false,
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Store,
        key: "id",
      },
      allowNull: false,
    },
    deal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    crust_type: {
      type: DataTypes.ENUM("deep_pan", "thin"),
      allowNull: true,
    },
    size: {
      type: DataTypes.ENUM("small", "large"),
      allowNull: true,
    },
    gluten_free: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    ingrediants: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },

  {
    timestamps: true,
    paranoid: true,
  }
);

ComboDeal.belongsTo(Product, { foreignKey: "product_id", as: "product" });
ComboDeal.belongsTo(Store, { foreignKey: "store_id", as: "store" });

module.exports = ComboDeal;
