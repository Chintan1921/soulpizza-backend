const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");
const User = require("./user");
const Store = require("./store");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
      allowNull: false,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

CartItem.belongsTo(User, { foreignKey: "user_id", as: "user" });
CartItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
CartItem.belongsTo(Store, { foreignKey: "store_id", as: "store" });

module.exports = CartItem;
