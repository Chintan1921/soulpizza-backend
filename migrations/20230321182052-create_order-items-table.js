"use strict";

const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable("OrderItems", {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        order_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              tableName: "Orders",
            },
            key: "id",
          },
          allowNull: false,
        },
        user_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              tableName: "Users",
            },
            key: "id",
          },
          allowNull: false,
        },
        product_id: {
          type: Sequelize.DataTypes.INTEGER,
          references: {
            model: {
              tableName: "Products",
            },
            key: "id",
          },
          allowNull: false,
        },
        crust_type: {
          type: Sequelize.DataTypes.ENUM("deep_pan", "thin"),
          allowNull: true,
        },
        size: {
          type: Sequelize.DataTypes.ENUM("small", "large"),
          allowNull: true,
        },
        gluten_free: {
          type: Sequelize.DataTypes.BOOLEAN,
          allowNull: true,
        },
        ingrediants: {
          type: Sequelize.DataTypes.JSON,
          allowNull: true,
        },
        quantity: {
          type: Sequelize.DataTypes.INTEGER,
          allowNull: true,
        },
        price: {
          type: Sequelize.DataTypes.FLOAT,
          allowNull: true,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
        deletedAt: Sequelize.DATE,
      });
    } catch (error) {
      console.log(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderItems");
  },
};
