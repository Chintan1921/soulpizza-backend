const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");
const User = require("./user");
const Order = require("./order");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Order,
        key: "id",
      },
      allowNull: false,
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
    price: {
      type: DataTypes.FLOAT,
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

OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });

OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

module.exports = OrderItem;
