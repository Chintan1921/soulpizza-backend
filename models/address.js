const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./product");

const Address = sequelize.define(
  "Address",
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
    },
    street: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING(11),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Address.belongsTo(User, { foreignKey: "user_id" });

module.exports = Address;
