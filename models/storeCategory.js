const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const ProductCategory = require("./productCategory");
const Store = require("./store");

const StoreCategory = sequelize.define(
  "StoreCategory",
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
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: ProductCategory,
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

Store.belongsToMany(ProductCategory, {
  through: "StoreCategories",
  as: "categories",
  otherKey: "category_id",
  foreignKey: "store_id",
});

ProductCategory.belongsToMany(Store, {
  through: "StoreCategories",
  as: "products",
  otherKey: "store_id",
  foreignKey: "category_id",
});

StoreCategory.belongsTo(Store, { foreignKey: "store_id" });
StoreCategory.belongsTo(ProductCategory, {
  foreignKey: "category_id",
  as: "productCategory",
});

Store.hasMany(StoreCategory, { foreignKey: "store_id" });
module.exports = StoreCategory;
