const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Product = require("./product");
const Store = require("./store");

const StoreProduct = sequelize.define(
  "StoreProduct",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    store_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Store,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Store.belongsToMany(Product, {
  through: "StoreProducts",
  as: "stores",
  otherKey: "product_id",
  foreignKey: "store_id",
});

Product.belongsToMany(Store, {
  through: "StoreProducts",
  as: "products",
  otherKey: "store_id",
  foreignKey: "product_id",
});

Store.belongsToMany(Product, {
  through: "StoreProducts",
  as: "products",
  otherKey: "product_id",
  foreignKey: "store_id",
});

Product.belongsToMany(Store, {
  through: "StoreProducts",
  as: "stores",
  otherKey: "store_id",
  foreignKey: "product_id",
});

StoreProduct.belongsTo(Store, { foreignKey: "store_id" });
StoreProduct.belongsTo(Product, { foreignKey: "product_id" });

Store.hasMany(StoreProduct, { foreignKey: "store_id" });

module.exports = StoreProduct;
