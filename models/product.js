const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const ProductCategory = require("./productCategory");
const Ingrediant = require("./ingrediant");
const Store = require("./store");
const Material = require("./material");

const Product = sequelize.define(
  "Product",
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
    category_id: {
      type: DataTypes.INTEGER,
      references: {
        model: ProductCategory,
        key: "id",
      },
    },
    sub_category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    label_color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("enabled", "disabled"),
      allowNull: false,
      defaultValue: "enabled",
    },
    spicy: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // comboDeal: {
    //   type: DataTypes.BOOLEAN,
    //   defaultValue: false,
    //   allowNull: true,
    // },
    // comboItems: {
    //   type: DataTypes.ARRAY(DataTypes.INTEGER),
    //   defaultValue: [],
    //   allowNull: true,
    // },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

Product.belongsToMany(Ingrediant, {
  through: "ProductIngrediants",
  as: "ingrediants",
  otherKey: "ingrediant_id",
  foreignKey: "product_id",
});

Ingrediant.belongsToMany(Product, {
  through: "ProductIngrediants",
  as: "products",
  otherKey: "product_id",
  foreignKey: "ingrediant_id",
});

Product.belongsTo(ProductCategory, {
  foreignKey: "category_id",
  as: "productCategory",
});

Product.belongsToMany(Store, {
  through: "StoreProducts",
  as: "ownedStores",
  otherKey: "store_id",
  foreignKey: "product_id",
});

Product.belongsTo(Material, {
  foreignKey: "material_id",
  as: "productMaterial",
});

module.exports = Product;
