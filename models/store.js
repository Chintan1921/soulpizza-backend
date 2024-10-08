const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Store = sequelize.define(
  "Store",
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
    owner_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pickup_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    gluten_free_price: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery_options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    payment_options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    open_close_timings: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    delivery_charge: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    //TODO: store card details
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Store;
