const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const StoreProduct = require("./storeProduct");
const User = require("./user");

const Favorite = sequelize.define(
  "Favorite",
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
    store_product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: StoreProduct,
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

User.belongsToMany(StoreProduct, {
  through: "Favorites",
  as: "storeProducts",
  otherKey: "store_product_id",
  foreignKey: "user_id",
});

StoreProduct.belongsToMany(User, {
  through: "Favorites",
  as: "users",
  otherKey: "user_id",
  foreignKey: "store_product_id",
});

Favorite.belongsTo(StoreProduct, { foreignKey: "store_product_id", as: "storeProduct" });

module.exports = Favorite;
