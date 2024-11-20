const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");
const Store = require("./store");

const Order = sequelize.define(
  "Order",
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
      allowNull: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Store,
        key: "id",
      },
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("in-progress", "delivered"),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("delivery", "pickup"),
      allowNull: true,
    },
    pickup_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    delivery_charge: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    discount: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    gluten_free_price: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_printed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Order.belongsTo(User, { foreignKey: "user_id", as: "user" });
Order.belongsTo(Store, { foreignKey: "store_id", as: "store" });

module.exports = Order;
